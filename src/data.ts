import carsRaw from "./data/cars.json";
import penguinsRaw from "./data/penguins.json";

/** vega-datasets (BSD-3-Clause), bundled locally. */
type RawCar = { Name: string; Miles_per_Gallon: number | null; Cylinders: number; Horsepower: number | null; Weight_in_lbs: number; Year: string; Origin: string };
export const cars = (carsRaw as RawCar[]).map((c) => ({
  name: c.Name,
  mpg: c.Miles_per_Gallon,
  cylinders: c.Cylinders,
  horsepower: c.Horsepower,
  weight: c.Weight_in_lbs,
  year: Number(c.Year.slice(0, 4)),
  origin: c.Origin,
}));

type RawPenguin = Record<string, string | number | null>;
export const penguins = (penguinsRaw as RawPenguin[])
  .filter((p) => typeof p["Body Mass (g)"] === "number")
  .map((p) => ({ species: p["Species"] as string, mass: p["Body Mass (g)"] as number }));

/** Small deterministic PRNG so synthetic data is identical on every load. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Four indexed weekly series (synthetic). */
export const weekly = (() => {
  const rand = mulberry32(7);
  const names = ["Alder", "Birch", "Cedar", "Dogwood"];
  const drift = [0.9, 0.35, -0.15, 0.6];
  const rows: { week: number; series: string; value: number }[] = [];
  names.forEach((series, k) => {
    let v = 100;
    for (let week = 1; week <= 52; week++) {
      v += drift[k] + (rand() - 0.5) * 6 + Math.sin((week / 52) * Math.PI * 2 + k) * 1.2;
      rows.push({ week, series, value: Math.round(v * 10) / 10 });
    }
  });
  return rows;
})();

/** Two years of daily values with a seasonal swing (synthetic). */
export const daily = (() => {
  const rand = mulberry32(21);
  const rows: { date: string; value: number }[] = [];
  const start = Date.UTC(2024, 0, 1);
  let noise = 0;
  for (let i = 0; i < 731; i++) {
    const d = new Date(start + i * 86400000);
    noise = noise * 0.85 + (rand() - 0.5) * 18;
    const season = Math.sin(((i - 60) / 365.25) * Math.PI * 2) * 34;
    const weekly = [0, 0, 0, 0, 2, 8, 6][(d.getUTCDay() + 6) % 7];
    rows.push({ date: d.toISOString().slice(0, 10), value: Math.round(Math.max(8, 120 + season + noise + weekly + i * 0.05)) });
  }
  return rows;
})();
