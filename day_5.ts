import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

interface Rule {
  x: number;
  y: number;
}

interface InputData {
  rules: Array<Rule>;
  updates: Array<Array<number>>;
}

function parse(input: string): InputData {
  const [rules, updates] = input.trimEnd().split("\n\n");
  return {
    rules: rules.split("\n").map((line) => {
      const [x, y] = line.split("|").map(Number);
      return { x, y };
    }),
    updates: updates.split("\n").map((line) => line.split(",").map(Number)),
  };
}

function checkRule(rule: Rule, update: Array<number>): boolean {
  const xIndex = update.indexOf(rule.x);
  const yIndex = update.indexOf(rule.y);
  if (xIndex === -1 || yIndex === -1) {
    return true;
  }
  return xIndex < yIndex;
}

function checkRules(rules: Rule[], update: Array<number>): boolean {
  return rules.every((rule) => checkRule(rule, update));
}

function pickMiddlePage(update: Array<number>): number {
  const middle = Math.floor(update.length / 2);
  return update[middle];
}

function part1(input: string): number {
  const inputData = parse(input);
  return inputData.updates
    .filter((update) => checkRules(inputData.rules, update))
    .map((update) => pickMiddlePage(update))
    .reduce((a, b) => a + b, 0);
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2024, 5, 1, part1);
  // runPart(2024, 5, 2, part2);
}

const TEST_INPUT = `\
47|53
97|13
97|61
97|47
75|29
61|13
75|53
29|13
97|29
53|29
61|53
97|53
61|29
47|13
75|47
97|75
47|61
75|61
47|29
75|13
53|13

75,47,61,53,29
97,61,53,29,13
75,29,13
75,97,47,61,53
61,13,29
97,13,75,29,47
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 143);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
