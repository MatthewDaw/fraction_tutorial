export const factorsOf = (n: number): number[] => {
  const out: number[] = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      out.push(i);
      if (i !== n / i) out.push(n / i);
    }
  }
  return out.sort((a, b) => a - b);
};

export const commonFactors = (a: number, b: number): number[] => {
  const fb = new Set(factorsOf(b));
  return factorsOf(a).filter((f) => fb.has(f));
};

export const gcf = (a: number, b: number): number =>
  b === 0 ? a : gcf(b, a % b);
