import { assertEquals, AssertionError } from "@std/assert";
import { runPart } from "@macil/aocd";
import { z } from "@zod/zod";
import z00 from "./day_24_test_data/z00.json" with { type: "json" };
import z01 from "./day_24_test_data/z01.json" with { type: "json" };
import z02 from "./day_24_test_data/z02.json" with { type: "json" };

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

  getOutput(): number {
    return Number(
      this.#config.connections.keys()
        .filter((name) => name.startsWith("z"))
        .map((name) => BigInt(this.getValue(name)) << BigInt(name.slice(1)))
        .reduce((acc, value) => acc | value, 0n),
    );
  }
}

function part1(input: string): number {
  const configuration = parse(input);
  const context = new ExecutionContext(configuration);
  return context.getOutput();
}

type SymbolicExpression =
  | { type: "inputBit"; input: "x" | "y"; bitIndex: number }
  | {
    type: "operation";
    gate: Gate;
    inputs: [SymbolicExpression, SymbolicExpression];
  };

/** I used this manually to inspect the input data. */
// deno-lint-ignore no-unused-vars
function convertWireToSymbolicExpression(
  wireName: string,
  connections: Map<string, { gate: Gate; inputs: [string, string] }>,
): SymbolicExpression {
  if (wireName[0] === "x" || wireName[0] === "y") {
    const input = wireName[0] as "x" | "y";
    const bitIndex = Number(wireName.slice(1));
    return { type: "inputBit", input, bitIndex };
  }

  const connection = connections.get(wireName);
  if (!connection) {
    throw new Error(`No connection for wire: ${wireName}`);
  }

  return {
    type: "operation",
    gate: connection.gate,
    inputs: [
      convertWireToSymbolicExpression(connection.inputs[0], connections),
      convertWireToSymbolicExpression(connection.inputs[1], connections),
    ],
  };
}

function expressionsEqual(
  expr1: SymbolicExpression,
  expr2: SymbolicExpression,
): boolean {
  if (expr1.type !== expr2.type) {
    return false;
  }
  if (expr1.type === "inputBit" && expr2.type === "inputBit") {
    return expr1.input === expr2.input && expr1.bitIndex === expr2.bitIndex;
  } else if (expr1.type === "operation" && expr2.type === "operation") {
    if (expr1.gate !== expr2.gate) {
      return false;
    }
    const [in1a, in1b] = expr1.inputs;
    const [in2a, in2b] = expr2.inputs;

    // Check both possible input orderings
    return (
      (expressionsEqual(in1a, in2a) && expressionsEqual(in1b, in2b)) ||
      (expressionsEqual(in1a, in2b) && expressionsEqual(in1b, in2a))
    );
  }
  return false;
}

function checkIfWireShallowMatchesExpression(
  wireName: string,
  expression: SymbolicExpression,
  connections: ReadonlyMap<string, { gate: Gate; inputs: [string, string] }>,
): boolean {
  if (expression.type === "inputBit") {
    const expectedWireName = `${expression.input}${
      String(expression.bitIndex).padStart(2, "0")
    }`;
    return wireName === expectedWireName;
  } else if (expression.type === "operation") {
    const connection = connections.get(wireName);
    if (!connection) {
      // If the expression is an operation, then the wire must have a connection
      // in order to match.
      return false;
    }
    return connection.gate === expression.gate;
  } else {
    expression satisfies never;
    throw new Error(`Unknown expression type: ${expression}`);
  }
}

interface Solution {
  neededSwaps: Array<[string, string]>;
  wireDependencies: Set<string>;
}

