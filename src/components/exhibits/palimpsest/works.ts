import type { FragmentDefinition, Material, PalimpsestWork } from "./model.ts";

const shapes = {
  shard: [
    { x: -58, y: -18 },
    { x: 28, y: -42 },
    { x: 64, y: 8 },
    { x: 10, y: 48 },
    { x: -42, y: 30 },
  ],
  leaf: [
    { x: -54, y: 0 },
    { x: -18, y: -32 },
    { x: 42, y: -20 },
    { x: 60, y: 0 },
    { x: 22, y: 27 },
    { x: -28, y: 24 },
  ],
  ribbon: [
    { x: -70, y: -17 },
    { x: 64, y: -27 },
    { x: 72, y: 18 },
    { x: -56, y: 29 },
  ],
  wedge: [
    { x: -48, y: -42 },
    { x: 62, y: 0 },
    { x: -42, y: 46 },
    { x: -18, y: 0 },
  ],
  tablet: [
    { x: -46, y: -52 },
    { x: 48, y: -46 },
    { x: 54, y: 48 },
    { x: -52, y: 54 },
  ],
} as const;

type FragmentInput = {
  id: string;
  label: string;
  material: Material;
  shape: keyof typeof shapes;
  start: [number, number, number, number];
  solution: [number, number, number, number];
};

const fragment = ({ id, label, material, shape, start, solution }: FragmentInput): FragmentDefinition => ({
  id,
  label,
  material,
  points: shapes[shape].map((point) => ({ ...point })),
  start: { x: start[0], y: start[1], angle: start[2], depth: start[3] },
  solution: {
    x: solution[0],
    y: solution[1],
    angle: solution[2],
    depth: solution[3],
  },
});

