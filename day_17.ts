import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

class Machine {
  registers: number[] = new Array(3).fill(0);
  instructionPointer = 0;
  halted = false;
  program: ReadonlyArray<number>;
  output: number[] = [];

  constructor(program: ReadonlyArray<number>) {
    this.instructionPointer = 0;
    this.halted = false;
    this.program = program;
  }

  clone(): Machine {
    const clone = new Machine(this.program);
    clone.registers = this.registers.slice();
    clone.instructionPointer = this.instructionPointer;
    clone.halted = this.halted;
    clone.output = this.output.slice();
    return clone;
  }

  outputString(): string {
    return this.output.join(",");
  }

  static fromInput(input: string): Machine {
    const m =
      /^Register A: (\d+)\nRegister B: (\d+)\nRegister C: (\d+)\n\nProgram: ([\d,]+)\n$/
        .exec(
          input,
        );
    if (!m) {
      throw new Error("Invalid input");
    }
    const machine = new Machine(
      Object.freeze(m[4].split(",").map((s) => parseInt(s, 10))),
    );
    machine.registers[0] = parseInt(m[1], 10);
    machine.registers[1] = parseInt(m[2], 10);
    machine.registers[2] = parseInt(m[3], 10);
    return machine;
  }

  #evaluateComboOperand(operand: number): number {
    if (operand <= 3) {
      return operand;
    }
    if (operand <= 6) {
      return this.registers[operand - 4];
    }
    throw new Error(`Invalid combo operand: ${operand}`);
  }

  runUntilHalt(): void {
    while (!this.halted) {
      this.runSteps(1024);
    }
  }

  runSteps(steps: number): void {
    if (this.halted) {
      return;
    }
    for (let i = 0; i < steps; i++) {
      if (this.instructionPointer + 1 >= this.program.length) {
        this.halted = true;
        return;
      }
      const opcode = this.program[this.instructionPointer];
      const operand = this.program[this.instructionPointer + 1];
      let didJump = false;
      switch (opcode) {
        case 0: { // `adv` (division)
          this.registers[0] >>= this.#evaluateComboOperand(operand);
          break;
        }
        case 1: { // `bxl` (bitwise xor)
          this.registers[1] ^= operand;
          break;
        }
        case 2: { // `bst`
          this.registers[1] = this.#evaluateComboOperand(operand) & 0x7;
          break;
        }
        case 3: { // `jnz`
          if (this.registers[0] !== 0) {
            this.instructionPointer = operand;
            didJump = true;
          }
          break;
        }
        case 4: { // `bxc` (bitwise XOR)
          this.registers[1] ^= this.registers[2];
          break;
        }
        case 5: { // `out`
          this.output.push(this.#evaluateComboOperand(operand) & 0x7);
          break;
        }
        case 6: { // `bdv`
          this.registers[1] = this.registers[0] >>
            this.#evaluateComboOperand(operand);
          break;
        }
        case 7: { // `cdv`
          this.registers[2] = this.registers[0] >>
            this.#evaluateComboOperand(operand);
          break;
        }
        default: {
          throw new Error(`Invalid opcode: ${opcode}`);
        }
      }
      if (!didJump) {
        this.instructionPointer += 2;
      }
    }
  }
}

function part1(input: string): string {
  const machine = Machine.fromInput(input);
  machine.runUntilHalt();
  return machine.outputString();
}

function part2(input: string): number {
  // TODO this function doesn't yet finish running on the real input in a
  // reasonable time.
  const templateMachine = Machine.fromInput(input);
  const expectedOutput = templateMachine.program;
  let i = 0;
  tryValue: while (true) {
    const machine = templateMachine.clone();
    const iteration = i++;
    machine.registers[0] = iteration;

    let checkedOutputs = 0;
    while (!machine.halted) {
      machine.runSteps(2);
      if (machine.output.length > expectedOutput.length) {
        continue tryValue;
      }
      while (checkedOutputs < machine.output.length) {
        if (machine.output[checkedOutputs] !== expectedOutput[checkedOutputs]) {
          continue tryValue;
        }
        checkedOutputs++;
      }
    }
    if (machine.output.length === expectedOutput.length) {
      return iteration;
    }
  }
}

if (import.meta.main) {
  runPart(2024, 17, 1, part1);
  // runPart(2024, 17, 2, part2);
}

const TEST_INPUT = `\
Register A: 729
Register B: 0
Register C: 0

Program: 0,1,5,4,3,0
`;

Deno.test("part1 small example 1", () => {
  const machine = new Machine([2, 6]);
  machine.registers[2] = 9;
  machine.runUntilHalt();
  assertEquals(machine.registers[1], 1);
});

Deno.test("part1 small example 2", () => {
  const machine = new Machine([5, 0, 5, 1, 5, 4]);
  machine.registers[0] = 10;
  machine.runUntilHalt();
  assertEquals(machine.output, [0, 1, 2]);
});

Deno.test("part1 test input", () => {
  assertEquals(part1(TEST_INPUT), "4,6,3,5,6,3,5,2,1,0");
});

Deno.test("part2", () => {
  assertEquals(
    part2(`\
Register A: 2024
Register B: 0
Register C: 0

Program: 0,3,5,4,3,0
`),
    117440,
  );
});