function findSolutionsToMatchWireToExpression(
  wireName: string,
  expression: SymbolicExpression,
  connections: ReadonlyMap<string, { gate: Gate; inputs: [string, string] }>,
  committedWireNames: ReadonlySet<string>,
  allowedSwaps: number,
  allowHeadSwap = true,
): Solution[] {
  function attemptsWithoutHeadSwap(): Solution[] {
    if (
      !checkIfWireShallowMatchesExpression(wireName, expression, connections)
    ) {
      return [];
    }

    switch (expression.type) {
      case "inputBit": {
        return [{
          neededSwaps: [],
          wireDependencies: new Set([wireName]),
        }];
      }
      case "operation": {
        const connection = connections.get(wireName);
        if (!connection) {
          // This should not be possible because of the shallow check above.
          throw new Error(`No connection for wire: ${wireName}`);
        }
        const [input1, input2] = connection.inputs;
        const [exprInput1, exprInput2] = expression.inputs;

        // Try to match inputs to expressions in both possible orders without wire swaps.

        const input1MatchesExprInput1 = findSolutionsToMatchWireToExpression(
          input1,
          exprInput1,
          connections,
          committedWireNames,
          0,
          false,
        ).at(0);
        const input2MatchesExprInput2 = findSolutionsToMatchWireToExpression(
          input2,
          exprInput2,
          connections,
          committedWireNames,
          0,
          false,
        ).at(0);
        if (input1MatchesExprInput1 && input2MatchesExprInput2) {
          for (const dep of input2MatchesExprInput2.wireDependencies) {
            input1MatchesExprInput1.wireDependencies.add(dep);
          }
          return [input1MatchesExprInput1];
        }

        const input1MatchesExprInput2 = findSolutionsToMatchWireToExpression(
          input1,
          exprInput2,
          connections,
          committedWireNames,
          0,
          false,
        ).at(0);
        const input2MatchesExprInput1 = findSolutionsToMatchWireToExpression(
          input2,
          exprInput1,
          connections,
          committedWireNames,
          0,
          false,
        ).at(0);
        if (
          input1MatchesExprInput2 && input2MatchesExprInput1
        ) {
          for (const dep of input2MatchesExprInput1.wireDependencies) {
            input1MatchesExprInput2.wireDependencies.add(dep);
          }
          return [input1MatchesExprInput2];
        }

        if (allowedSwaps >= 1) {
          // If any of the attempts worked, lock that one in and attempt to find
          // the other with swaps allowed.
          const attemptsAndUnmatchedInputs: Array<
            [Solution | undefined, string, SymbolicExpression]
          > = [
            [input1MatchesExprInput1, input2, exprInput2],
            [input2MatchesExprInput2, input1, exprInput1],
            [input1MatchesExprInput2, input2, exprInput1],
            [input2MatchesExprInput1, input1, exprInput2],
          ];
          const successfulAttempt = attemptsAndUnmatchedInputs
            .find((t): t is [Solution, string, SymbolicExpression] => !!t[0]);
          if (successfulAttempt) {
            const [matchedResult, unmatchedInput, unmatchedExprInput] =
              successfulAttempt;

            const newCommittedWireNames = new Set(committedWireNames);
            for (const wireName of matchedResult.wireDependencies) {
              newCommittedWireNames.add(wireName);
            }
            for (const [wireA, wireB] of matchedResult.neededSwaps) {
              newCommittedWireNames.add(wireA);
              newCommittedWireNames.add(wireB);
            }

            const resultsWithSwaps = findSolutionsToMatchWireToExpression(
              unmatchedInput,
              unmatchedExprInput,
              connections,
              newCommittedWireNames,
              allowedSwaps,
              true,
            );
            if (resultsWithSwaps.length > 0) {
              return resultsWithSwaps.map((solution) => {
                for (const wireName of matchedResult.wireDependencies) {
                  solution.wireDependencies.add(wireName);
                }
                return solution;
              });
            }
          }
        }

        if (allowedSwaps >= 2) {
          // prevent the inputs from being swapped
          const committedWireNamesWithInputs = new Set(committedWireNames);
          committedWireNamesWithInputs.add(input1);
          committedWireNamesWithInputs.add(input2);

          const firstSolutions: Array<
            { inputsSwapped: boolean; results: Solution[] }
          > = [false, true].map(
            (inputsSwapped) => ({
              inputsSwapped,
              results: findSolutionsToMatchWireToExpression(
                inputsSwapped ? input2 : input1,
                exprInput1,
                connections,
                committedWireNamesWithInputs,
                allowedSwaps,
                true,
              ),
            }),
          );

          return firstSolutions.flatMap(({ inputsSwapped, results }) => {
            return results.flatMap((firstResult) => {
              const newConnections = new Map(connections);
              for (const [wireA, wireB] of firstResult.neededSwaps) {
                const tmp = newConnections.get(wireA)!;
                newConnections.set(
                  wireA,
                  newConnections.get(wireB)!,
                );
                newConnections.set(wireB, tmp);
              }

              const newCommittedWireNames = new Set(committedWireNames);
              for (const wireName of firstResult.wireDependencies) {
                newCommittedWireNames.add(wireName);
              }
              for (const [wireA, wireB] of firstResult.neededSwaps) {
                newCommittedWireNames.add(wireA);
                newCommittedWireNames.add(wireB);
              }

              const secondResults = findSolutionsToMatchWireToExpression(
                inputsSwapped ? input1 : input2,
                exprInput2,
                newConnections,
                newCommittedWireNames,
                allowedSwaps - firstResult.neededSwaps.length,
                true,
              );
              return secondResults.map((secondResult) => {
                for (const wireName of firstResult.wireDependencies) {
                  secondResult.wireDependencies.add(wireName);
                }
                secondResult.neededSwaps.push(...firstResult.neededSwaps);
                return secondResult;
              });
            });
          });
        }

        return [];
      }
      default: {
        expression satisfies never;
        throw new Error(`Unknown expression type: ${expression}`);
      }
    }
  }

  const resultsWithoutHeadSwap = attemptsWithoutHeadSwap();

  const resultWithoutAnySwaps = resultsWithoutHeadSwap
    .find((res) => res.neededSwaps.length === 0);
  if (resultWithoutAnySwaps) {
    return [resultWithoutAnySwaps];
  }

  if (
    allowHeadSwap && allowedSwaps > 0 &&
    // only gate outputs can be swapped, not inputs
    wireName[0] !== "x" && wireName[0] !== "y"
  ) {
    const swappableWireNames = connections.keys()
      .filter((name) => name !== wireName && !committedWireNames.has(name));

    const moreResults = swappableWireNames.flatMap((swappableWireName) => {
      const swapResults = findSolutionsToMatchWireToExpression(
        swappableWireName,
        expression,
        connections,
        committedWireNames,
        allowedSwaps - 1,
        false,
      );
      return swapResults.map((swapResult): Solution => ({
        neededSwaps: [
          [wireName, swappableWireName].sort() as [string, string],
          ...swapResult.neededSwaps,
        ],
        wireDependencies: swapResult.wireDependencies,
      }));
    });
    return [...resultsWithoutHeadSwap, ...moreResults];
  }

  return resultsWithoutHeadSwap;
}

