import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { CharacterGrid, Grid } from "./grid/grid.ts";
import { Location } from "./grid/location.ts";
import { orthogonalNeighbors, Vector } from "./grid/vector.ts";

interface Region {
  value: string;
  locations: Location[];
  /** Set of locations converted to strings */
  locationsStrSet: Set<string>;
  perimeter: number;
}

function* getRegions(grid: Grid<string>): Generator<Region> {
  const alreadyProcessedLocations = new Set<string>();

  for (const { location, value } of grid.valuesWithLocations()) {
    const locationStr = location.toString();
    if (alreadyProcessedLocations.has(locationStr)) continue;

    let perimeter = 0;

    const locations = [location];
    const locationsStrSet = new Set<string>([locationStr]);
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
          if (!locationsStrSet.has(neighborStr)) {
            locationsStrSet.add(neighborStr);
            alreadyProcessedLocations.add(neighborStr);
            locations.push(neighbor);
            stack.push(neighbor);
          }
        }
      }
    }
    yield { value, locations, locationsStrSet, perimeter };
  }
}

function getRegionPrice(region: Region): number {
  return region.locations.length * region.perimeter;
}

function part1(input: string): number {
  const grid = CharacterGrid.fromString(input);
  return getRegions(grid)
    .map(getRegionPrice)
    .reduce((a, b) => a + b, 0);
}

function countRegionSides(grid: Grid<string>, region: Region): number {
  function checkedSideKey(location: Location, vector: Vector): string {
    return `${location.toString()}:${vector.toString()}`;
  }
  const checkedSides = new Set<string>();

  let sides = 0;
  for (const location of region.locations) {
    for (const vector of orthogonalNeighbors()) {
      const neighbor = location.add(vector);
      const neighborValue = grid.get(neighbor);
      if (neighborValue !== region.value) {
        const sideKey = checkedSideKey(location, vector);
        if (!checkedSides.has(sideKey)) {
          checkedSides.add(sideKey);
          sides++;

          for (
            const sideVector of [vector.clockwise(), vector.counterClockwise()]
          ) {
            for (
              let sideNeighbor = location.add(sideVector);
              grid.get(sideNeighbor) === region.value;
              sideNeighbor = sideNeighbor.add(sideVector)
            ) {
              const sideNeighborNeighbor = sideNeighbor.add(vector);
              if (grid.get(sideNeighborNeighbor) === region.value) {
                break;
              }
              checkedSides.add(checkedSideKey(sideNeighbor, vector));
            }
          }
        }
      }
    }
  }
  return sides;
}

function getRegionPriceP2(grid: Grid<string>, region: Region): number {
  return region.locations.length * countRegionSides(grid, region);
}

function part2(input: string): number {
  const grid = CharacterGrid.fromString(input);
  return getRegions(grid)
    .map((region) => getRegionPriceP2(grid, region))
    .reduce((a, b) => a + b, 0);
}

if (import.meta.main) {
  runPart(2024, 12, 1, part1);
  runPart(2024, 12, 2, part2);
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

Deno.test("part2", () => {
  // assertEquals(part2(TEST_INPUT), 80);
  assertEquals(part2(TEST_INPUT2), 436);
  assertEquals(
    part2(`\
EEEEE
EXXXX
EEEEE
EXXXX
EEEEE
`),
    236,
  );
  assertEquals(
    part2(`\
AAAAAA
AAABBA
AAABBA
ABBAAA
ABBAAA
AAAAAA
`),
    368,
  );
  assertEquals(part2(TEST_INPUT3), 1206);
});
