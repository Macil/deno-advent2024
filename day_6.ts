import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import {
  ArrayGrid,
  CharacterGrid,
  FixedSizeGrid,
  Grid,
  Location,
} from "@macil/grid";
import { clockwise, Direction } from "@macil/grid/direction";

function* guardLocations(
  grid: FixedSizeGrid<string>,
  guardLocation: Location,
  guardDirection: Direction,
): Generator<[Location, Direction]> {
  while (grid.isInBounds(guardLocation)) {
    yield [guardLocation, guardDirection];
    const nextLocation = guardLocation.relative(
      guardDirection,
      1,
    );
    if (grid.get(nextLocation) === "#") {
      guardDirection = clockwise(guardDirection);
    } else {
      guardLocation = nextLocation;
    }
  }
}

function part1(input: string): number {
  const grid = CharacterGrid.fromString(input);
  const visitedLocations = new Set<string>();
  const guardStartLocation = grid.valuesWithLocations()
    .find(({ value }) => value === "^")?.location;
  if (!guardStartLocation) {
    throw new Error("No guard location found");
  }

  for (
    const [currentGuardLocation] of guardLocations(
      grid,
      guardStartLocation,
      "up",
    )
  ) {
    visitedLocations.add(currentGuardLocation.toString());
  }
  return visitedLocations.size;
}

function doesPathLoopFromPosition(
  grid: FixedSizeGrid<string>,
  existingDirectionsTraveledPerCell: Grid<Set<Direction>>,
  guardLocation: Location,
  guardDirection: Direction,
): boolean {
  const tempDirectionsTraveledPerCell = ArrayGrid.createWithInitialValue<
    Set<Direction> | undefined
  >(
    grid.dimensions,
    undefined,
  );
  for (
    const [currentGuardLocation, currentGuardDirection] of guardLocations(
      grid,
      guardLocation,
      guardDirection,
    )
  ) {
    let directionsTraveledInCurrentCell = tempDirectionsTraveledPerCell.get(
      currentGuardLocation,
    );
    if (!directionsTraveledInCurrentCell) {
      directionsTraveledInCurrentCell = new Set();
      tempDirectionsTraveledPerCell.set(
        currentGuardLocation,
        directionsTraveledInCurrentCell,
      );
    }
    if (
      directionsTraveledInCurrentCell.has(currentGuardDirection) ||
      existingDirectionsTraveledPerCell.get(currentGuardLocation)!
        .has(currentGuardDirection)
    ) {
      return true;
    }
    directionsTraveledInCurrentCell.add(currentGuardDirection);
  }
  return false;
}

function part2(input: string): number {
  const grid = ArrayGrid.fromString(input);

  const guardStartLocation = grid.valuesWithLocations()
    .find(({ value }) => value === "^")?.location;
  if (!guardStartLocation) {
    throw new Error("No guard location found");
  }

  const directionsTraveledPerCell = new ArrayGrid<Set<Direction>>(
    grid.dimensions,
    Array.from(
      { length: grid.dimensions.rows },
      () => Array.from({ length: grid.dimensions.columns }, () => new Set()),
    ),
  );

  const possibleObstructionLocations = new Set<string>();
  for (
    const [currentGuardLocation, currentGuardDirection] of guardLocations(
      grid,
      guardStartLocation,
      "up",
    )
  ) {
    const directionsTraveledInCurrentCell = directionsTraveledPerCell.get(
      currentGuardLocation,
    )!;
    directionsTraveledInCurrentCell.add(currentGuardDirection);

    const nextLocation = currentGuardLocation.relative(
      currentGuardDirection,
      1,
    );
    const nextLocationValue = grid.get(nextLocation);
    if (
      nextLocationValue !== "#" &&
      nextLocationValue !== undefined &&
      !possibleObstructionLocations.has(nextLocation.toString()) &&
      directionsTraveledPerCell.get(nextLocation)!.size === 0
    ) {
      // test putting an obstruction ahead of the guard
      grid.set(nextLocation, "#");
      if (
        doesPathLoopFromPosition(
          grid,
          directionsTraveledPerCell,
          currentGuardLocation,
          clockwise(currentGuardDirection),
        )
      ) {
        possibleObstructionLocations.add(nextLocation.toString());
      }
      grid.set(nextLocation, nextLocationValue);
    }
  }
  return possibleObstructionLocations.size;
}

if (import.meta.main) {
  runPart(2024, 6, 1, part1);
  runPart(2024, 6, 2, part2);
}

const TEST_INPUT = `\
....#.....
.........#
..........
..#.......
.......#..
..........
.#..^.....
........#.
#.........
......#...
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 41);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 6);
});

Deno.test("part2 immediate obstruction", () => {
  assertEquals(
    part2(`\
.....#....
.....#....
..........
...#^#....
....##....
..........
`),
    2,
  );
});

Deno.test("part2 don't double-count possible obstruction", () => {
  assertEquals(
    part2(`\
....##....
........#.
..........
....^..#..
...#......
......#...
`),
    3,
  );
});

Deno.test("part2 don't allow obstruction on traveled path", () => {
  assertEquals(
    part2(`\
....##....
........#.
..........
.......#..
..........
....^.....
`),
    1,
  );
});

Deno.test("part2 obstruction can be re-encountered", () => {
  assertEquals(
    part2(`\
..#.......
....O.....
........#.
.#........
...#...#..
....^.....
`),
    1,
  );
});
