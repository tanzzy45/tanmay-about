/**
 * Build-time GitHub data for the #build-log board.
 *
 * Runs once, during `astro build`, so the page ships no JS for it. `loadBuildLog`
 * never throws: any failed request becomes a fallback result, so a GitHub outage
 * or rate limit can't fail the build.
 */

const API = 'https://api.github.com';
const REPO_PATTERN = /^[\w.-]+\/[\w.-]+$/;
const TIMEOUT_MS = 10_000;
// 100 PRs per page. The cap stops a bad `Link` header from looping forever.
const MAX_PAGES = 10;

// The parts of GitHub's REST responses this file reads.

interface GitHubPullSummary {
  number: number;
  merged_at: string | null;
}

interface GitHubPull {
  number: number;
  title: string;
  html_url: string;
  created_at: string;
  changed_files: number;
  additions: number;
  deletions: number;
  head: { ref: string; sha: string };
}

export interface GitHubCheckRun {
  status: 'queued' | 'in_progress' | 'completed' | 'waiting' | 'requested' | 'pending';
  conclusion:
    | 'success'
    | 'failure'
    | 'neutral'
    | 'cancelled'
    | 'skipped'
    | 'timed_out'
    | 'action_required'
    | 'stale'
    | 'startup_failure'
    | null;
}

interface GitHubCheckRuns {
  check_runs: GitHubCheckRun[];
}

export interface GitHubCombinedStatus {
  state: 'success' | 'failure' | 'pending';
  total_count: number;
}

interface GitHubCommit {
  commit: {
    author: { date: string } | null;
    committer: { date: string } | null;
  };
}

// What the board renders.

export type CiResult = 'passed' | 'failed' | 'pending' | 'none';

export interface MergedPr {
  number: number;
  title: string;
  url: string;
  branch: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  ci: CiResult;
  /** ISO 8601. The earliest commit on the PR's branch. */
  firstCommitAt: string;
  /** ISO 8601. */
  openedAt: string;
  /** ISO 8601. */
  mergedAt: string;
}

export interface BuildLogStats {
  merged: number;
  /** The most PRs being worked on at the same moment. */
  agentsWorkingAtOnce: number;
  /** Time covered by at least one PR's active window. `null` when nothing has been merged. */
  agentTimeMs: number | null;
}

export type BuildLog =
  | { ok: true; repo: string; pullsUrl: string; prs: MergedPr[]; stats: BuildLogStats }
  | { ok: false; repo: string | null; pullsUrl: string | null };

export interface LoadBuildLogOptions {
  /** `owner/name`. Defaults to `GITHUB_REPO`. */
  repo?: string | undefined;
  /** Optional. Defaults to `GITHUB_TOKEN`; raises the rate limit from 60 to 5,000 requests an hour. */
  token?: string | undefined;
  fetch?: typeof fetch;
}

export async function loadBuildLog({
  repo = process.env.GITHUB_REPO,
  token = process.env.GITHUB_TOKEN,
  fetch: fetchImpl = fetch,
}: LoadBuildLogOptions = {}): Promise<BuildLog> {
  const name = repo?.trim();
  if (!name || !REPO_PATTERN.test(name)) {
    console.warn('[build-log] GITHUB_REPO is not set to "owner/name". Showing the fallback.');
    return { ok: false, repo: null, pullsUrl: null };
  }

  const pullsUrl = `https://github.com/${name}/pulls`;
  try {
    const gh = new GitHubClient(name, token?.trim() || undefined, fetchImpl);
    const prs = await fetchMergedPrs(gh);
    return { ok: true, repo: name, pullsUrl, prs, stats: computeStats(prs) };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`[build-log] GitHub request failed. Showing the fallback. ${reason}`);
    return { ok: false, repo: name, pullsUrl };
  }
}

/**
 * The board's summary numbers, from each PR's active window: its first commit up to
 * (not including) its merge. Here an agent opens its PR once the work is done and PRs
 * merge one at a time, so open-to-merge windows would hide work that ran in parallel.
 *
 * `agentsWorkingAtOnce` is the most windows overlapping at one moment. A window that
 * starts the moment another ends doesn't overlap it.
 * `agentTimeMs` is the windows' total length once joined together: overlapping work
 * counts once, and the time between work sessions (overnight, say) not at all.
 */
export function computeStats(prs: readonly MergedPr[]): BuildLogStats {
  // +1 when a window starts, -1 when it ends. On a tie the end goes first.
  const events = prs
    .map(activeWindow)
    .filter((window) => window.end > window.start)
    .flatMap(({ start, end }) => [
      { at: start, delta: 1 },
      { at: end, delta: -1 },
    ])
    .sort((a, b) => a.at - b.at || a.delta - b.delta);

  let working = 0;
  let agentsWorkingAtOnce = 0;
  let agentTimeMs = 0;
  let busySince = 0;
  for (const { at, delta } of events) {
    if (working === 0) busySince = at;
    working += delta;
    if (working === 0) agentTimeMs += at - busySince;
    agentsWorkingAtOnce = Math.max(agentsWorkingAtOnce, working);
  }

  return {
    merged: prs.length,
    agentsWorkingAtOnce,
    agentTimeMs: prs.length > 0 ? agentTimeMs : null,
  };
}

/** Epoch ms. A commit dated after the merge (a skewed clock) leaves the window empty. */
function activeWindow(pr: MergedPr): { start: number; end: number } {
  const end = Date.parse(pr.mergedAt);
  return { start: Math.min(Date.parse(pr.firstCommitAt), end), end };
}

