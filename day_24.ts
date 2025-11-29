import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { z } from "@zod/zod";

const Gate = z.enum(["AND", "OR", "XOR"]);
type Gate = z.infer<typeof Gate>;

interface Configuration {
  inputs: Map<string, number>;
  connections: Map<string, { gate: Gate; inputs: [string, string] }>;
}

function parse(input: string): Configuration {
  const [inputsSection, connectionsSection] = input.trimEnd().split("\n\n");
  const inputs = new Map<string, number>(
    inputsSection.split("\n").map((line) => {
      const [name, valueStr] = line.split(":").map((s) => s.trim());
      return [name, Number(valueStr)];
    }),
  );
  const connections = new Map<string, { gate: Gate; inputs: [string, string] }>(
    connectionsSection.split("\n").map((line) => {
      const [left, right] = line.split("->").map((s) => s.trim());
      const [input1, gate, input2] = left.split(/\s+/);
      return [right, { gate: Gate.parse(gate), inputs: [input1, input2] }];
    }),
  );
  return { inputs, connections };
}

class ExecutionContext {
  readonly #config: Configuration;
  #values: Map<string, number>;

  constructor(config: Configuration) {
    this.#config = config;
    this.#values = new Map(config.inputs);
  }

  getValue(name: string): number {
    const existingValue = this.#values.get(name);
    if (existingValue !== undefined) {
      return existingValue;
    }
    const connection = this.#config.connections.get(name);
    if (!connection) {
      throw new Error(`No such input or connection: ${name}`);
    }
    let result: number;
    switch (connection.gate) {
      case "AND":
        result = this.getValue(connection.inputs[0]) &
          this.getValue(connection.inputs[1]);
        break;
      case "OR":
        result = this.getValue(connection.inputs[0]) |
          this.getValue(connection.inputs[1]);
        break;
      case "XOR":
        result = this.getValue(connection.inputs[0]) ^
          this.getValue(connection.inputs[1]);
        break;
      default:
        connection.gate satisfies never;
        throw new Error(`Unknown gate: ${connection.gate}`);
    }
    this.#values.set(name, result);
    return result;
  }
}

function part1(input: string): number {
  const configuration = parse(input);
  const context = new ExecutionContext(configuration);

  return Number(
    configuration.connections.keys()
      .filter((name) => name.startsWith("z"))
      .map((name) => BigInt(context.getValue(name)) << BigInt(name.slice(1)))
      .reduce((sum, value) => sum | value, 0n),
  );
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2024, 24, 1, part1);
  // runPart(2024, 24, 2, part2);
}

const TEST_INPUT = `\
x00: 1
x01: 0
x02: 1
x03: 1
x04: 0
y00: 1
y01: 1
y02: 1
y03: 1
y04: 1

ntg XOR fgs -> mjb
y02 OR x01 -> tnw
kwq OR kpj -> z05
x00 OR x03 -> fst
tgd XOR rvg -> z01
vdt OR tnw -> bfw
bfw AND frj -> z10
ffh OR nrd -> bqk
y00 AND y03 -> djm
y03 OR y00 -> psh
bqk OR frj -> z08
tnw OR fst -> frj
gnj AND tgd -> z11
bfw XOR mjb -> z00
x03 OR x00 -> vdt
gnj AND wpb -> z02
x04 AND y00 -> kjc
djm OR pbm -> qhw
nrd AND vdt -> hwm
kjc AND fst -> rvg
y04 OR y02 -> fgs
y01 AND x02 -> pbm
ntg OR kjc -> kwq
psh XOR fgs -> tgd
qhw XOR tgd -> z09
pbm OR djm -> kpj
x03 XOR y03 -> ffh
x00 XOR y04 -> ntg
bfw OR bqk -> z06
nrd XOR fgs -> wpb
frj XOR qhw -> z04
bqk OR frj -> z07
y03 OR x01 -> nrd
hwm AND bqk -> z03
tgd XOR rvg -> z12
tnw OR pbm -> gnj
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 2024);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
