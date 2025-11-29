import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

function parse(input: string): number[] {
  return input.trimEnd().split("\n").map(Number);
}

function mix(a: number, b: number): number {
  return a ^ b;
}

function prune(n: number): number {
  return n & 0xffffff;
}

function evolve(value: number): number {
  value = prune(mix(value, value * 64));
  value = prune(mix(value, Math.floor(value / 32)));
  value = prune(mix(value, value * 2048));
  return value;
}

function evolveSteps(value: number, steps: number): number {
  let result = value;
  for (let i = 0; i < steps; i++) {
    result = evolve(result);
  }
  return result;
}

function part1(input: string): number {
  const items = parse(input);
  return items
    .map((item) => evolveSteps(item, 2000))
    .reduce((sum, v) => sum + v, 0);
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2024, 22, 1, part1);
  // runPart(2024, 22, 2, part2);
}

const TEST_INPUT = `\
1
10
100
2024
`;

Deno.test("prune", () => {
  assertEquals(prune(100000000), 16113920);
});

Deno.test("evolve", () => {
  assertEquals(evolve(123), 15887950);
  assertEquals(evolve(15887950), 16495136);
  assertEquals(evolve(16495136), 527345);
  assertEquals(evolve(527345), 704524);
  assertEquals(evolve(704524), 1553684);
});

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 37327623);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
