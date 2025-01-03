import { Direction } from "./direction.ts";
import { Vector } from "./vector.ts";

/** A location on a grid */
export class Location {
  constructor(public row: number, public column: number) {}

  add(vector: Vector): Location {
    return new Location(this.row + vector.rows, this.column + vector.columns);
  }

  subtract(location: Location): Vector {
    return new Vector(this.row - location.row, this.column - location.column);
  }

  above(distance: number): Location {
    return new Location(this.row - distance, this.column);
  }

  below(distance: number): Location {
    return new Location(this.row + distance, this.column);
  }

  left(distance: number): Location {
    return new Location(this.row, this.column - distance);
  }

  right(distance: number): Location {
    return new Location(this.row, this.column + distance);
  }

  relative(direction: Direction, distance: number): Location {
    return this.add(Vector.inDirection(direction, distance));
  }

  modulo(other: Vector): Location {
    return new Location(
      ((this.row % other.rows) + other.rows) % other.rows,
      ((this.column % other.columns) + other.columns) % other.columns,
    );
  }

  equals(other: Location): boolean {
    return this.row === other.row && this.column === other.column;
  }

  static fromString(input: string): Location {
    const [row, column] = input.split(",").map(Number);
    return new Location(row, column);
  }

  toString(): string {
    return `${this.row},${this.column}`;
  }

  clone(): Location {
    return new Location(this.row, this.column);
  }
}
