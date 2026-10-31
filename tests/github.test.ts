import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ciResult, loadBuildLog } from '../src/lib/github';

const API = 'https://api.github.com';
const REPO = `${API}/repos/owner/site`;

type Route = { body: unknown; status?: number; link?: string };

/** A `fetch` that answers from a URL -> response table and records what it was asked. */
function fakeFetch(routes: Record<string, Route>) {
  const calls: { url: string; headers: Record<string, string> }[] = [];
  const fetch: typeof globalThis.fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, headers: (init?.headers ?? {}) as Record<string, string> });
    const route = routes[url];
    if (!route) return new Response('Not Found', { status: 404 });
    return new Response(JSON.stringify(route.body), {
      status: route.status ?? 200,
      headers: route.link ? { link: route.link } : {},
    });
  };
  return { fetch, calls };
}

const noChecks = { body: { total_count: 0, check_runs: [] } };
const noStatuses = { body: { state: 'pending', total_count: 0 } };

function pull(number: number, createdAt: string) {
  return {
    body: {
      number,
      title: `PR ${number}`,
      html_url: `https://github.com/owner/site/pull/${number}`,
      created_at: createdAt,
      changed_files: number,
      additions: number * 10,
      deletions: number,
      head: { ref: `branch-${number}`, sha: `sha${number}` },
    },
  };
}

const routes: Record<string, Route> = {
  [`${REPO}/pulls?state=closed&per_page=100`]: {
    body: [
      { number: 3, merged_at: '2026-10-30T12:00:00Z' },
      { number: 2, merged_at: null },
    ],
    link: `<${API}/repositories/1/pulls?state=closed&per_page=100&page=2>; rel="next"`,
  },
  [`${API}/repositories/1/pulls?state=closed&per_page=100&page=2`]: {
    body: [{ number: 1, merged_at: '2026-10-30T11:00:00Z' }],
  },
  [`${REPO}/pulls/1`]: pull(1, '2026-10-30T10:00:00Z'),
  [`${REPO}/pulls/3`]: pull(3, '2026-10-30T10:30:00Z'),
  [`${REPO}/commits/sha1/check-runs?per_page=100`]: {
    body: { total_count: 1, check_runs: [{ status: 'completed', conclusion: 'success' }] },
  },
  [`${REPO}/commits/sha1/status`]: noStatuses,
  [`${REPO}/commits/sha3/check-runs?per_page=100`]: noChecks,
  [`${REPO}/commits/sha3/status`]: { body: { state: 'failure', total_count: 1 } },
  [`${REPO}/commits?per_page=1`]: {
    body: [{ commit: { author: { date: '2026-10-30T12:00:00Z' }, committer: null } }],
    link: `<${API}/repositories/1/commits?per_page=1&page=9>; rel="last"`,
  },
  [`${API}/repositories/1/commits?per_page=1&page=9`]: {
    body: [{ commit: { author: { date: '2026-10-30T09:00:00Z' }, committer: null } }],
  },
};

describe('loadBuildLog', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds one card per merged PR, oldest merge first, across pages', async () => {
    const { fetch } = fakeFetch(routes);
    const log = await loadBuildLog({ repo: 'owner/site', token: '', fetch });

    expect(log.ok).toBe(true);
    if (!log.ok) return;
    expect(log.pullsUrl).toBe('https://github.com/owner/site/pulls');
    expect(log.prs).toEqual([
      {
        number: 1,
        title: 'PR 1',
        url: 'https://github.com/owner/site/pull/1',
        branch: 'branch-1',
        filesChanged: 1,
        additions: 10,
        deletions: 1,
        ci: 'passed',
        openedAt: '2026-10-30T10:00:00Z',
        mergedAt: '2026-10-30T11:00:00Z',
      },
      expect.objectContaining({ number: 3, branch: 'branch-3', ci: 'failed', mergedAt: '2026-10-30T12:00:00Z' }),
    ]);
    // First commit 09:00 (the last page of commits) to the last merge at 12:00.
    expect(log.stats).toEqual({ merged: 2, mostOpenAtOnce: 2, firstCommitToLiveMs: 3 * 3_600_000 });
  });

  it('sends the token only when one is set', async () => {
    const withToken = fakeFetch(routes);
    await loadBuildLog({ repo: 'owner/site', token: 'secret', fetch: withToken.fetch });
    expect(withToken.calls.every((call) => call.headers.Authorization === 'Bearer secret')).toBe(true);

    const withoutToken = fakeFetch(routes);
    await loadBuildLog({ repo: 'owner/site', token: '', fetch: withoutToken.fetch });
    expect(withoutToken.calls.some((call) => 'Authorization' in call.headers)).toBe(false);
  });

  it('falls back with a link to the PR list when GitHub returns an error', async () => {
    const { fetch } = fakeFetch({
      ...routes,
      [`${REPO}/pulls?state=closed&per_page=100`]: { body: { message: 'API rate limit exceeded' }, status: 403 },
    });
    await expect(loadBuildLog({ repo: 'owner/site', token: '', fetch })).resolves.toEqual({
      ok: false,
      repo: 'owner/site',
      pullsUrl: 'https://github.com/owner/site/pulls',
    });
  });

  it('falls back when the network request itself fails', async () => {
    const fetch: typeof globalThis.fetch = () => Promise.reject(new TypeError('fetch failed'));
    const log = await loadBuildLog({ repo: 'owner/site', token: '', fetch });
    expect(log).toMatchObject({ ok: false, pullsUrl: 'https://github.com/owner/site/pulls' });
  });

  it('falls back without calling GitHub when the repo is missing or malformed', async () => {
    for (const repo of ['', 'not-a-repo', 'owner/site/extra']) {
      const { fetch, calls } = fakeFetch(routes);
      expect(await loadBuildLog({ repo, token: '', fetch })).toEqual({ ok: false, repo: null, pullsUrl: null });
      expect(calls).toHaveLength(0);
    }
  });
});

describe('ciResult', () => {
  const none = { state: 'pending', total_count: 0 } as const;

  it('reports no CI when nothing ran, even though the combined status reads pending', () => {
    expect(ciResult([], none)).toBe('none');
  });

  it('passes when every check passed or was skipped', () => {
    const runs = [
      { status: 'completed', conclusion: 'success' },
      { status: 'completed', conclusion: 'skipped' },
    ] as const;
    expect(ciResult(runs, { state: 'success', total_count: 1 })).toBe('passed');
  });

  it('fails if any check run or commit status failed', () => {
    expect(ciResult([{ status: 'completed', conclusion: 'timed_out' }], none)).toBe('failed');
    expect(ciResult([{ status: 'in_progress', conclusion: null }], { state: 'failure', total_count: 1 })).toBe(
      'failed',
    );
  });

  it('is pending while a check is still running', () => {
    expect(ciResult([{ status: 'in_progress', conclusion: null }], { state: 'success', total_count: 1 })).toBe(
      'pending',
    );
  });
});
