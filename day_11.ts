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

function changeStones(stonesMap: Map<number, number>): Map<number, number> {
  const result = new Map<number, number>();
  for (const [stone, count] of stonesMap) {
    for (const newStone of changeStone(stone)) {
      result.set(newStone, (result.get(newStone) ?? 0) + count);
    }
  }
  return result;
}

/** @returns final stone count */
function changeStonesNTimes(stones: number[], n: number): number {
  let stonesMap = new Map<number, number>();
  for (const stone of stones) {
    stonesMap.set(stone, (stonesMap.get(stone) ?? 0) + 1);
  }
  for (let i = 0; i < n; i++) {
    stonesMap = changeStones(stonesMap);
  }
  return stonesMap.values().reduce((sum, count) => sum + count, 0);
}

function part1(input: string): number {
  const stones = parse(input);
  return changeStonesNTimes(stones, 25);
}

function part2(input: string): number {
  const stones = parse(input);
  return changeStonesNTimes(stones, 75);
}

if (import.meta.main) {
  runPart(2024, 11, 1, part1);
  runPart(2024, 11, 2, part2);
}

const TEST_INPUT = `125 17`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 55312);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 65601038650482);
});
