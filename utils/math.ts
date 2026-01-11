
export const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  
  // Use a small epsilon for float comparison if needed, 
  // but standard JS % operator works for floats: 0.75 % 0.5 = 0.25
  while (b > 0.00000001) { // Threshold for floating point precision
    a %= b;
    [a, b] = [b, a];
  }
  return parseFloat(a.toFixed(10)); // Clean up floating point errors
};

export const lcm = (a: number, b: number): number => {
  if (a === 0 || b === 0) return 0;
  // LCM(a, b) = |a * b| / GCD(a, b)
  const result = Math.abs(a * b) / gcd(a, b);
  return parseFloat(result.toFixed(10));
};

export const findMultiLCM = (nums: number[]): number => {
  if (nums.length === 0) return 0;
  return nums.reduce((acc, curr) => lcm(acc, curr), nums[0]);
};

export const findMultiGCD = (nums: number[]): number => {
  if (nums.length === 0) return 0;
  return nums.reduce((acc, curr) => gcd(acc, curr), nums[0]);
};

export const getComparisonStats = (nums: number[]) => {
  if (nums.length === 0) return null;
  const sortedAsc = [...nums].sort((a, b) => a - b);
  const sortedDesc = [...nums].sort((a, b) => b - a);
  return {
    max: Math.max(...nums),
    min: Math.min(...nums),
    sortedAsc,
    sortedDesc
  };
};

export const getPrimeFactors = (n: number): { factor: number; count: number }[] => {
  if (!Number.isInteger(n)) return []; // Prime factorization only for integers
  const factors: Map<number, number> = new Map();
  let temp = Math.abs(n);
  if (temp <= 1) return [];
  
  let d = 2;
  while (temp >= d * d) {
    if (temp % d === 0) {
      factors.set(d, (factors.get(d) || 0) + 1);
      temp /= d;
    } else {
      d++;
    }
  }
  if (temp > 1) {
    factors.set(temp, (factors.get(temp) || 0) + 1);
  }
  return Array.from(factors.entries()).map(([factor, count]) => ({ factor, count }));
};

export const isPrime = (n: number): boolean => {
  if (!Number.isInteger(n) || n <= 1) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
};
