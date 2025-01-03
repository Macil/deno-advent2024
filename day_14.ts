import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { Location } from "./grid/location.ts";
import { Vector } from "./grid/vector.ts";

interface Robot {
  position: Location;
  velocity: Vector;
}

function parse(input: string): Robot[] {
  return input.trimEnd().split("\n").map((line) => {
    const [_, px, py, vx, vy] = line.match(
      /^p=(\d+),(\d+) v=(-?\d+),(-?\d+)$/,
    )!;
    return {
      position: new Location(Number(py), Number(px)),
      velocity: new Vector(Number(vy), Number(vx)),
    };
  });
}

function getBotQuadrant(
  position: Location,
  worldDimensions: Vector,
): number | undefined {
  const middleColumn = Math.floor(worldDimensions.columns / 2);
  const middleRow = Math.floor(worldDimensions.rows / 2);
  if (position.column < middleColumn) {
    if (position.row < middleRow) {
      return 1;
    } else if (position.row > middleRow) {
      return 3;
    }
  } else if (position.column > middleColumn) {
    if (position.row < middleRow) {
      return 2;
    } else if (position.row > middleRow) {
      return 4;
    }
  }
  return undefined;
}

function runBots(robots: Robot[], time: number, worldDimensions: Vector) {
  for (const robot of robots) {
    robot.position = robot.position
      .add(robot.velocity.scale(time))
      .modulo(worldDimensions);
  }
}

function calculateSafetyFactor(
  robots: Robot[],
  worldDimensions: Vector,
): number {
  const botsByQuadrant = Map.groupBy(
    robots,
    (robot) => getBotQuadrant(robot.position, worldDimensions),
  );
  return botsByQuadrant.entries()
    .filter(([quadrant]) => quadrant !== undefined)
    .map(([_quadrant, bots]) => bots.length)
    .reduce((a, b) => a * b, 1);
}

function part1(input: string, worldDimensions = new Vector(103, 101)): number {
  const robots = parse(input);
  runBots(robots, 100, worldDimensions);
  return calculateSafetyFactor(robots, worldDimensions);
}

// function part2(input: string): number {
//   const robots = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2024, 14, 1, part1);
  // runPart(2024, 14, 2, part2);
}

const TEST_INPUT = `\
p=0,4 v=3,-3
p=6,3 v=-1,-3
p=10,3 v=-1,2
p=2,0 v=2,-1
p=0,0 v=1,3
p=3,0 v=-2,-2
p=7,6 v=-1,-3
p=3,0 v=-1,-2
p=9,3 v=2,3
p=7,3 v=-1,2
p=2,4 v=2,-3
p=9,5 v=-3,-3
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT, new Vector(7, 11)), 12);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
