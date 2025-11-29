import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { CharacterGrid } from "./grid/grid.ts";
import { Location } from "./grid/location.ts";
import { aStar } from "@macil/pathfinding/directed/a_star";
import { orthogonalNeighbors, Vector } from "./grid/vector.ts";

function parse(input: string): string[] {
  return input.trimEnd().split("\n");
}

const numericKeypad = CharacterGrid.fromString(`\
789
456
123
 0A
`);
const numericKeypadKeyLocations: Map<string, Location> = new Map(
  numericKeypad.valuesWithLocations()
    .filter(({ value }) => value !== " ")
    .map(({ location, value }) => [value, location]),
);

const directionalKeypad = CharacterGrid.fromString(`\
 ^A
<v>
`);
const directionalKeypadKeyLocations: Map<string, Location> = new Map(
  directionalKeypad.valuesWithLocations()
    .filter(({ value }) => value !== " ")
    .map(({ location, value }) => [value, location]),
);

const directionsBySymbol: Map<string, Vector> = new Map([
  ["^", new Vector(-1, 0)],
  ["v", new Vector(1, 0)],
  ["<", new Vector(0, -1)],
  [">", new Vector(0, 1)],
]);

interface PathNode {
  numericKeysPressed: string;
  robotNumericKeypadLocation: Location;
  /**
   * Each directional keypad controls the next one. The last one controls the
   * numeric keypad.
   */
  robotDirectionalKeypadLocations: Location[];
}

function pathNodeToString(node: PathNode): string {
  return `${node.numericKeysPressed}|${node.robotNumericKeypadLocation.toString()}|` +
    node.robotDirectionalKeypadLocations.map((loc) => loc.toString()).join(":");
}

function calculcateShortestButtonSequence(code: string): number {
  const result = aStar<PathNode>({
    start: {
      numericKeysPressed: "",
      robotNumericKeypadLocation: numericKeypadKeyLocations.get("A")!,
      robotDirectionalKeypadLocations: new Array<Location>(2).fill(
        directionalKeypadKeyLocations.get("A")!,
      ),
    },
    *successors(current) {
      function* getNodesFromButtonBeingPressed(
        directionalKeypadIndex: number,
      ): Generator<[PathNode, number]> {
        const nextKeypadIndex = directionalKeypadIndex + 1;
        const location =
          current.robotDirectionalKeypadLocations[directionalKeypadIndex];
        const buttonBeingPushed = directionalKeypad.get(location)!;
        if (buttonBeingPushed === "A") {
          if (
            nextKeypadIndex < current.robotDirectionalKeypadLocations.length
          ) {
            // trigger press on next directional keypad
            yield* getNodesFromButtonBeingPressed(nextKeypadIndex);
          } else {
            // trigger press on numeric keypad
            const numericKey = numericKeypad.get(
              current.robotNumericKeypadLocation,
            )!;
            if (code[current.numericKeysPressed.length] === numericKey) {
              yield [{
                numericKeysPressed: current.numericKeysPressed + numericKey,
                robotNumericKeypadLocation: current.robotNumericKeypadLocation,
                robotDirectionalKeypadLocations:
                  current.robotDirectionalKeypadLocations,
              }, 1];
            }
          }
        } else {
          const move = directionsBySymbol.get(buttonBeingPushed)!;
          if (
            nextKeypadIndex < current.robotDirectionalKeypadLocations.length
          ) {
            // move next directional keypad cursor
            const nextKeypadLocation =
              current.robotDirectionalKeypadLocations[nextKeypadIndex];
            const newNextKeypadLocation = nextKeypadLocation.add(move);
            const newValue = directionalKeypad.get(newNextKeypadLocation);
            if (newValue !== undefined && newValue !== " ") {
              yield [{
                numericKeysPressed: current.numericKeysPressed,
                robotNumericKeypadLocation: current.robotNumericKeypadLocation,
                robotDirectionalKeypadLocations: [
                  ...current.robotDirectionalKeypadLocations.slice(
                    0,
                    nextKeypadIndex,
                  ),
                  newNextKeypadLocation,
                  ...current.robotDirectionalKeypadLocations.slice(
                    nextKeypadIndex + 1,
                  ),
                ],
              }, 1];
            }
          } else {
            // move numeric keypad cursor
            const newNextKeypadLocation = current.robotNumericKeypadLocation
              .add(move);
            const newValue = numericKeypad.get(newNextKeypadLocation);
            if (newValue !== undefined && newValue !== " ") {
              yield [{
                numericKeysPressed: current.numericKeysPressed,
                robotNumericKeypadLocation: newNextKeypadLocation,
                robotDirectionalKeypadLocations:
                  current.robotDirectionalKeypadLocations,
              }, 1];
            }
          }
        }
      }
      // handle user commanding first robot to press button
      yield* getNodesFromButtonBeingPressed(0);

      // handle user commanding first robot to move cursor
      yield* orthogonalNeighbors()
        .map((move) => current.robotDirectionalKeypadLocations[0].add(move))
        .filter((newDirPadLoc) => {
          const value = directionalKeypad.get(newDirPadLoc);
          return value !== undefined && value !== " ";
        })
        .map((newDirPadLoc): [PathNode, number] => [{
          numericKeysPressed: current.numericKeysPressed,
          robotNumericKeypadLocation: current.robotNumericKeypadLocation,
          robotDirectionalKeypadLocations: [
            newDirPadLoc,
            ...current.robotDirectionalKeypadLocations.slice(1),
          ],
        }, 1]);
    },
    // not a great heuristic
    heuristic: (current) => code.length - current.numericKeysPressed.length,
    success: (current) => current.numericKeysPressed === code,
    key: pathNodeToString,
  });
  if (!result) {
    throw new Error("No button sequence found");
  }
  return result[1];
}

function calculateComplexityScore(code: string): number {
  return calculcateShortestButtonSequence(code) * parseInt(code, 10);
}

function part1(input: string): number {
  const items = parse(input);
  return items.map(calculateComplexityScore).reduce((a, b) => a + b, 0);
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2024, 21, 1, part1);
  // runPart(2024, 21, 2, part2);
}

const TEST_INPUT = `\
029A
980A
179A
456A
379A
`;

Deno.test("part1", () => {
  assertEquals(part1("029A"), 68 * 29);
  assertEquals(part1(TEST_INPUT), 126384);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
