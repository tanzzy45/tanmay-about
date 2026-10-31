import type { MergedPr } from '../../src/lib/github';

/**
 * Two work sessions, in merge order. Times are UTC.
 *
 *            first commit   opened   merged
 *   #1   30 Oct   14:24     14:30    14:34
 *        (no work overnight)
 *   #2   31 Oct   06:18     06:24    06:26
 *   #3   31 Oct   06:22     06:27    06:32
 *   #4   31 Oct   06:25     06:33    06:43
 *
 * #2, #3 and #4 were all being worked on from 06:25 to 06:26, but each one opened after
 * the one before it merged, so no two of them were ever open at once.
 * Agent time is 14:24–14:34 (10m) plus 06:18–06:43 (25m): 35m.
 */
export const mergedPrs: MergedPr[] = [
  pr(1, 'feat: build the About Me page', '2026-10-30', '14:24', '14:30', '14:34'),
  pr(2, 'feat: render the field report', '2026-10-31', '06:18', '06:24', '06:26'),
  pr(3, 'feat: render the build log', '2026-10-31', '06:22', '06:27', '06:32'),
  pr(4, 'ci: add CI and the deploy', '2026-10-31', '06:25', '06:33', '06:43'),
];

/** A merged PR. `firstCommit`, `opened` and `merged` are `HH:MM`, UTC, on `day`. */
export function pr(
  number: number,
  title: string,
  day: string,
  firstCommit: string,
  opened: string,
  merged: string,
): MergedPr {
  return {
    number,
    title,
    url: `https://github.com/owner/site/pull/${number}`,
    branch: `ticket-${number}`,
    filesChanged: number * 2,
    additions: number * 40,
    deletions: number * 3,
    ci: 'passed',
    firstCommitAt: `${day}T${firstCommit}:00Z`,
    openedAt: `${day}T${opened}:00Z`,
    mergedAt: `${day}T${merged}:00Z`,
  };
}
