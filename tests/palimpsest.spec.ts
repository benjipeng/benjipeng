import { expect, test } from "playwright/test";

import {
  applyWorkHint,
  createWorkState,
  fragmentRegistration,
  isWorkSolved,
  pointInFragment,
  workAccuracy,
} from "../src/components/exhibits/palimpsest/model.ts";
import { PALIMPSEST_WORKS } from "../src/components/exhibits/palimpsest/works.ts";

test("palimpsest defines four works with increasing fragment counts", () => {
  expect(PALIMPSEST_WORKS).toHaveLength(4);
  expect(PALIMPSEST_WORKS.map((work) => work.fragments.length)).toEqual([4, 6, 7, 9]);
  expect(new Set(PALIMPSEST_WORKS.map((work) => work.id)).size).toBe(4);
});

test("palimpsest authored solution transforms register every fragment", () => {
  for (const work of PALIMPSEST_WORKS) {
    const solved = createWorkState(work, true);
    expect(isWorkSolved(work, solved), `${work.id} solution is not registered`).toBe(true);
    expect(workAccuracy(work, solved)).toBe(1);
    work.fragments.forEach((definition, index) => {
      expect(fragmentRegistration(definition, solved[index]).placed).toBe(true);
      expect(pointInFragment(definition.solution, definition, solved[index])).toBe(true);
    });
  }
});

test("palimpsest starts disassembled and its conservation hint improves registration", () => {
  for (const work of PALIMPSEST_WORKS) {
    const initial = createWorkState(work);
    expect(isWorkSolved(work, initial), `${work.id} starts restored`).toBe(false);
    const hinted = applyWorkHint(work, initial);
    expect(
      workAccuracy(work, hinted) > workAccuracy(work, initial),
      `${work.id} hint did not improve registration`,
    ).toBe(true);
  }
});
