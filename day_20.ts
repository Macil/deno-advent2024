import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import {
  CharacterGrid,
  FixedSizeGrid,
  Location,
  orthogonalNeighbors,
} from "@macil/grid";
import { locationsInManhattanDistance } from "@macil/grid/locationsInManhattanDistance";
import { dijkstraAll } from "@macil/pathfinding/directed/dijkstra";
import { minBy } from "@std/collections/min-by";

interface Map {
  grid: FixedSizeGrid<string>;
  start: Location;
  end: Location;
}

function parse(input: string): Map {
  const grid = CharacterGrid.fromString(input);
  const start = grid.valuesWithLocations().find(({ value }) => value === "S")
    ?.location;
  const end = grid.valuesWithLocations().find(({ value }) => value === "E")
    ?.location;
  if (!start || !end) {
    throw new Error("Missing start or end location");
  }
  return { grid, start, end };
}

function countCheatsThatSaveAtLeast(
  map: Map,
  targetSaveTime: number,
): number {
  const forwardDijkstraAllResults = dijkstraAll<Location, number, string>({
    start: map.start,
    successors(location) {
      return orthogonalNeighbors()
        .map((neighbor): [Location, number] => [location.add(neighbor), 1])
        .filter(([loc]) => {
          const value = map.grid.get(loc);
          return value !== undefined && value !== "#";
        });
    },
    key: (location) => location.toString(),
  });

  const endEncounteredNode = forwardDijkstraAllResults
    .get(map.end.toString());
  if (!endEncounteredNode) {
    throw new Error("No path found");
  }
  const noCheatTime = endEncounteredNode.cost;

  const reverseDijkstraAllResults = dijkstraAll<Location, number, string>({
    start: map.end,
    successors(location) {
      return orthogonalNeighbors()
        .map((neighbor): [Location, number] => [location.add(neighbor), 1])
        .filter(([loc]) => {
          const value = map.grid.get(loc);
          return value !== undefined && value !== "#";
        });
    },
    key: (location) => location.toString(),
  });

  const cheatsWithinTargetTime: IteratorObject<
    { cheatUsed: { skippedWall: Location; to: Location }; timeSaved: number }
  > = map.grid.valuesWithLocations()
    .filter(({ location, value }) =>
      value === "#" &&
      location.row > 0 && location.row < map.grid.dimensions.rows - 1 &&
      location.column > 0 && location.column < map.grid.dimensions.columns - 1
    )
    .flatMap(function* ({ location }) {
      const openNeighbors = orthogonalNeighbors()
        .map((dir) => location.add(dir))
        .filter((loc) => {
          const value = map.grid.get(loc);
          return value !== undefined && value !== "#";
        })
        .filter((loc) => forwardDijkstraAllResults.has(loc.toString()));

      if (openNeighbors.length < 2) {
        return;
      }

      const closestToStart = minBy(
        openNeighbors,
        (neighbor) => forwardDijkstraAllResults.get(neighbor.toString())!.cost,
      )!;
      const closestToStartDijkstraNode = forwardDijkstraAllResults
        .get(closestToStart.toString())!;

      for (const neighbor of openNeighbors) {
        if (neighbor === closestToStart) continue;
        const reverseDijkstraNode = reverseDijkstraAllResults
          .get(neighbor.toString());
        if (!reverseDijkstraNode) continue;

        const totalSolutionTime = closestToStartDijkstraNode.cost +
          reverseDijkstraNode.cost + 2;
        const timeSaved = noCheatTime - totalSolutionTime;

        if (timeSaved < targetSaveTime) continue;

        yield {
          cheatUsed: { skippedWall: location, to: neighbor },
          timeSaved,
        };
      }
    });

  return cheatsWithinTargetTime.reduce((count) => count + 1, 0);
}

function part1(input: string, targetSaveTime = 100): number {
  const map = parse(input);
  return countCheatsThatSaveAtLeast(map, targetSaveTime);
}

const CHEAT_TIME_PART2 = 20;

