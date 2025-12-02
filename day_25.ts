import { assertEquals } from "@std/assert";
// import { runPart } from "@macil/aocd";
import { CharacterGrid } from "./grid/grid.ts";
import { Location } from "./grid/location.ts";
import { rangeIterator } from "@hugoalh/range-iterator";

interface Configuration {
  locks: number[][];
  keys: number[][];
}

function parse(input: string): Configuration {
  return input.trimEnd().split("\n\n")
    .map((block) => {
      const grid = CharacterGrid.fromString(block);
      if (grid.get(new Location(0, 0)) === "#") {
        return {
          type: "lock" as const,
          values: rangeIterator(0, grid.dimensions.columns - 1)
            .map((col) =>
              (rangeIterator(1, grid.dimensions.rows - 2)
                .find((row) => grid.get(new Location(row, col)) === ".") ??
                grid.dimensions.rows - 1) - 1
            ).toArray(),
        };
      } else {
        return {
          type: "key" as const,
          values: rangeIterator(0, grid.dimensions.columns - 1)
            .map((col) =>
              (rangeIterator(1, grid.dimensions.rows - 2)
                .find((row) =>
                  grid.get(
                    new Location(grid.dimensions.rows - 1 - row, col),
                  ) === "."
                ) ??
                grid.dimensions.rows - 1) - 1
            ).toArray(),
        };
      }
    }).reduce<Configuration>((result, item) => {
      if (item.type === "lock") {
        result.locks.push(item.values);
      } else {
        result.keys.push(item.values);
      }
      return result;
    }, { locks: [], keys: [] });
}

// function part1(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  // runPart(2024, 25, 1, part1);
  // runPart(2024, 25, 2, part2);
}

const TEST_INPUT = `\
#####
.####
.####
.####
.#.#.
.#...
.....

#####
##.##
.#.##
...##
...#.
...#.
.....

.....
#....
#....
#...#
#.#.#
#.###
#####

.....
.....
#.#..
###..
###.#
###.#
#####

.....
.....
.....
#....
#.#..
#.#.#
#####
`;

Deno.test("parse", () => {
  assertEquals(parse(TEST_INPUT), {
    locks: [
      [0, 5, 3, 4, 3],
      [1, 2, 0, 5, 3],
    ],
    keys: [
      [5, 0, 2, 1, 3],
      [4, 3, 4, 0, 2],
      [3, 0, 2, 0, 1],
    ],
  });
});

// Deno.test("part1", () => {
//   assertEquals(part1(TEST_INPUT), 3);
// });

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