export const PALIMPSEST_WORKS: PalimpsestWork[] = [
  {
    id: "red-index",
    numeral: "I",
    title: "The Red Index",
    subtitle: "Pigment and carbon / four leaves",
    note: "Reassemble four dislocated surfaces. Their cut edges remember the original argument.",
    hint: "Begin with the carbon tablet near the lower central registration cross.",
    motif: "index",
    fragments: [
      fragment({
        id: "ri-a",
        label: "A.1",
        material: "carbon",
        shape: "tablet",
        start: [175, 145, 0.74, 1],
        solution: [385, 250, -0.08, 0],
      }),
      fragment({
        id: "ri-b",
        label: "A.2",
        material: "oxide",
        shape: "shard",
        start: [735, 145, -0.52, 0],
        solution: [505, 250, 0.18, 1],
      }),
      fragment({
        id: "ri-c",
        label: "A.3",
        material: "vellum",
        shape: "ribbon",
        start: [185, 485, 1.02, 2],
        solution: [430, 365, -0.16, 2],
      }),
      fragment({
        id: "ri-d",
        label: "A.4",
        material: "chalk",
        shape: "wedge",
        start: [730, 478, -0.92, 2],
        solution: [555, 370, 0.26, 1],
      }),
    ],
  },
  {
    id: "botanical-negative",
    numeral: "II",
    title: "Botanical Negative",
    subtitle: "Pressed form / six leaves",
    note: "A specimen survives as overlap, shadow, and the pale geometry between its leaves.",
    hint: "Verdigris occupies the rear plane; chalk traces sit nearest the glass.",
    motif: "botanical",
    fragments: [
      fragment({ id: "bn-a", label: "B.1", material: "verdigris", shape: "leaf", start: [150, 150, -1.2, 2], solution: [405, 250, -0.8, 0] }),
      fragment({ id: "bn-b", label: "B.2", material: "vellum", shape: "leaf", start: [325, 115, 0.6, 1], solution: [500, 230, -0.15, 1] }),
      fragment({ id: "bn-c", label: "B.3", material: "oxide", shape: "leaf", start: [760, 140, 1.1, 0], solution: [575, 285, 0.55, 1] }),
      fragment({ id: "bn-d", label: "B.4", material: "chalk", shape: "leaf", start: [155, 480, 0.2, 0], solution: [420, 360, 0.75, 2] }),
      fragment({ id: "bn-e", label: "B.5", material: "carbon", shape: "ribbon", start: [510, 500, -0.9, 2], solution: [515, 355, 1.38, 0] }),
      fragment({ id: "bn-f", label: "B.6", material: "verdigris", shape: "wedge", start: [750, 475, 0.9, 2], solution: [605, 375, -0.32, 0] }),
    ],
  },
  {
    id: "mechanical-weather",
    numeral: "III",
    title: "Mechanical Weather",
    subtitle: "Forecast mechanism / seven leaves",
    note: "Pressure, direction, and residue are stored in a machine with no fixed center.",
    hint: "Build the carbon axis first. Oxide fragments turn around it on the middle plane.",
    motif: "weather",
    fragments: [
      fragment({ id: "mw-a", label: "C.1", material: "carbon", shape: "ribbon", start: [150, 120, 1.2, 2], solution: [450, 300, 0, 0] }),
      fragment({ id: "mw-b", label: "C.2", material: "oxide", shape: "wedge", start: [340, 120, -0.7, 0], solution: [365, 250, -0.55, 1] }),
      fragment({ id: "mw-c", label: "C.3", material: "vellum", shape: "shard", start: [600, 115, 0.8, 2], solution: [515, 230, 0.42, 2] }),
      fragment({ id: "mw-d", label: "C.4", material: "verdigris", shape: "tablet", start: [760, 200, -1.1, 0], solution: [575, 330, 0.2, 0] }),
      fragment({ id: "mw-e", label: "C.5", material: "chalk", shape: "leaf", start: [160, 480, -0.3, 1], solution: [370, 370, -0.28, 2] }),
      fragment({ id: "mw-f", label: "C.6", material: "oxide", shape: "leaf", start: [470, 500, 1.1, 2], solution: [490, 390, 0.94, 1] }),
      fragment({ id: "mw-g", label: "C.7", material: "carbon", shape: "wedge", start: [755, 485, 0.5, 2], solution: [605, 410, -0.48, 0] }),
    ],
  },
  {
    id: "memory-atlas",
    numeral: "IV",
    title: "Atlas of Near Memory",
    subtitle: "Composite record / nine leaves",
    note: "Nine unreliable records become one map when their errors are placed in the correct order.",
    hint: "The pale ribbon is the horizon. Place it first, then read depth from cool to warm.",
    motif: "atlas",
    fragments: [
      fragment({ id: "ma-a", label: "D.1", material: "vellum", shape: "ribbon", start: [145, 110, 0.9, 2], solution: [450, 300, -0.08, 0] }),
      fragment({ id: "ma-b", label: "D.2", material: "verdigris", shape: "shard", start: [330, 105, -1.2, 1], solution: [355, 220, 0.24, 0] }),
      fragment({ id: "ma-c", label: "D.3", material: "carbon", shape: "tablet", start: [520, 110, 0.55, 2], solution: [475, 210, -0.16, 1] }),
      fragment({ id: "ma-d", label: "D.4", material: "oxide", shape: "leaf", start: [760, 125, -0.66, 0], solution: [585, 245, 0.58, 2] }),
      fragment({ id: "ma-e", label: "D.5", material: "chalk", shape: "wedge", start: [140, 330, 1.16, 1], solution: [350, 345, -0.48, 2] }),
      fragment({ id: "ma-f", label: "D.6", material: "oxide", shape: "shard", start: [760, 310, 0.78, 0], solution: [545, 345, 0.18, 1] }),
      fragment({ id: "ma-g", label: "D.7", material: "carbon", shape: "leaf", start: [160, 505, -0.2, 2], solution: [400, 430, 0.65, 0] }),
      fragment({ id: "ma-h", label: "D.8", material: "verdigris", shape: "wedge", start: [480, 500, 1.22, 2], solution: [510, 430, -0.72, 1] }),
      fragment({ id: "ma-i", label: "D.9", material: "vellum", shape: "tablet", start: [750, 500, -1.05, 0], solution: [620, 400, 0.12, 2] }),
    ],
  },
];
