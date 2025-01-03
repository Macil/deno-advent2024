import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

function parse(input: string): number[] {
  return input.trimEnd().split(/\s+/).map(Number);
}

function changeStone(stone: number): number[] {
  if (stone === 0) return [1];
  const digitCount = Math.floor(Math.log10(stone)) + 1;
  if (digitCount % 2 === 0) {
    const stoneStr = String(stone);
    return [
      Number(stoneStr.slice(0, digitCount / 2)),
      Number(stoneStr.slice(digitCount / 2)),
    ];
  }
  return [stone * 2024];
}

function changeStones(stones: number[]): number[] {
  return stones.flatMap(changeStone);
}

function changeStonesNTimes(stones: number[], n: number): number[] {
  for (let i = 0; i < n; i++) {
    stones = changeStones(stones);
  }
  return stones;
}

function part1(input: string): number {
  const stones = parse(input);
  return changeStonesNTimes(stones, 25).length;
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2024, 11, 1, part1);
  // runPart(2024, 11, 2, part2);
}

const TEST_INPUT = `125 17`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 55312);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
