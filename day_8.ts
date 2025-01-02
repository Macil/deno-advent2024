import { assertEquals } from "@std/assert";
import { mapEntries } from "@std/collections/map-entries";
import { permutationSet } from "@hugoalh/setation/set";
import { runPart } from "@macil/aocd";
import { CharacterGrid } from "./grid/grid.ts";
import { Location } from "./grid/location.ts";

function part1(input: string): number {
  const grid = CharacterGrid.fromString(input);

  const nodeLocationsByFrequency: Partial<Record<string, Location[]>> =
    mapEntries(
      Object.groupBy(
        grid.valuesWithLocations().filter(({ value }) => value !== "."),
        ({ value }) => value,
      ),
      (
        [frequency, entries],
      ) => [frequency, entries?.map(({ location }) => location)],
    );

  const antinodeLocations = new Set<string>();

  for (const locations of Object.values(nodeLocationsByFrequency)) {
    if (!locations) continue;
    const allPairs = permutationSet(locations, 2);
    for (const [a, b] of allPairs) {
      const difference = b.subtract(a);
      const antinodeLocation = b.add(difference);
      if (grid.isInBounds(antinodeLocation)) {
        antinodeLocations.add(antinodeLocation.toString());
      }
    }
  }

  return antinodeLocations.size;
}

function part2(input: string): number {
  const grid = CharacterGrid.fromString(input);

  const nodeLocationsByFrequency: Partial<Record<string, Location[]>> =
    mapEntries(
      Object.groupBy(
        grid.valuesWithLocations().filter(({ value }) => value !== "."),
        ({ value }) => value,
      ),
      (
        [frequency, entries],
      ) => [frequency, entries?.map(({ location }) => location)],
    );

  const antinodeLocations = new Set<string>();

  for (const locations of Object.values(nodeLocationsByFrequency)) {
    if (!locations) continue;
    const allPairs = permutationSet(locations, 2);
    for (const [a, b] of allPairs) {
      const difference = b.subtract(a);
      let antinodeLocation = b;
      while (grid.isInBounds(antinodeLocation)) {
        antinodeLocations.add(antinodeLocation.toString());
        antinodeLocation = antinodeLocation.add(difference);
      }
      const oppositeDifference = difference.scale(-1);
      antinodeLocation = a;
      while (grid.isInBounds(antinodeLocation)) {
        antinodeLocations.add(antinodeLocation.toString());
        antinodeLocation = antinodeLocation.add(oppositeDifference);
      }
    }
  }

  return antinodeLocations.size;
}

if (import.meta.main) {
  runPart(2024, 8, 1, part1);
  runPart(2024, 8, 2, part2);
}

const TEST_INPUT = `\
............
........0...
.....0......
.......0....
....0.......
......A.....
............
............
........A...
.........A..
............
............
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 14);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 34);
});
