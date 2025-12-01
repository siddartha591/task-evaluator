// BUG: Poor naming, inefficient algorithm, using 'any' type
export function calc(arr: any) {
  let sum = 0
  // BUG: Nested loop makes this O(n²) instead of O(n)
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      // BUG: Using == instead of ===
      if (i == j) {
        sum = sum + arr[i]
      }
    }
  }
  return sum
}

// BUG: No input validation
export function divide(a: any, b: any) {
  // BUG: No check for division by zero
  return a / b
}
