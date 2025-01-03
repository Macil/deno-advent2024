import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { CharacterGrid, Grid } from "./grid/grid.ts";
import { Location } from "./grid/location.ts";
import { orthogonalNeighbors } from "./grid/vector.ts";

interface Region {
  value: string;
  /** Set of locations converted to strings */
  locations: Set<string>;
  perimeter: number;
}

function* getRegions(grid: Grid<string>): Generator<Region> {
  const alreadyProcessedLocations = new Set<string>();

  for (const { location, value } of grid.valuesWithLocations()) {
    const locationStr = location.toString();
    if (alreadyProcessedLocations.has(locationStr)) continue;

    let perimeter = 0;

    const locations = new Set<string>([locationStr]);
    const stack: Location[] = [location];
    while (stack.length > 0) {
      const current = stack.pop()!;
      for (const vector of orthogonalNeighbors()) {
        const neighbor = current.add(vector);
        const neighborValue = grid.get(neighbor);
        if (neighborValue !== value) {
          perimeter++;
        } else {
          const neighborStr = neighbor.toString();
          if (!locations.has(neighborStr)) {
            locations.add(neighborStr);
            alreadyProcessedLocations.add(neighborStr);
            stack.push(neighbor);
          }
        }
      }
    }
    yield { value, locations, perimeter };
  }
}

function getRegionPrice(region: Region): number {
  return region.locations.size * region.perimeter;
}

function part1(input: string): number {
  const grid = CharacterGrid.fromString(input);
  return getRegions(grid)
    .map(getRegionPrice)
    .reduce((a, b) => a + b, 0);
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2024, 12, 1, part1);
  // runPart(2024, 12, 2, part2);
}

const TEST_INPUT = `\
AAAA
BBCD
BBCC
EEEC
`;

const TEST_INPUT2 = `\
OOOOO
OXOXO
OOOOO
OXOXO
OOOOO
`;

const TEST_INPUT3 = `\
RRRRIICCFF
RRRRIICCCF
VVRRRCCFFF
VVRCCCJFFF
VVVVCJJCFE
VVIVCCJJEE
VVIIICJJEE
MIIIIIJJEE
MIIISIJEEE
MMMISSJEEE
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 140);
  assertEquals(part1(TEST_INPUT2), 772);
  assertEquals(part1(TEST_INPUT3), 1930);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
