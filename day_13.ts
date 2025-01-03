import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import * as math from "mathjs";

interface Pair {
  x: number;
  y: number;
}

interface ClawMachine {
  buttonA: Pair;
  buttonB: Pair;
  prize: Pair;
}

function parse(input: string): ClawMachine[] {
  return input.trimEnd().split("\n\n").map((block) => {
    const lines = block.split("\n");
    const buttonA = lines[0].match(/X\+(\d+), Y\+(\d+)/)!.slice(1).map(Number);
    const buttonB = lines[1].match(/X\+(\d+), Y\+(\d+)/)!.slice(1).map(Number);
    const prize = lines[2].match(/X=(\d+), Y=(\d+)/)!.slice(1).map(Number);
    return {
      buttonA: { x: buttonA[0], y: buttonA[1] },
      buttonB: { x: buttonB[0], y: buttonB[1] },
      prize: { x: prize[0], y: prize[1] },
    };
  });
}

function calculateTokensToSolve(machine: ClawMachine): number | undefined {
  const A = math.matrix([[machine.buttonA.x, machine.buttonB.x], [
    machine.buttonA.y,
    machine.buttonB.y,
  ]]);
  const B = math.matrix([[machine.prize.x], [machine.prize.y]]);

  const X = math.lusolve(A, B);

  const aPresses = X.get([0, 0]) as number;
  const bPresses = X.get([1, 0]) as number;

  const aRounded = Math.round(aPresses);
  const bRounded = Math.round(bPresses);

  if (
    aRounded * machine.buttonA.x +
          bRounded * machine.buttonB.x !== machine.prize.x ||
    aRounded * machine.buttonA.y +
          bRounded * machine.buttonB.y !== machine.prize.y
  ) {
    return undefined;
  }

  return 3 * aRounded + bRounded;
}

function part1(input: string): number {
  const machines = parse(input);
  return machines
    .map(calculateTokensToSolve)
    .filter((t) => t != undefined)
    .reduce((a, b) => a + b, 0);
}

function part2(input: string): number {
  const machines = parse(input);
  return machines
    .map((machine) => ({
      ...machine,
      prize: {
        x: machine.prize.x + 10000000000000,
        y: machine.prize.y + 10000000000000,
      },
    }))
    .map(calculateTokensToSolve)
    .filter((t) => t != undefined)
    .reduce((a, b) => a + b, 0);
}

if (import.meta.main) {
  runPart(2024, 13, 1, part1);
  runPart(2024, 13, 2, part2);
}

const TEST_INPUT = `\
Button A: X+94, Y+34
Button B: X+22, Y+67
Prize: X=8400, Y=5400

Button A: X+26, Y+66
Button B: X+67, Y+21
Prize: X=12748, Y=12176

Button A: X+17, Y+86
Button B: X+84, Y+37
Prize: X=7870, Y=6450

Button A: X+69, Y+23
Button B: X+27, Y+71
Prize: X=18641, Y=10279
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 480);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 875318608908);
});
