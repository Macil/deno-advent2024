import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { CharacterGrid } from "./grid/grid.ts";
import { clockwise, Direction } from "./grid/direction.ts";

function part1(input: string): number {
  const grid = CharacterGrid.fromString(input);
  const visitedLocations = new Set<string>();
  let currentGuardDirection: Direction = "up";
  let currentGuardLocation = grid.valuesWithLocations()
    .find(({ value }) => value === "^")?.location;
  if (!currentGuardLocation) {
    throw new Error("No guard location found");
  }
  while (grid.isInBounds(currentGuardLocation)) {
    visitedLocations.add(currentGuardLocation.toString());
    while (true) {
      const nextLocation = currentGuardLocation.relative(
        currentGuardDirection,
        1,
      );
      if (grid.get(nextLocation) === "#") {
        currentGuardDirection = clockwise(currentGuardDirection);
      } else {
        currentGuardLocation = nextLocation;
        break;
      }
    }
  }
  return visitedLocations.size;
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2024, 6, 1, part1);
  // runPart(2024, 6, 2, part2);
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

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
