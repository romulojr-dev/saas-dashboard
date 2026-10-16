import type { ChartConfig } from "@/components/ui/chart";

/*
 * Chart colours for the Site Safety pages. The app's --chart-* tokens are greyscale,
 * which can't tell categories apart, so categorical charts use this palette instead.
 * Order matters: adjacent slots were validated for colour-vision deficiency in both
 * themes (dataviz validator). Light slots 3–5 are below 3:1 contrast, so charts using
 * them always show a legend or direct labels with values.
 */
export const SERIES_COLORS = [
  { light: "#2a78d6", dark: "#3987e5" }, // blue
  { light: "#eb6834", dark: "#d95926" }, // orange
  { light: "#1baf7a", dark: "#199e70" }, // aqua
  { light: "#eda100", dark: "#c98500" }, // yellow
  { light: "#e87ba4", dark: "#d55181" }, // magenta
  { light: "#008300", dark: "#008300" }, // green
  { light: "#6250d6", dark: "#9085e9" }, // violet
  { light: "#e34948", dark: "#e66767" }, // red
] as const;

/** Muted fill for an "Other" bucket, so it never borrows a series hue. */
export const OTHER_COLOR = { light: "#b5b4ad", dark: "#5f5e5a" } as const;

/** Single-hue blue ramp (light → dark) for magnitude: heat maps and density. */
export const SEQUENTIAL_BLUE = ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95", "#0d366b"] as const;

/** Builds a ChartConfig entry using a categorical slot, in order. */
export function seriesConfig(label: string, slot: number): ChartConfig[string] {
  return { label, theme: SERIES_COLORS[slot % SERIES_COLORS.length] };
}

/**
 * Picks a sequential step for `value` on a 0..max scale. `minStep` skips the lightest
 * steps when the background is itself light (e.g. map tiles).
 */
export function sequentialColor(value: number, max: number, minStep = 0) {
  const steps = SEQUENTIAL_BLUE.length - minStep;
  if (max <= 0) return SEQUENTIAL_BLUE[minStep];
  const index = minStep + Math.min(steps - 1, Math.floor((value / max) * steps));
  return SEQUENTIAL_BLUE[index];
}
