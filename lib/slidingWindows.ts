import type { SlidingWindowsOptions } from "@std/collections/sliding-windows";
export type { SlidingWindowsOptions } from "@std/collections/sliding-windows";

/**
 * Generates sliding views of the given iterable of the given size and returns
 * an array containing all of them.
 *
 * If step is set, each window will start that many elements after the last
 * window's start. (Default: 1)
 *
 * If partial is set, windows will be generated for the last elements of the
 * collection, resulting in some undefined values if size is greater than 1.
 *
 * This function works similarly to the function at
 * https://jsr.io/@std/collections@1.1.3/doc/sliding-windows/~/slidingWindows
 * but as a generator function which works in a streaming fashion.
 */
export function* slidingWindows<T>(
  iterable: Iterable<T>,
  size: number,
  options: SlidingWindowsOptions = {},
): Generator<T[]> {
  const { step = 1, partial = false } = options;
  if (!Number.isInteger(size) || size <= 0) {
    throw new RangeError(
      `Cannot create sliding windows: size must be a positive integer, current value is ${size}`,
    );
  }
  if (!Number.isInteger(step) || step <= 0) {
    throw new RangeError(
      `Cannot create sliding windows: step must be a positive integer, current value is ${step}`,
    );
  }
  // TODO some array allocations could be optimized out when `step` > 1
  let window: T[] = [];
  let stepsToNotEmit = 0;
  for (const item of iterable) {
    if (window.length < size) {
      window.push(item);
    } else {
      window = [...window.slice(1), item];
    }
    if (window.length === size) {
      if (stepsToNotEmit > 0) {
        stepsToNotEmit--;
      } else {
        yield window;
        stepsToNotEmit = step - 1;
      }
    }
  }
  if (partial) {
    // yield the current window if it's never been yielded yet
    if (window.length > 0 && window.length < size) {
      yield window;
      stepsToNotEmit = step - 1;
    }
    while (window.length > 1) {
      window = window.slice(1);
      if (stepsToNotEmit > 0) {
        stepsToNotEmit--;
      } else {
        yield window;
        stepsToNotEmit = step - 1;
      }
    }
  }
}
