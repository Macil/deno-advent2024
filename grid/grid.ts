import { Location } from "./location.ts";
import { Vector } from "./vector.ts";

export interface Grid<T> {
  get(location: Location): T | undefined;
  valuesWithLocations(): IteratorObject<{ location: Location; value: T }>;
}

export interface MutableGrid<T> extends Grid<T> {
  set(location: Location, value: T): void;
}

export abstract class FixedSizeGrid<T> implements Grid<T> {
  readonly dimensions: Vector;

  constructor(dimensions: Vector) {
    this.dimensions = Object.freeze(dimensions);
  }

  abstract get(location: Location): T | undefined;
  abstract valuesWithLocations(): IteratorObject<
    { location: Location; value: T }
  >;

  isInBounds(location: Location): boolean {
    if (location.row < 0 || location.row >= this.dimensions.rows) {
      return false;
    }
    if (location.column < 0 || location.column >= this.dimensions.columns) {
      return false;
    }
    return true;
  }

  boundsCheck(location: Location): void {
    if (!this.isInBounds(location)) {
      throw new Error("Location out of bounds");
    }
  }
}

export class CharacterGrid extends FixedSizeGrid<string> {
  readonly #lines: Array<string>;

  constructor(dimensions: Vector, lines: Array<string>) {
    super(dimensions);
    this.#lines = lines;
  }

  static fromString(input: string): CharacterGrid {
    const lines = input.trimEnd().split("\n");
    const dimensions = new Vector(lines.length, lines[0].length);
    const allRowsMatchColumnCount = lines.every((line) =>
      line.length === dimensions.columns
    );
    if (!allRowsMatchColumnCount) {
      throw new Error("All rows must have the same length");
    }
    return new CharacterGrid(dimensions, lines);
  }

  override get(location: Location): string | undefined {
    if (!this.isInBounds(location)) {
      return undefined;
    }
    return this.#lines[location.row][location.column];
  }

  override *valuesWithLocations() {
    for (let rowIndex = 0; rowIndex < this.#lines.length; rowIndex++) {
      const row = this.#lines[rowIndex];
      for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
        const value = row[columnIndex];
        yield {
          location: new Location(rowIndex, columnIndex),
          value,
        };
      }
    }
  }
}

export class ArrayGrid<T> extends FixedSizeGrid<T> implements MutableGrid<T> {
  readonly #values: Array<Array<T>>;

  constructor(dimensions: Vector, values: Array<Array<T>>) {
    super(dimensions);
    this.#values = values;
  }

  static createWithInitialValue<T>(
    dimensions: Vector,
    initialValue: T,
  ): ArrayGrid<T> {
    return new ArrayGrid(
      dimensions,
      Array.from(
        { length: dimensions.rows },
        () => Array.from({ length: dimensions.columns }, () => initialValue),
      ),
    );
  }

  override get(location: Location): T | undefined {
    if (!this.isInBounds(location)) {
      return undefined;
    }
    return this.#values[location.row][location.column];
  }

  set(location: Location, value: T): void {
    this.boundsCheck(location);
    this.#values[location.row][location.column] = value;
  }

  override *valuesWithLocations() {
    for (let rowIndex = 0; rowIndex < this.#values.length; rowIndex++) {
      const row = this.#values[rowIndex];
      for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
        const value = row[columnIndex];
        yield {
          location: new Location(rowIndex, columnIndex),
          value,
        };
      }
    }
  }
}
