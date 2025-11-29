import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

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

  const previouslyFoundSets = new Set<string>();
  function getPreviouslyFoundKey(a: string, b: string, c: string): string {
    return [a, b, c].sort().join(":");
  }

  for (const connection of connections) {
    const [a, b] = connection;

    const aConnections = graph.get(a)!;
    const bConnections = graph.get(b)!;

    const commonConnections = aConnections.intersection(bConnections);
    for (const commonConnection of commonConnections) {
      const key = getPreviouslyFoundKey(a, b, commonConnection);
      if (previouslyFoundSets.has(key)) {
        continue;
      }
      previouslyFoundSets.add(key);
      yield [a, b, commonConnection];
    }
  }
}

function part1(input: string): number {
  const connections = parse(input);

  return getAllSetsOfThreeConnectedNodes(connections)
    .filter((comp) => comp.some((node) => node[0] === "t"))
    .reduce((count) => count + 1, 0);
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2024, 23, 1, part1);
  // runPart(2024, 23, 2, part2);
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

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
