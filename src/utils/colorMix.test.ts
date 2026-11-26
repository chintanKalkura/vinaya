import { mixHex } from './colorMix';

describe('mixHex', () => {
  it.each([
    [0, '#000000'],
    [0.5, '#808080'],
    [1, '#ffffff'],
    [2, '#ffffff'],
  ])('should blend black to white at %p as %s', (t, out) => {
    expect(mixHex('#000000', '#ffffff', t)).toBe(out);
  });
});
