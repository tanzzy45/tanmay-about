import { describe, expect, it } from 'vitest';
import { computeStats } from '../src/lib/github';
import { firstCommitAt, mergedPrs } from './fixtures/merged-prs';

const HOUR = 3_600_000;
const MINUTE = 60_000;

describe('computeStats', () => {
  it('counts the merged PRs', () => {
    expect(computeStats(mergedPrs, firstCommitAt).merged).toBe(5);
  });

  it('finds the most PRs open at the same time', () => {
    expect(computeStats(mergedPrs, firstCommitAt).mostOpenAtOnce).toBe(3);
  });

  it("doesn't count a PR that opens the moment another merges as overlapping", () => {
    const [first, second] = mergedPrs;
    expect(computeStats([first!, second!], firstCommitAt).mostOpenAtOnce).toBe(1);
  });

  it('measures from the first commit to the last merge', () => {
    // 09:00 first commit to 14:45, when #5 merged.
    expect(computeStats(mergedPrs, firstCommitAt).firstCommitToLiveMs).toBe(5 * HOUR + 45 * MINUTE);
  });

  it("doesn't depend on the order of the input", () => {
    expect(computeStats([...mergedPrs].reverse(), firstCommitAt)).toEqual(computeStats(mergedPrs, firstCommitAt));
  });

  it('returns zeros and no duration when nothing has been merged', () => {
    expect(computeStats([], firstCommitAt)).toEqual({ merged: 0, mostOpenAtOnce: 0, firstCommitToLiveMs: null });
  });
});
