import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { aStar } from "@macil/pathfinding/directed/a_star";

interface Setup {
  patterns: string[];
  designs: string[];
}

function parse(input: string): Setup {
  const [patternsSection, _ignored, ...designsSections] = input.trimEnd()
    .split("\n");
  const patterns = patternsSection.split(",").map((s) => s.trim());
  const designs = designsSections.map((s) => s.trim());
  return { patterns, designs };
}

function isDesignSolvable(design: string, patterns: string[]): boolean {
  const result = aStar<string>({
    start: "",
    *successors(current) {
      for (const pattern of patterns) {
        const next = current + pattern;
        if (design.startsWith(next)) {
          yield [next, 1];
        }
      }
    },
    heuristic: (current) => design.length - current.length,
    success: (current) => current === design,
    key: (current) => current,
  });
  return result !== undefined;
}

function part1(input: string): number {
  const setup = parse(input);
  return setup.designs
    .filter((design) => isDesignSolvable(design, setup.patterns))
    .length;
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2024, 19, 1, part1);
  // runPart(2024, 19, 2, part2);
}

const TEST_INPUT = `\
r, wr, b, g, bwu, rb, gb, br

brwrr
bggr
gbbr
rrbgbr
ubwu
bwurrg
brgr
bbrgwb
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 6);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
