/** A clean upper bound and tick step for the axis: 0 / 10 / 20 … */
export function niceScale(max: number): { top: number; step: number } {
  if (max <= 0) return { top: 1, step: 1 };
  const rough = max / 3;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= rough) ?? 10 * power;
  return { top: Math.ceil(max / step) * step, step };
}
