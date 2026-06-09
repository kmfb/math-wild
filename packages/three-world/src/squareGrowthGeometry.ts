export type SquareGrowthDot = {
  id: string;
  ring: number;
  x: number;
  y: number;
};

export type GrowthFrame = {
  n: number;
  added: number;
  total: number;
  dots: SquareGrowthDot[];
  ring: SquareGrowthDot[];
};

function centerOffset(n: number) {
  return (n - 1) / 2;
}

export function squareDots(n: number): SquareGrowthDot[] {
  const offset = centerOffset(n);
  const dots: SquareGrowthDot[] = [];
  for (let row = 0; row < n; row += 1) {
    for (let column = 0; column < n; column += 1) {
      const ring = Math.max(row, column) + 1;
      dots.push({
        id: `square-${n}-${row}-${column}`,
        ring,
        x: column - offset,
        y: offset - row,
      });
    }
  }
  return dots;
}

export function ringDots(k: number): SquareGrowthDot[] {
  if (k < 1) return [];
  const offset = centerOffset(k);
  const dots: SquareGrowthDot[] = [];
  const last = k - 1;
  for (let column = 0; column < k; column += 1) {
    dots.push({
      id: `ring-${k}-${last}-${column}`,
      ring: k,
      x: column - offset,
      y: offset - last,
    });
  }
  for (let row = 0; row < last; row += 1) {
    dots.push({
      id: `ring-${k}-${row}-${last}`,
      ring: k,
      x: last - offset,
      y: offset - row,
    });
  }
  return dots;
}

export function growthSequence(maxN: number): GrowthFrame[] {
  return Array.from({ length: maxN }, (_, index) => {
    const n = index + 1;
    return {
      n,
      added: 2 * n - 1,
      total: n * n,
      dots: squareDots(n),
      ring: ringDots(n),
    };
  });
}
