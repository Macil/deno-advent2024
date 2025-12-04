import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { ArrayGrid, Direction, gridToString, Location } from "@macil/grid";

interface World {
  grid: ArrayGrid<string>;
  robot: Location;
}

interface Problem {
  world: World;
  instructions: Direction[];
}

function parseInstructions(instructionsString: string): Direction[] {
  return Array.from(instructionsString)
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
    });
}

function parse(input: string): Problem {
  const [gridPart, instructionsPart] = input.trimEnd().split("\n\n");
  const grid = ArrayGrid.fromString(gridPart);
  const robot =
    grid.valuesWithLocations().find(({ value }) => value === "@")!.location;
  return {
    world: { grid, robot },
    instructions: parseInstructions(instructionsPart),
  };
}

function push(world: World, location: Location, direction: Direction) {
  const locationsToPush = new Set<string>();

  const isVertical = ["up", "down"].includes(direction);

  function addLocationToPush(location: Location) {
    locationsToPush.add(location.toString());
    const locationValue = world.grid.get(location);
    if (
      isVertical &&
      locationValue && "[]".includes(locationValue)
    ) {
      if (locationValue === "[") {
        locationsToPush.add(location.right(1).toString());
      } else {
        locationsToPush.add(location.left(1).toString());
      }
    }
  }

  addLocationToPush(location);

  for (const locationStringToPush of locationsToPush) {
    const locationToPush = Location.fromString(locationStringToPush);
    const destination = locationToPush.relative(direction, 1);
    const destinationValue = world.grid.get(destination);
    if (destinationValue && "O[]".includes(destinationValue)) {
      addLocationToPush(destination);
    } else if (destinationValue !== ".") {
      return;
    }
  }

  const locationsToPushReversed = Array.from(locationsToPush)
    .reverse()
    .map((ls) => Location.fromString(ls));

  for (const locationToPush of locationsToPushReversed) {
    const destination = locationToPush.relative(direction, 1);
    world.grid.set(destination, world.grid.get(locationToPush)!);
    world.grid.set(locationToPush, ".");
    if (locationToPush.equals(world.robot)) {
      world.robot = destination;
    }
  }
}

function step(world: World, direction: Direction) {
  push(world, world.robot, direction);
}

function run(problem: Problem, log = false) {
  if (log) {
    console.log("Initial state:");
    console.log(gridToString(problem.world.grid));
    console.log();
  }

  for (const direction of problem.instructions) {
    if (log) {
      console.log("Move:", direction);
    }
    step(problem.world, direction);
    if (log) {
      console.log(gridToString(problem.world.grid));
      console.log();
    }
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

function parsePart2(input: string): Problem {
  const [gridPart, instructionsPart] = input.trimEnd().split("\n\n");
  const transformedGridPart = gridPart.replaceAll(/[#O\.@]/g, (c) => {
    switch (c) {
      case "#":
        return "##";
      case "O":
        return "[]";
      case ".":
        return "..";
      case "@":
        return "@.";
    }
    throw new Error(`Invalid character: ${JSON.stringify(c)}`);
  });
  const grid = ArrayGrid.fromString(transformedGridPart);
  const robot =
    grid.valuesWithLocations().find(({ value }) => value === "@")!.location;
  return {
    world: { grid, robot },
    instructions: parseInstructions(instructionsPart),
  };
}

function part2(input: string): number {
  const problem = parsePart2(input);
  run(problem);
  return problem.world.grid.valuesWithLocations()
    .filter(({ value }) => value === "[")
    .map(({ location }) => gpsCoordinate(location))
    .reduce((a, b) => a + b, 0);
}

if (import.meta.main) {
  runPart(2024, 15, 1, part1);
  runPart(2024, 15, 2, part2);
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

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 9021);
});
