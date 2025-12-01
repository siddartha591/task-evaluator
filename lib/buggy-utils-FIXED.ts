/**
 * Calculates the sum of all numbers in an array
 * @param numbers - Array of numbers to sum
 * @returns The total sum
 */
export function calculateArraySum(numbers: number[]): number {
  // Fixed: O(n) instead of O(n²), proper type safety
  return numbers.reduce((sum, current) => sum + current, 0)
}

// Alternative simple approach
export function calculateArraySumSimple(numbers: number[]): number {
  let sum = 0
  for (const num of numbers) {
    sum += num
  }
  return sum
}