/**
 * Gets the symbolic expression for the expected output bit at `bitIndex` when
 * adding two binary numbers.
 */
function adderExpressions(bitIndex: number): SymbolicExpression {
  function getBitInputs(
    bitIndex: number,
  ): [SymbolicExpression, SymbolicExpression] {
    return [
      { type: "inputBit", input: "x", bitIndex },
      { type: "inputBit", input: "y", bitIndex },
    ];
  }

  const bit0Inputs = getBitInputs(0);
  const bit0HalfAdderSum: SymbolicExpression = {
    type: "operation",
    gate: "XOR",
    inputs: bit0Inputs,
  };
  const bit0Carry: SymbolicExpression = {
    type: "operation",
    gate: "AND",
    inputs: bit0Inputs,
  };

  let currentSum = bit0HalfAdderSum;
  let currentCarry = bit0Carry;

  for (
    let currentBitIndex = 1;
    currentBitIndex <= bitIndex;
    currentBitIndex++
  ) {
    const currentBitInputs = getBitInputs(currentBitIndex);
    const sumXY: SymbolicExpression = {
      type: "operation",
      gate: "XOR",
      inputs: currentBitInputs,
    };
    currentSum = {
      type: "operation",
      gate: "XOR",
      inputs: [sumXY, currentCarry],
    };
    currentCarry = {
      type: "operation",
      gate: "OR",
      inputs: [
        {
          type: "operation",
          gate: "AND",
          inputs: currentBitInputs,
        },
        {
          type: "operation",
          gate: "AND",
          inputs: [currentCarry, sumXY],
        },
      ],
    };
  }

  return currentSum;
}

function getInputBitWidth(
  inputs: ReadonlyMap<string, number>,
): number {
  return Math.max(
    ...Array.from(inputs.keys())
      .filter((name) => name.startsWith("x"))
      .map((name) => Number(name.slice(1)) + 1),
  );
}

function* getAllSolutions(
  connections: ReadonlyMap<string, { gate: Gate; inputs: [string, string] }>,
  inputBitWidth: number,
  swappedPairs: number,
  expectedExpressions: (bitIndex: number) => SymbolicExpression,
): Generator<Omit<Solution, "wireDependencies">> {
  let states: Array<{
    currentConnections: Map<string, {
      gate: Gate;
      inputs: [string, string];
    }>;
    committedWireNames: Set<string>;
    swapsDone: Array<[string, string]>;
  }> = [{
    currentConnections: new Map(connections),
    committedWireNames: new Set<string>(),
    swapsDone: [],
  }];

  for (let bitIndex = 0; bitIndex < inputBitWidth; bitIndex++) {
    if (states.length === 0) {
      return;
    }
    const wireName = `z${String(bitIndex).padStart(2, "0")}`;
    const expectedExpression = expectedExpressions(bitIndex);

    states = states.flatMap((state) =>
      findSolutionsToMatchWireToExpression(
        wireName,
        expectedExpression,
        state.currentConnections,
        state.committedWireNames,
        swappedPairs - state.swapsDone.length,
      ).map((result, index): [Solution, typeof state] => {
        if (index !== 0) {
          return [result, {
            currentConnections: new Map(state.currentConnections),
            committedWireNames: new Set(state.committedWireNames),
            swapsDone: [...state.swapsDone],
          }];
        }
        return [result, state];
      }).map(([result, state]) => {
        for (const wireName of result.wireDependencies) {
          state.committedWireNames.add(wireName);
        }
        for (const swap of result.neededSwaps) {
          state.swapsDone.push(swap);
          const [wireA, wireB] = swap;
          const tmp = state.currentConnections.get(wireA)!;
          state.currentConnections.set(
            wireA,
            state.currentConnections.get(wireB)!,
          );
          state.currentConnections.set(wireB, tmp);
        }
        return state;
      })
    );
  }

  // verification pass. should be redundant but just to be sure.
  states.forEach((state) => {
    let verificationPassed = true;
    for (let bitIndex = 0; bitIndex < inputBitWidth; bitIndex++) {
      const wireName = `z${String(bitIndex).padStart(2, "0")}`;
      const expectedExpression = expectedExpressions(bitIndex);
      const result = findSolutionsToMatchWireToExpression(
        wireName,
        expectedExpression,
        state.currentConnections,
        state.committedWireNames,
        0,
      ).at(0);
      if (!result) {
        verificationPassed = false;
      }
    }
    if (!verificationPassed) {
      throw new Error("Verification failed");
    }
  });

  for (const state of states) {
    yield { neededSwaps: state.swapsDone.sort() };
  }
}

