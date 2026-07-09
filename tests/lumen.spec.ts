import { expect, test } from "playwright/test";

import { LUMEN_PLATES } from "../src/components/exhibits/lumen/levels.ts";
import {
  applyPlateHint,
  createPlateState,
  isPlateSolved,
  plateAccuracy,
  tracePlate,
} from "../src/components/exhibits/lumen/model.ts";

test("lumen defines five progressively richer optical plates", () => {
  expect(LUMEN_PLATES).toHaveLength(5);
  expect(new Set(LUMEN_PLATES.map((plate) => plate.id)).size).toBe(LUMEN_PLATES.length);
  expect(LUMEN_PLATES.some((plate) => plate.elements.some((item) => item.kind === "mirror"))).toBe(true);
  expect(LUMEN_PLATES.some((plate) => plate.elements.some((item) => item.kind === "lens"))).toBe(true);
  expect(LUMEN_PLATES.some((plate) => plate.elements.some((item) => item.kind === "filter"))).toBe(true);
  expect(LUMEN_PLATES.some((plate) => plate.elements.some((item) => item.kind === "prism"))).toBe(true);
});

test("lumen authored solution transforms illuminate every receiver", () => {
  for (const plate of LUMEN_PLATES) {
    const solved = createPlateState(plate, true);
    const trace = tracePlate(plate, solved);
    expect(
      isPlateSolved(plate, solved),
      `${plate.id} missed ${plate.targets
        .filter((target) => !trace.illuminated.has(target.id))
        .map((target) => target.id)
        .join(", ")}`,
    ).toBe(true);
    expect(trace.segments.length).toBeGreaterThan(0);
    expect(plateAccuracy(plate, solved)).toBe(1);
  }
});

test("lumen starting transforms remain unsolved and hints improve accuracy", () => {
  for (const plate of LUMEN_PLATES) {
    const initial = createPlateState(plate);
    expect(isPlateSolved(plate, initial), `${plate.id} starts solved`).toBe(false);
    const hinted = applyPlateHint(plate, initial);
    expect(
      plateAccuracy(plate, hinted) > plateAccuracy(plate, initial),
      `${plate.id} hint did not improve alignment`,
    ).toBe(true);
  }
});
