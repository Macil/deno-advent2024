import { assertEquals } from "@std/assert";
import { zip } from "@std/collections/zip";
import bigCartesian from "big-cartesian";
import { runPart } from "@macil/aocd";

interface Item {
  result: number;
  operands: number[];
}

function parse(input: string): Item[] {
  return input.trimEnd().split("\n").map((line) => {
    const [resultStr, operandsStr] = line.split(": ");
    return {
      result: Number(resultStr),
      operands: operandsStr.split(" ").map(Number),
    };
  });
}

type Operator = (a: number, b: number) => number;

const OPERATORS = {
  "+": (a: number, b: number) => a + b,
  "*": (a: number, b: number) => a * b,
  "||": (a: number, b: number) => Number(String(a) + String(b)),
} satisfies Record<string, Operator>;

type OperatorName = keyof typeof OPERATORS;

function applyOperators(operators: OperatorName[], operands: number[]): number {
  if (operators.length !== operands.length - 1) {
    throw new Error("Invalid operators and operands");
  }
  return zip(operators, operands.slice(1)).reduce(
    (a, [operator, b]) => OPERATORS[operator](a, b),
    operands[0],
  );
}

function checkItemCanBeTrue(
  item: Item,
  operatorNames: OperatorName[] = Object.keys(OPERATORS) as OperatorName[],
): boolean {
  const p = new Array<OperatorName[]>(
    item.operands.length - 1,
  ).fill(operatorNames);
  const allOperatorCombinations = bigCartesian(
    p,
  );
  for (const operators of allOperatorCombinations) {
    const result = applyOperators(operators, item.operands);
    if (result === item.result) {
      return true;
    }
  }
  return false;
}

function part1(input: string): number {
  const items = parse(input);
  return items
    .filter((item) => checkItemCanBeTrue(item, ["+", "*"]))
    .map((item) => item.result)
    .reduce((a, b) => a + b, 0);
}

function part2(input: string): number {
  const items = parse(input);
  return items
    .filter((item) => checkItemCanBeTrue(item))
    .map((item) => item.result)
    .reduce((a, b) => a + b, 0);
}

if (import.meta.main) {
  runPart(2024, 7, 1, part1);
  runPart(2024, 7, 2, part2);
}

const TEST_INPUT = `\
190: 10 19
3267: 81 40 27
83: 17 5
156: 15 6
7290: 6 8 6 15
161011: 16 10 13
192: 17 8 14
21037: 9 7 18 13
292: 11 6 16 20
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 3749);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 11387);
});
