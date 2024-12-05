import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { CharacterGrid } from "./grid/grid.ts";
import { allNeighbors } from "./grid/vector.ts";

function part1(input: string): number {
  const grid = CharacterGrid.fromString(input);
  const searchChars = Array.from("XMAS");
  return grid.valuesWithLocations()
    .flatMap(({ location }) =>
      allNeighbors().map((direction) => ({ location, direction }))
    )
    .filter(({ location, direction }) =>
      searchChars.every((char, i) =>
        grid.get(location.add(direction.scale(i))) === char
      )
    )
    .reduce((count) => count + 1, 0);
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2024, 4, 1, part1);
  // runPart(2024, 4, 2, part2);
}

const TEST_INPUT = `\
MMMSXXMASM
MSAMXMSMSA
AMXSXMAAMM
MSAMASMSMX
XMASAMXAMM
XXAMMXXAMA
SMSMSASXSS
SAXAMASAAA
MAMMMXMMMM
MXMXAXMASX
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 18);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
