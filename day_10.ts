import { assertEquals } from "@std/assert";
import { dijkstraAll } from "lazy-pathfinding/directed/dijkstra";
import { countPaths } from "lazy-pathfinding/directed/count_paths";
import { runPart } from "@macil/aocd";
import { ArrayGrid } from "./grid/grid.ts";
import { orthogonalNeighbors } from "./grid/vector.ts";
import { Location } from "./grid/location.ts";

function parse(input: string): ArrayGrid<number | undefined> {
  const data = input.trimEnd().split("\n").map((line) =>
    Array.from(line).map((chr) => (chr === "." ? undefined : Number(chr)))
  );
  return ArrayGrid.fromRows(data);
}

function getTrailheads(
  grid: ArrayGrid<number | undefined>,
): IteratorObject<Location> {
  return grid.valuesWithLocations()
    .filter(({ value }) => value === 0)
    .map(({ location }) => location);
}

function scoreTrailhead(
  grid: ArrayGrid<number | undefined>,
  trailhead: Location,
): number {
  const encounteredNodes = dijkstraAll({
    start: trailhead,
    successors: (location) =>
      orthogonalNeighbors()
        .map((neighbor): [Location, number] => [location.add(neighbor), 1])
        .filter(([neighborLocation]) =>
          grid.get(neighborLocation) === grid.get(location)! + 1
        ),
    key: (location) => location.toString(),
  });
  return encounteredNodes.values()
    .filter(({ node }) => grid.get(node) === 9)
    .reduce((sum) => sum + 1, 0);
}

function part1(input: string): number {
  const grid = parse(input);
  const trailheads = getTrailheads(grid);
  return trailheads
    .map((trailhead) => scoreTrailhead(grid, trailhead))
    .reduce((a, b) => a + b, 0);
}

function rateTrailhead(
  grid: ArrayGrid<number | undefined>,
  trailhead: Location,
): number {
  return countPaths({
    start: trailhead,
    successors: (location) =>
      orthogonalNeighbors()
        .map((neighbor) => location.add(neighbor))
        .filter((neighborLocation) =>
          grid.get(neighborLocation) === grid.get(location)! + 1
        ),
    success: (location) => grid.get(location) === 9,
  });
}

function part2(input: string): number {
  const grid = parse(input);
  const trailheads = getTrailheads(grid);
  return trailheads
    .map((trailhead) => rateTrailhead(grid, trailhead))
    .reduce((a, b) => a + b, 0);
}

if (import.meta.main) {
  runPart(2024, 10, 1, part1);
  runPart(2024, 10, 2, part2);
}

const TEST_INPUT = `\
89010123
78121874
87430965
96549874
45678903
32019012
01329801
10456732
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 36);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 81);
});
