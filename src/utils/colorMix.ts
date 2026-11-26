// A colour `t` of the way from `from` to `to` (both #rrggbb), for the
// heatmap's shade steps: docs/style-choices/detail/detail-page.md
export function mixHex(from: string, to: string, t: number): string {
  const channel = (hex: string, i: number) =>
    parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const k = Math.min(1, Math.max(0, t));
  return (
    '#' +
    [0, 1, 2]
      .map(i =>
        Math.round(channel(from, i) + (channel(to, i) - channel(from, i)) * k),
      )
      .map(v => v.toString(16).padStart(2, '0'))
      .join('')
  );
}
