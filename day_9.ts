import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

interface Span {
  length: number;
  fileId: number | undefined;
}

function parseDiskMap(input: string): Span[] {
  return Array.from(input.trimEnd()).map((chr, i) => ({
    length: Number(chr),
    fileId: i % 2 === 0 ? i / 2 : undefined,
  }));
}

function parseBlocks(input: string): Span[] {
  return Array.from(input.trimEnd()).reduce<Span[]>((spans, chr) => {
    const fileId = chr === "." ? undefined : Number(chr);
    const lastSpan = spans.at(-1);
    if (lastSpan && lastSpan.fileId === fileId) {
      lastSpan.length++;
    } else {
      spans.push({ length: 1, fileId });
    }
    return spans;
  }, []);
}

function spansToBlocks(spans: Span[]): string {
  return spans.map(({ length, fileId }) =>
    (fileId === undefined ? "." : String(fileId)).repeat(length)
  ).join("");
}

function checksumSpans(spans: Span[]): number {
  let position = 0;
  let result = 0;
  for (const span of spans) {
    if (span.fileId !== undefined) {
      const firstTerm = position * span.fileId;
      const lastTerm = (position + span.length - 1) * span.fileId;
      const spanChecksum = span.length * (firstTerm + lastTerm) / 2;
      result += spanChecksum;
    }
    position += span.length;
  }
  return result;
}

function part1(input: string): number {
  const spans = parseDiskMap(input);
  while (true) {
    const lastFileSpanIndex = spans.findLastIndex(({ fileId }) =>
      fileId !== undefined
    );
    const firstFreeSpanIndex = spans.findIndex(({ fileId }) =>
      fileId === undefined
    );
    if (
      lastFileSpanIndex === -1 ||
      firstFreeSpanIndex === -1 ||
      lastFileSpanIndex < firstFreeSpanIndex
    ) {
      break;
    }
    const lastFileSpan = spans[lastFileSpanIndex];
    const firstFreeSpan = spans[firstFreeSpanIndex];
    if (firstFreeSpan.length === lastFileSpan.length) {
      firstFreeSpan.fileId = lastFileSpan.fileId;
      lastFileSpan.fileId = undefined;
    } else if (firstFreeSpan.length < lastFileSpan.length) {
      firstFreeSpan.fileId = lastFileSpan.fileId;
      lastFileSpan.length -= firstFreeSpan.length;
      spans.splice(lastFileSpanIndex + 1, 0, {
        length: firstFreeSpan.length,
        fileId: undefined,
      });
    } else {
      const newEmptySpanLength = firstFreeSpan.length - lastFileSpan.length;
      firstFreeSpan.length = lastFileSpan.length;
      firstFreeSpan.fileId = lastFileSpan.fileId;
      lastFileSpan.fileId = undefined;
      spans.splice(firstFreeSpanIndex + 1, 0, {
        length: newEmptySpanLength,
        fileId: undefined,
      });
    }
  }
  return checksumSpans(spans);
}

// function part2(input: string): number {
//   const spans = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2024, 9, 1, part1);
  // runPart(2024, 9, 2, part2);
}

const TEST_INPUT = `\
2333133121414131402
`;

Deno.test("checksumSpans", () => {
  assertEquals(
    checksumSpans(parseBlocks("0099811188827773336446555566..............")),
    1928,
  );
});

Deno.test("spansToBlocks", () => {
  assertEquals(
    spansToBlocks(parseBlocks("0099811188827773336446555566..............")),
    "0099811188827773336446555566..............",
  );
});

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 1928);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
