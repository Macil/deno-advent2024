import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { combinationCollection } from "@hugoalh/setation/collection";
import { maxBy } from "@std/collections/max-by";

function parse(input: string): Array<[string, string]> {
  return input.trimEnd().split("\n")
    .map((line) => line.split("-") as [string, string]);
}

function buildGraph(
  edges: Iterable<[string, string]>,
): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();
  for (const [from, to] of edges) {
    let fromSet = graph.get(from);
    if (!fromSet) {
      fromSet = new Set();
      graph.set(from, fromSet);
    }
    fromSet.add(to);

    let toSet = graph.get(to);
    if (!toSet) {
      toSet = new Set();
      graph.set(to, toSet);
    }
    toSet.add(from);
  }
  return graph;
}

function* getAllSetsOfThreeConnectedNodes(
  connections: Array<[string, string]>,
): Generator<string[]> {
  const graph = buildGraph(connections);

  /** Contains the three nodes sorted and joined by ":" */
  const previouslyFoundSets = new Set<string>();

  for (const connection of connections) {
    const [a, b] = connection;

    const aConnections = graph.get(a)!;
    const bConnections = graph.get(b)!;

    const commonConnections = aConnections.intersection(bConnections);
    for (const commonConnection of commonConnections) {
      const sortedConnection = [a, b, commonConnection].sort();

      const key = sortedConnection.join(":");
      if (previouslyFoundSets.has(key)) {
        continue;
      }
      previouslyFoundSets.add(key);

      yield sortedConnection;
    }
  }
}

function part1(input: string): number {
  const connections = parse(input);

  return getAllSetsOfThreeConnectedNodes(connections)
    .filter((comp) => comp.some((node) => node[0] === "t"))
    .reduce((count) => count + 1, 0);
}

function* getAllSetsOfMoreThanThreeConnectedNodes(
  connections: Array<[string, string]>,
): Generator<string[]> {
  const graph = buildGraph(connections);

  /** Contains the nodes sorted and joined by ":" */
  const previouslyFoundSets = new Set<string>();

  for (const [a, b] of connections) {
    const aConnections = graph.get(a)!;
    const bConnections = graph.get(b)!;

    const commonConnections = aConnections.intersection(bConnections);
    if (commonConnections.size < 2) continue;
    const commonConnectionsArray = Array.from(commonConnections);
    for (let i = 0; i < commonConnectionsArray.length - 1; i++) {
      const commonConnection = commonConnectionsArray[i];
      const commonConnectionConnections = graph.get(commonConnection)!;
      const restCommonConnections = commonConnectionsArray
        .slice(i + 1)
        .filter((connection) => commonConnectionConnections.has(connection))
        .sort();

      if (restCommonConnections.length === 0) continue;

      const allRestCombinations = combinationCollection(
        new Map<number, Array<string | undefined>>(
          restCommonConnections.map((c, index) => [index, [undefined, c]]),
        ),
      );
      for (const combination of allRestCombinations) {
        const selectedConnections = combination.values()
          .filter((c) => c !== undefined)
          .toArray();
        if (selectedConnections.length === 0) continue;

        // We already know each of selectedCombinations is connected to `a`, `b`, and `commonConnection`.
        // We just need to check they are connected to each other.
        const allConnected = selectedConnections
          .every((connA, indexA) => {
            const connAConnections = graph.get(connA)!;
            return selectedConnections
              .slice(indexA + 1)
              .every((connB) => connAConnections.has(connB));
          });
        if (allConnected) {
          const sortedConnection = [
            a,
            b,
            commonConnection,
            ...selectedConnections,
          ].sort();
          const key = sortedConnection.join(":");
          if (previouslyFoundSets.has(key)) {
            continue;
          }
          previouslyFoundSets.add(key);
          yield sortedConnection;
        }
      }
    }
  }
}

function part2(input: string): string {
  const connections = parse(input);

  const result = maxBy(
    getAllSetsOfMoreThanThreeConnectedNodes(connections),
    (set) => set.length,
  );
  if (!result) {
    throw new Error("No result found");
  }
  return result.join(",");
}

if (import.meta.main) {
  runPart(2024, 23, 1, part1);
  runPart(2024, 23, 2, part2);
}

const TEST_INPUT = `\
kh-tc
qp-kh
de-cg
ka-co
yn-aq
qp-ub
cg-tb
vc-aq
tb-ka
wh-tc
yn-cg
kh-ub
ta-co
de-co
tc-td
tb-wq
wh-td
ta-ka
td-qp
aq-cg
wq-ub
ub-vc
de-ta
wq-aq
wq-vc
wh-yn
ka-de
kh-ta
co-tc
wh-qp
tb-vc
td-yn
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 7);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), "co,de,ka,ta");
});
