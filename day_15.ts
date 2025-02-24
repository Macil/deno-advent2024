import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { Location } from "./grid/location.ts";
import { ArrayGrid } from "./grid/grid.ts";
import { Direction } from "./grid/direction.ts";

interface World {
  grid: ArrayGrid<string>;
  robot: Location;
}

interface Problem {
  world: World;
  instructions: Direction[];
}

function parse(input: string): Problem {
  const [gridPart, instructionsPart] = input.trimEnd().split("\n\n");
  const grid = ArrayGrid.fromString(gridPart);
  const robot =
    grid.valuesWithLocations().find(({ value }) => value === "@")!.location;
  return {
    world: { grid, robot },
    instructions: Array.from(instructionsPart)
      .filter((c) => c !== "\n")
      .map((c) => {
        switch (c) {
          case "^":
            return "up";
          case "v":
            return "down";
          case "<":
            return "left";
          case ">":
            return "right";
        }
        throw new Error(`Invalid direction: ${JSON.stringify(c)}`);
      }),
  };
}

function attemptPush(
  world: World,
  location: Location,
  direction: Direction,
): boolean {
  const destination = location.relative(direction, 1);
  const destinationValue = world.grid.get(destination);

  let canPush = false;
  if (destinationValue === ".") {
    canPush = true;
  } else if (destinationValue === "O") {
    canPush = attemptPush(world, destination, direction);
  }

  if (canPush) {
    world.grid.set(destination, world.grid.get(location)!);
    world.grid.set(location, ".");
    if (location.equals(world.robot)) {
      world.robot = destination;
    }
    return true;
  }
  return false;
}

function step(world: World, direction: Direction) {
  attemptPush(world, world.robot, direction);
}

function run(problem: Problem) {
  for (const direction of problem.instructions) {
    step(problem.world, direction);
  }
}

function gpsCoordinate(location: Location): number {
  return location.row * 100 + location.column;
}

function part1(input: string): number {
  const problem = parse(input);
  run(problem);
  return problem.world.grid.valuesWithLocations()
    .filter(({ value }) => value === "O")
    .map(({ location }) => gpsCoordinate(location))
    .reduce((a, b) => a + b, 0);
}

// function part2(input: string): number {
//   const problem = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2024, 15, 1, part1);
  // runPart(2024, 15, 2, part2);
}

const TEST_INPUT = `\
##########
#..O..O.O#
#......O.#
#.OO..O.O#
#..O@..O.#
#O#..O...#
#O..O..O.#
#.OO.O.OO#
#....O...#
##########

<vv>^<v^>v>^vv^v>v<>v^v<v<^vv<<<^><<><>>v<vvv<>^v^>^<<<><<v<<<v^vv^v>^
vvv<<^>^v^^><<>>><>^<<><^vv^^<>vvv<>><^^v>^>vv<>v<<<<v<^v>^<^^>>>^<v<v
><>vv>v^v^<>><>>>><^^>vv>v<^^^>>v^v^<^^>v^^>v^<^v>v<>>v^v^<v>v^^<^^vv<
<<v<^>>^^^^>>>v^<>vvv^><v<<<>^^^vv^<vvv>^>v<^^^^v<>^>vvvv><>>v^<<^^^^^
^><^><>>><>^^<<^^v>>><^<v>^<vv>>v>>>^v><>^v><<<<v>>v<v<v>vvv>^<><<>^><
^>><>^v<><^vvv<^^<><v<<<<<><^v<<<><<<^^<v<^^^><^>>^<v^><<<^>>^v<v^v<v^
>^>>^v>vv>^<<^v<>><<><<v<<v><>v<^vv<<<>^^v^>^^>>><<^v>>v^v><^^>>^<>vv^
<><^^>^^^<><vvvvv^v<v<<>^v<v>v<<^><<><<><<<^^<<<^<<>><<><^^^>^^<>^>v<>
^^>vv<^v^v<vv>^<><v<^v>^^^>>>^^vvv^>vvv<>>>^<^>>>>>^<<^v>^vvv<>^<><<v>
v^^>>><<^^<>>^v^<v^vv<>v^<<>^<^v^v><^<<<><<^<v><v<>vv>>v><v^<vv<>v^<<^
`;

const TEST_SMALL_INPUT = `\
########
#..O.O.#
##@.O..#
#...O..#
#.#.O..#
#...O..#
#......#
########

<^^>>>vv<v>>v<<
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_SMALL_INPUT), 2028);
  assertEquals(part1(TEST_INPUT), 10092);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
