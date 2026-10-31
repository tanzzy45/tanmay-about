import { describe, expect, it } from 'vitest';
import { computeStats } from '../src/lib/github';
import { mergedPrs, pr } from './fixtures/merged-prs';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

describe('computeStats', () => {
  it('counts the merged PRs', () => {
    expect(computeStats(mergedPrs).merged).toBe(4);
  });

  describe('agents working at once', () => {
    it('counts PRs whose commits overlap, even when their open windows never did', () => {
      // Measured from when each PR opened, #2, #3 and #4 never overlap.
      const fromOpening = mergedPrs.map((merged) => ({ ...merged, firstCommitAt: merged.openedAt }));
      expect(computeStats(fromOpening).agentsWorkingAtOnce).toBe(1);

      // From their first commits, all three were being worked on from 06:25 to 06:26.
      expect(computeStats(mergedPrs).agentsWorkingAtOnce).toBe(3);
    });

    it("doesn't count a PR whose first commit lands the moment another merges as overlapping", () => {
      const prs = [
        pr(1, 'first', '2026-10-30', '09:00', '09:40', '10:00'),
        pr(2, 'second', '2026-10-30', '10:00', '10:40', '11:00'),
      ];
      expect(computeStats(prs)).toEqual({ merged: 2, agentsWorkingAtOnce: 1, agentTimeMs: 2 * HOUR });
    });
  });

  describe('agent time', () => {
    it('adds up two work sessions and leaves out the long gap between them', () => {
      // 14:24–14:34 on 30 Oct, then 06:18–06:43 on 31 Oct. The 16 hours in between don't count.
      expect(computeStats(mergedPrs).agentTimeMs).toBe(35 * MINUTE);
    });

    it('counts time when several PRs were being worked on only once', () => {
      // #2, #3 and #4 take 8m, 10m and 18m on their own; together they cover 06:18–06:43.
      expect(computeStats(mergedPrs.slice(1)).agentTimeMs).toBe(25 * MINUTE);
    });

    it('leaves out a PR whose first commit is dated after its merge', () => {
      const skewedClock = pr(5, 'skewed clock', '2026-10-31', '07:30', '07:00', '07:10');
      expect(computeStats([...mergedPrs, skewedClock])).toEqual({
        merged: 5,
        agentsWorkingAtOnce: 3,
        agentTimeMs: 35 * MINUTE,
      });
    });
  });

  it("doesn't depend on the order of the input", () => {
    expect(computeStats([...mergedPrs].reverse())).toEqual(computeStats(mergedPrs));
  });

  it('returns zeros and no duration when nothing has been merged', () => {
    expect(computeStats([])).toEqual({ merged: 0, agentsWorkingAtOnce: 0, agentTimeMs: null });
  });
});
