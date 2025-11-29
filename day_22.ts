import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { slidingWindows } from "./lib/slidingWindows.ts";
import { maxBy } from "@std/collections/max-by";

function parse(input: string): number[] {
  return input.trimEnd().split("\n").map(Number);
}

function mixAndPrune(a: number, b: number): number {
  return (a ^ b) & 0xffffff;
}

function evolve(value: number): number {
  value = mixAndPrune(value, value << 6);
  value = mixAndPrune(value, value >>> 5);
  value = mixAndPrune(value, value << 11);
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

function* getPrices(secret: number): Generator<number> {
  let currentSecret = secret;
  while (true) {
    yield currentSecret % 10;
    currentSecret = evolve(currentSecret);
  }
}

function part2(input: string): number {
  const buyers = parse(input);

  const bananasSoldByChangeSequence = new Map<string, number>();
  for (const buyer of buyers) {
    const sequencesSold = new Set<string>();

    const pricesWithChange = slidingWindows(getPrices(buyer), 2)
      .take(2000)
      .map(([previousPrice, price]) => ({
        price,
        change: price - previousPrice,
      }));
    const pricesWithPast4Changes = slidingWindows(pricesWithChange, 4)
      .map((window) => ({
        price: window.at(-1)!.price,
        past4Changes: window.map(({ change }) => change).join(","),
      }));
    for (const { price, past4Changes } of pricesWithPast4Changes) {
      if (sequencesSold.has(past4Changes)) {
        continue;
      }
      sequencesSold.add(past4Changes);
      bananasSoldByChangeSequence.set(
        past4Changes,
        (bananasSoldByChangeSequence.get(past4Changes) ?? 0) + price,
      );
    }
  }

  const maxBananasSold = maxBy(
    bananasSoldByChangeSequence.entries(),
    ([, bananasSold]) => bananasSold,
  )!;
  return maxBananasSold[1];
}

if (import.meta.main) {
  runPart(2024, 22, 1, part1);
  runPart(2024, 22, 2, part2);
}

const TEST_INPUT = `\
1
10
100
2024
`;

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

Deno.test("getPrices", () => {
  assertEquals(
    Array.from(getPrices(123).take(10)),
    [3, 0, 6, 5, 4, 4, 6, 4, 4, 2],
  );
});

Deno.test("expected price changes", () => {
  assertEquals(
    Array.from(
      slidingWindows(
        getPrices(123).take(10),
        2,
      )
        .map(([previous, current]) => current - previous),
    ),
    [-3, 6, -1, -1, 0, 2, -2, 0, -2],
  );
});

Deno.test("part2", () => {
  assertEquals(
    part2(`\
1
2
3
2024
`),
    23,
  );
});
