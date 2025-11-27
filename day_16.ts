import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { Location } from "./grid/location.ts";
import { CharacterGrid, FixedSizeGrid } from "./grid/grid.ts";
import {
  aStar,
  aStarBag,
  AStarOptions,
} from "@macil/pathfinding/directed/a_star";
import { clockwise, counterclockwise, Direction } from "./grid/direction.ts";

interface Maze {
  grid: CharacterGrid;
  start: Location;
  end: Location;
}

interface PathNode {
  location: Location;
  direction: Direction;
}

function parse(input: string): Maze {
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

function getAStarOptions(
  grid: FixedSizeGrid<string>,
  from: Location,
  to: Location,
): AStarOptions<PathNode> {
  return {
    start: {
      location: from,
      direction: "right",
    },
    *successors(node) {
      const forwardLocation = node.location.relative(node.direction, 1);
      const forwardValue = grid.get(forwardLocation);
      if (forwardValue && forwardValue !== "#") {
        yield [{
          location: forwardLocation,
          direction: node.direction,
        }, 1];
      }
      yield [{
        location: node.location,
        direction: clockwise(node.direction),
      }, 1000];
      yield [{
        location: node.location,
        direction: counterclockwise(node.direction),
      }, 1000];
    },
    // TODO could factor in direction too
    heuristic(node) {
      return node.location.subtract(to).l1Norm();
    },
    success: (node) => node.location.equals(to),
    key: (node) => node.location.toString() + ":" + node.direction,
  };
}

function findMinScoreBetweenLocations(
  grid: FixedSizeGrid<string>,
  from: Location,
  to: Location,
): number {
  const result = aStar(getAStarOptions(grid, from, to));
  if (!result) {
    throw new Error("No path found");
  }

  return result![1];
}

function part1(input: string): number {
  const maze = parse(input);
  return findMinScoreBetweenLocations(maze.grid, maze.start, maze.end);
}

function countSquaresOnShortestPaths(
  grid: FixedSizeGrid<string>,
  from: Location,
  to: Location,
): number {
  const allPathLocations = new Set<string>();

  const result = aStarBag(getAStarOptions(grid, from, to));
  if (result) {
    const [paths] = result;
    for (const nodeList of paths) {
      for (const node of nodeList) {
        allPathLocations.add(node.location.toString());
      }
    }
  }

  return allPathLocations.size;
}

function part2(input: string): number {
  const maze = parse(input);
  return countSquaresOnShortestPaths(maze.grid, maze.start, maze.end);
}

if (import.meta.main) {
  runPart(2024, 16, 1, part1);
  runPart(2024, 16, 2, part2);
}

const TEST_INPUT = `\
###############
#.......#....E#
#.#.###.#.###.#
#.....#.#...#.#
#.###.#####.#.#
#.#.#.......#.#
#.#.#####.###.#
#...........#.#
###.#.#####.#.#
#...#.....#.#.#
#.#.#.###.#.#.#
#.....#...#.#.#
#.###.#.#.#.#.#
#S..#.....#...#
###############
`;

const TEST_INPUT2 = `\
#################
#...#...#...#..E#
#.#.#.#.#.#.#.#.#
#.#.#.#...#...#.#
#.#.#.#.###.#.#.#
#...#.#.#.....#.#
#.#.#.#.#.#####.#
#.#...#.#.#.....#
#.#.#####.#.###.#
#.#.#.......#...#
#.#.###.#####.###
#.#.#...#.....#.#
#.#.#.#####.###.#
#.#.#.........#.#
#.#.#.#########.#
#S#.............#
#################
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 7036);
  assertEquals(part1(TEST_INPUT2), 11048);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 45);
  assertEquals(part2(TEST_INPUT2), 64);
});
