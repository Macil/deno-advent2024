import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { Location } from "./grid/location.ts";
import { ArrayGrid } from "./grid/grid.ts";
import { orthogonalNeighbors, Vector } from "./grid/vector.ts";
import { aStar, AStarOptions } from "@macil/pathfinding/directed/a_star";

function parse(input: string): Array<Location> {
  return input.trimEnd().split("\n").map(Location.fromString);
}

function part1(input: string, maxCoordinate = 70, fallCount = 1024): number {
  const items = parse(input);
  const grid = ArrayGrid.createWithInitialValue<boolean>(
    new Vector(maxCoordinate + 1, maxCoordinate + 1),
    false,
  );
  for (const item of items.slice(0, fallCount)) {
    grid.set(item, true);
  }

  const goal = new Location(maxCoordinate, maxCoordinate);

  const result = aStar<Location>({
    start: new Location(0, 0),
    successors: (location) =>
      orthogonalNeighbors()
        .map((dir): [Location, number] => [location.add(dir), 1])
        .filter(([loc]) => grid.isInBounds(loc) && !grid.get(loc)),
    heuristic: (location) => location.subtract(goal).l1Norm(),
    success: (location) => location.equals(goal),
    key: (location) => location.toString(),
  });
  if (!result) {
    throw new Error("No path found");
  }

  return result[1];
}

function part2(
  input: string,
  maxCoordinate = 70,
  initialFallCount = 1024,
): string {
  const items = parse(input);
  const grid = ArrayGrid.createWithInitialValue<boolean>(
    new Vector(maxCoordinate + 1, maxCoordinate + 1),
    false,
  );
  for (const item of items.slice(0, initialFallCount)) {
    grid.set(item, true);
  }

  const goal = new Location(maxCoordinate, maxCoordinate);

  const aStarOptions: AStarOptions<Location> = {
    start: new Location(0, 0),
    successors: (location) =>
      orthogonalNeighbors()
        .map((dir): [Location, number] => [location.add(dir), 1])
        .filter(([loc]) => grid.isInBounds(loc) && !grid.get(loc)),
    heuristic: (location) => location.subtract(goal).l1Norm(),
    success: (location) => location.equals(goal),
    key: (location) => location.toString(),
  };

  for (const item of items.slice(initialFallCount)) {
    grid.set(item, true);

    const result = aStar<Location>(aStarOptions);
    if (!result) {
      return item.toString();
    }
  }
  throw new Error("No blockage happened");
}

if (import.meta.main) {
  runPart(2024, 18, 1, part1);
  runPart(2024, 18, 2, part2);
}

const TEST_INPUT = `\
5,4
4,2
4,5
3,0
2,1
6,3
2,4
1,5
0,6
3,3
2,6
5,1
1,2
5,5
2,5
6,5
1,4
0,4
6,4
1,1
6,1
1,0
0,5
1,6
2,0
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT, 6, 12), 22);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT, 6, 12), "6,1");
});
