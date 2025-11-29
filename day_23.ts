import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
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
  graph = buildGraph(connections),
): Generator<string[]> {
  /** Contains the three nodes sorted and joined by ":" */
  const previouslyFoundSets = new Set<string>();

  for (const [a, b] of connections) {
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

function* getAllSetsOfConnectedNodes(
  connections: Array<[string, string]>,
  minSize = 4,
): Generator<string[]> {
  const graph = buildGraph(connections);

  /** Contains the nodes sorted and joined by ":" */
  const previouslyConsideredSets = new Set<string>();

  function* search(
    sortedCandidate: string[],
    commonConnections = sortedCandidate
      .map((node) => graph.get(node)!)
      .reduce((a, b) => a.intersection(b)),
  ): Generator<string[]> {
    if (commonConnections.size === 0) {
      if (sortedCandidate.length >= minSize) {
        yield sortedCandidate;
      }
    } else {
      for (const commonConnection of commonConnections) {
        const newCandidate = [...sortedCandidate, commonConnection].sort();
        const newCommonConnections = commonConnections
          .intersection(graph.get(commonConnection)!);
        const key = newCandidate.join(":");
        if (previouslyConsideredSets.has(key)) {
          continue;
        }
        previouslyConsideredSets.add(key);
        yield* search(newCandidate, newCommonConnections);
      }
    }
  }

  for (const threeSet of getAllSetsOfThreeConnectedNodes(connections, graph)) {
    yield* search(threeSet);
  }
}

function part2(input: string): string {
  const connections = parse(input);

  const result = maxBy(
    getAllSetsOfConnectedNodes(connections),
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
