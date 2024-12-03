import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

function part1(input: string): number {
  const matches = input.matchAll(/mul\((\d+),(\d+)\)/g);
  return matches
    .map((m) => Number(m[1]) * Number(m[2]))
    .reduce((a, b) => a + b, 0);
}

// function part2(input: string): number {
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2024, 3, 1, part1);
  // runPart(2024, 3, 2, part2);
}

const TEST_INPUT = `\
xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 161);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
