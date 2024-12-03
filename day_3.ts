import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

function part1(input: string): number {
  const matches = input.matchAll(/mul\((\d+),(\d+)\)/g);
  return matches
    .map((m) => Number(m[1]) * Number(m[2]))
    .reduce((a, b) => a + b, 0);
}

function part2(input: string): number {
  let mulInstructionsEnabled = true;
  let sum = 0;
  const matches = input.matchAll(/do\(\)|don't\(\)|mul\((\d+),(\d+)\)/g);
  for (const m of matches) {
    if (m[0] === "do()") {
      mulInstructionsEnabled = true;
    } else if (m[0] === "don't()") {
      mulInstructionsEnabled = false;
    } else if (mulInstructionsEnabled) {
      sum += Number(m[1]) * Number(m[2]);
    }
  }
  return sum;
}

if (import.meta.main) {
  runPart(2024, 3, 1, part1);
  runPart(2024, 3, 2, part2);
}

const TEST_INPUT = `\
xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 161);
});

Deno.test("part2", () => {
  assertEquals(
    part2(
      "xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))",
    ),
    48,
  );
});