function countCheatsThatSaveAtLeastPart2(
  map: Map,
  targetSaveTime: number,
): number {
  const forwardDijkstraAllResults = dijkstraAll<Location, number, string>({
    start: map.start,
    successors(location) {
      return orthogonalNeighbors()
        .map((neighbor): [Location, number] => [location.add(neighbor), 1])
        .filter(([loc]) => {
          const value = map.grid.get(loc);
          return value !== undefined && value !== "#";
        });
    },
    key: (location) => location.toString(),
  });

  const endEncounteredNode = forwardDijkstraAllResults
    .get(map.end.toString());
  if (!endEncounteredNode) {
    throw new Error("No path found");
  }
  const noCheatTime = endEncounteredNode.cost;

  const reverseDijkstraAllResults = dijkstraAll<Location, number, string>({
    start: map.end,
    successors(location) {
      return orthogonalNeighbors()
        .map((neighbor): [Location, number] => [location.add(neighbor), 1])
        .filter(([loc]) => {
          const value = map.grid.get(loc);
          return value !== undefined && value !== "#";
        });
    },
    key: (location) => location.toString(),
  });

  const possibleCheatStartLocations: IteratorObject<Location> = map.grid
    .valuesWithLocations()
    .filter(({ value, location }) =>
      value !== "#" &&
      !location.equals(map.end) &&
      forwardDijkstraAllResults.has(location.toString())
    )
    .map(({ location }) => location);

  const cheatsWithinTargetTime: IteratorObject<
    { cheatUsed: { start: Location; to: Location }; timeSaved: number }
  > = possibleCheatStartLocations
    .flatMap(function* (start) {
      const startDijkstraNode = forwardDijkstraAllResults
        .get(start.toString())!;

      for (
        const endCandidateLocation of locationsInManhattanDistance(
          start,
          CHEAT_TIME_PART2,
        )
      ) {
        if (endCandidateLocation.equals(start)) continue;
        const endCandidateValue = map.grid.get(endCandidateLocation);
        if (endCandidateValue === undefined || endCandidateValue === "#") {
          continue;
        }
        const reverseDijkstraNode = reverseDijkstraAllResults
          .get(endCandidateLocation.toString());
        if (!reverseDijkstraNode) {
          continue;
        }
        const totalSolutionTime = startDijkstraNode.cost +
          reverseDijkstraNode.cost +
          start.subtract(endCandidateLocation).l1Norm();
        const timeSaved = noCheatTime - totalSolutionTime;

        if (timeSaved < targetSaveTime) continue;

        yield {
          cheatUsed: { start, to: endCandidateLocation },
          timeSaved,
        };
      }
    });

  return cheatsWithinTargetTime.reduce((count) => count + 1, 0);
}

function part2(input: string, targetSaveTime = 100): number {
  const map = parse(input);
  return countCheatsThatSaveAtLeastPart2(map, targetSaveTime);
}

if (import.meta.main) {
  runPart(2024, 20, 1, part1);
  runPart(2024, 20, 2, part2);
}

const TEST_INPUT = `\
###############
#...#...#.....#
#.#.#.#.#.###.#
#S#...#.#.#...#
#######.#.#.###
#######.#.#...#
#######.#.###.#
###..E#...#...#
###.#######.###
#...###...#...#
#.#####.#.###.#
#.#...#.#.#...#
#.#.#.#.#.#.###
#...#...#...###
###############
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT, 64), 1);
  assertEquals(part1(TEST_INPUT, 40), 2);
  assertEquals(part1(TEST_INPUT, 38), 3);
  assertEquals(part1(TEST_INPUT, 36), 4);
  assertEquals(part1(TEST_INPUT, 20), 5);
  assertEquals(part1(TEST_INPUT, 12), 8);
  assertEquals(part1(TEST_INPUT, 10), 10);
  assertEquals(part1(TEST_INPUT, 8), 14);
  assertEquals(part1(TEST_INPUT, 6), 16);
  assertEquals(part1(TEST_INPUT, 4), 30);
  assertEquals(part1(TEST_INPUT, 2), 44);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT, 76), 3);
  assertEquals(part2(TEST_INPUT, 74), 7);
  assertEquals(part2(TEST_INPUT, 72), 29);
  assertEquals(part2(TEST_INPUT, 70), 41);
  assertEquals(part2(TEST_INPUT, 68), 55);
  assertEquals(part2(TEST_INPUT, 66), 67);
  assertEquals(part2(TEST_INPUT, 64), 86);
  assertEquals(part2(TEST_INPUT, 62), 106);
  assertEquals(part2(TEST_INPUT, 60), 129);
  assertEquals(part2(TEST_INPUT, 58), 154);
  assertEquals(part2(TEST_INPUT, 56), 193);
  assertEquals(part2(TEST_INPUT, 54), 222);
  assertEquals(part2(TEST_INPUT, 52), 253);
  assertEquals(part2(TEST_INPUT, 50), 285);
});
