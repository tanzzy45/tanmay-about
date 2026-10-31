import type { MergedPr } from '../../src/lib/github';

export const firstCommitAt = '2026-10-30T09:00:00Z';

/**
 * Five merged PRs, in merge order:
 *
 *   09:00  first commit
 *   #1     09:30 ── 10:00
 *   #2              10:00 ─────────── 12:00
 *   #3                 10:15 ── 11:00
 *   #4                    10:30 ──────────── 13:30
 *   #5                                  12:30 ──────── 14:45
 *
 * #2, #3 and #4 are all open from 10:30 to 11:00, so the most open at once is 3.
 * #2 opens the moment #1 merges, which doesn't count as overlapping.
 */
export const mergedPrs: MergedPr[] = [
  pr(1, 'feat: build the About Me page', '09:30', '10:00'),
  pr(2, 'feat: render the build log', '10:00', '12:00'),
  pr(3, 'fix: nav overflow at 375px', '10:15', '11:00'),
  pr(4, 'feat: add the field report page', '10:30', '13:30'),
  pr(5, 'chore: add a favicon', '12:30', '14:45'),
];

function pr(number: number, title: string, opened: string, merged: string): MergedPr {
  return {
    number,
    title,
    url: `https://github.com/owner/site/pull/${number}`,
    branch: `ticket-${number}`,
    filesChanged: number * 2,
    additions: number * 40,
    deletions: number * 3,
    ci: 'passed',
    openedAt: `2026-10-30T${opened}:00Z`,
    mergedAt: `2026-10-30T${merged}:00Z`,
  };
}