const FAILED_CONCLUSIONS = new Set<GitHubCheckRun['conclusion']>([
  'failure',
  'timed_out',
  'cancelled',
  'action_required',
  'startup_failure',
]);

/** One CI verdict per commit, from check runs (GitHub Actions, most apps) and commit statuses. */
export function ciResult(checkRuns: readonly GitHubCheckRun[], status: GitHubCombinedStatus): CiResult {
  const results: CiResult[] = checkRuns.map((run) => {
    if (run.status !== 'completed') return 'pending';
    return FAILED_CONCLUSIONS.has(run.conclusion) ? 'failed' : 'passed';
  });
  // The combined state reads "pending" when no status was ever posted, so skip it then.
  if (status.total_count > 0) {
    results.push(status.state === 'success' ? 'passed' : status.state === 'pending' ? 'pending' : 'failed');
  }

  if (results.includes('failed')) return 'failed';
  if (results.includes('pending')) return 'pending';
  return results.length > 0 ? 'passed' : 'none';
}

async function fetchMergedPrs(gh: GitHubClient): Promise<MergedPr[]> {
  const summaries = await gh.getAll<GitHubPullSummary>('/pulls?state=closed&per_page=100');
  const merged = summaries.filter((pr): pr is GitHubPullSummary & { merged_at: string } => pr.merged_at !== null);
  const prs = await Promise.all(merged.map((pr) => fetchMergedPr(gh, pr.number, pr.merged_at)));
  return prs.sort((a, b) => Date.parse(a.mergedAt) - Date.parse(b.mergedAt));
}

async function fetchMergedPr(gh: GitHubClient, number: number, mergedAt: string): Promise<MergedPr> {
  // The list endpoint leaves out file and line counts, so each PR needs its own request.
  const { data: pr } = await gh.get<GitHubPull>(`/pulls/${number}`);
  const [checks, status, firstCommitAt] = await Promise.all([
    gh.get<GitHubCheckRuns>(`/commits/${pr.head.sha}/check-runs?per_page=100`),
    gh.get<GitHubCombinedStatus>(`/commits/${pr.head.sha}/status`),
    fetchFirstCommitDate(gh, number),
  ]);

  return {
    number: pr.number,
    title: pr.title,
    url: pr.html_url,
    branch: pr.head.ref,
    filesChanged: pr.changed_files,
    additions: pr.additions,
    deletions: pr.deletions,
    ci: ciResult(checks.data.check_runs, status.data),
    // A merged PR always has commits; the open time only covers a response with no dates.
    firstCommitAt: firstCommitAt ?? pr.created_at,
    openedAt: pr.created_at,
    mergedAt,
  };
}

/**
 * The earliest commit on a PR's branch. The list is oldest first, but a rebase can leave
 * author dates out of order, so this takes the minimum. The author date is when the work
 * was written; the committer date changes on every rebase, so it's only a fallback.
 */
async function fetchFirstCommitDate(gh: GitHubClient, number: number): Promise<string | undefined> {
  const commits = await gh.getAll<GitHubCommit>(`/pulls/${number}/commits?per_page=100`);
  let earliest: string | undefined;
  for (const { commit } of commits) {
    const date = commit.author?.date ?? commit.committer?.date;
    if (date && (!earliest || Date.parse(date) < Date.parse(earliest))) earliest = date;
  }
  return earliest;
}

interface GitHubResponse<T> {
  data: T;
  /** URLs from the `Link` header, keyed by `rel` (`next`, `last`, ...). */
  links: Partial<Record<string, string>>;
}

class GitHubClient {
  private readonly repo: string;
  private readonly fetchImpl: typeof fetch;
  private readonly headers: Record<string, string>;

  constructor(repo: string, token: string | undefined, fetchImpl: typeof fetch) {
    this.repo = repo;
    this.fetchImpl = fetchImpl;
    this.headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'tanmay-about-build-log',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /** `path` is relative to the repo (`/pulls`), or a full API URL taken from a `Link` header. */
  async get<T>(path: string): Promise<GitHubResponse<T>> {
    const url = path.startsWith('/') ? `${API}/repos/${this.repo}${path}` : path;
    // Link URLs come back from GitHub. Checking them keeps the token on api.github.com.
    if (!url.startsWith(`${API}/`)) throw new Error(`Refusing to request ${url}`);

    const response = await this.fetchImpl(url, {
      headers: this.headers,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`GET ${url}: ${response.status} ${response.statusText}`);
    return { data: (await response.json()) as T, links: parseLinkHeader(response.headers.get('link')) };
  }

  /** Follows `rel="next"` links and concatenates the pages. */
  async getAll<T>(path: string): Promise<T[]> {
    const items: T[] = [];
    let next: string | undefined = path;
    for (let page = 0; next && page < MAX_PAGES; page++) {
      const response: GitHubResponse<T[]> = await this.get<T[]>(next);
      items.push(...response.data);
      next = response.links.next;
    }
    return items;
  }
}

function parseLinkHeader(header: string | null): Partial<Record<string, string>> {
  const links: Partial<Record<string, string>> = {};
  for (const part of header?.split(',') ?? []) {
    const match = /<([^>]+)>;\s*rel="([^"]+)"/.exec(part);
    if (match?.[1] && match[2]) links[match[2]] = match[1];
  }
  return links;
}