function part2(
  input: string,
  swappedPairs = 4,
  expectedExpressions = adderExpressions,
): string {
  const configuration = parse(input);

  const results = getAllSolutions(
    configuration.connections,
    getInputBitWidth(configuration.inputs),
    swappedPairs,
    expectedExpressions,
  );

  for (const result of results) {
    console.log("swaps done:", result.neededSwaps);
    return result.neededSwaps.flat().sort().join(",");
  }

  throw new Error("No solution found");
}

if (import.meta.main) {
  runPart(2024, 24, 1, part1);
  runPart(2024, 24, 2, part2);
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

Deno.test("getAllSolutions", () => {
  const configuration = parse(`\
x00: 0
x01: 1
x02: 0
x03: 1
x04: 0
x05: 1
y00: 0
y01: 0
y02: 1
y03: 1
y04: 0
y05: 1

x00 AND y00 -> z05
x01 AND y01 -> z02
x02 AND y02 -> z01
x03 AND y03 -> z03
x04 AND y04 -> z04
x05 AND y05 -> z00
`);

  assertEquals(
    Array.from(
      getAllSolutions(
        configuration.connections,
        getInputBitWidth(configuration.inputs),
        2,
        (bitIndex) => ({
          type: "operation",
          gate: "AND",
          inputs: [
            { type: "inputBit", input: "x", bitIndex },
            { type: "inputBit", input: "y", bitIndex },
          ],
        }),
      ),
    ).sort(),
    [{ neededSwaps: [["z00", "z05"], ["z01", "z02"]] }],
  );
});

Deno.test("getAllSolutions - another test", () => {
  const configuration = parse(`\
x00: 0
x01: 1
x02: 0
x03: 1
x04: 0
x05: 1
y00: 0
y01: 0
y02: 1
y03: 1
y04: 0
y05: 1

x00 XOR y00 -> m00
x01 XOR y01 -> m02
x02 XOR y02 -> m01
x03 XOR y03 -> m03
x04 XOR y04 -> z03
x05 XOR y05 -> m05
x00 AND m00 -> z00
x00 AND m01 -> z01
x00 AND m02 -> z02
x00 AND m03 -> m04
x00 AND m04 -> z04
x00 AND m05 -> z05
`);

  assertEquals(
    Array.from(
      getAllSolutions(
        configuration.connections,
        getInputBitWidth(configuration.inputs),
        2,
        (bitIndex) => ({
          type: "operation",
          gate: "AND",
          inputs: [
            { type: "inputBit", input: "x", bitIndex: 0 },
            {
              type: "operation",
              gate: "XOR",
              inputs: [
                { type: "inputBit", input: "x", bitIndex },
                { type: "inputBit", input: "y", bitIndex },
              ],
            },
          ],
        }),
      ),
    ).sort(),
    [
      { neededSwaps: [["m01", "m02"], ["m04", "z03"]] },
      { neededSwaps: [["m04", "z03"], ["z01", "z02"]] },
    ],
  );
});

function assertExpressionsEqual(
  expr1: SymbolicExpression,
  expr2: SymbolicExpression,
) {
  if (!expressionsEqual(expr1, expr2)) {
    const message = `Expressions are not equal\nExpected:\n${
      JSON.stringify(expr2, null, 2)
    }\nGot:\n${
      JSON.stringify(
        expr1,
        null,
        2,
      )
    }`;
    throw new AssertionError(message);
  }
}

Deno.test("adderExpressions z00", () => {
  assertExpressionsEqual(adderExpressions(0), z00 as SymbolicExpression);
});

Deno.test("adderExpressions z01", () => {
  assertExpressionsEqual(adderExpressions(1), z01 as SymbolicExpression);
});

Deno.test("adderExpressions z02", () => {
  assertExpressionsEqual(adderExpressions(2), z02 as SymbolicExpression);
});
