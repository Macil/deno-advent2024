import { once } from "@alexreardon/limit-once";
import { Direction } from "./direction.ts";
// deno-lint-ignore no-unused-vars
import type { Location } from "./location.ts";
import { Rotation } from "./rotation.ts";

/** A measurement of distance between two {@link Location}s */
export class Vector {
  constructor(public rows: number, public columns: number) {}

  static inDirection(direction: Direction, size: number): Vector {
    switch (direction) {
      case "up":
        return new Vector(-size, 0);
      case "down":
        return new Vector(size, 0);
      case "left":
        return new Vector(0, -size);
      case "right":
        return new Vector(0, size);
    }
  }

  static upward(size: number): Vector {
    return new Vector(-size, 0);
  }

  static downward(size: number): Vector {
    return new Vector(size, 0);
  }

  static leftward(size: number): Vector {
    return new Vector(0, -size);
  }

  static rightward(size: number): Vector {
    return new Vector(0, size);
  }

  add(other: Vector): Vector {
    return new Vector(this.rows + other.rows, this.columns + other.columns);
  }

  subtract(other: Vector): Vector {
    return new Vector(this.rows - other.rows, this.columns - other.columns);
  }

  scale(scalar: number): Vector {
    return new Vector(this.rows * scalar, this.columns * scalar);
  }

  reverse(): Vector {
    return new Vector(-this.rows, -this.columns);
  }

  clockwise(): Vector {
    return new Vector(this.columns, -this.rows);
  }

  counterclockwise(): Vector {
    return new Vector(-this.columns, this.rows);
  }

  rotate(rotation: Rotation): Vector {
    switch (rotation) {
      case Rotation.None:
        return this;
      case Rotation.Clockwise:
        return this.clockwise();
      case Rotation.Flip:
        return this.reverse();
      case Rotation.Counterclockwise:
        return this.counterclockwise();
    }
  }

  equals(other: Vector): boolean {
    return this.rows === other.rows && this.columns === other.columns;
  }

  clone(): Vector {
    return new Vector(this.rows, this.columns);
  }

  static fromString(input: string): Vector {
    const [row, column] = input.split(",").map(Number);
    return new Vector(row, column);
  }

  toString(): string {
    return `${this.rows},${this.columns}`;
  }
}

export const orthogonalNeighbors: () => ReadonlyArray<Vector> = once(() => [
  Vector.upward(1),
  Vector.rightward(1),
  Vector.downward(1),
  Vector.leftward(1),
]);

export const diagonalNeighbors: () => ReadonlyArray<Vector> = once(() => [
  Vector.upward(1).add(Vector.rightward(1)),
  Vector.upward(1).add(Vector.leftward(1)),
  Vector.downward(1).add(Vector.rightward(1)),
  Vector.downward(1).add(Vector.leftward(1)),
]);

export const allNeighbors: () => ReadonlyArray<Vector> = once(() => [
  ...orthogonalNeighbors(),
  ...diagonalNeighbors(),
]);
