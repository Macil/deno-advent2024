import { once } from "@alexreardon/limit-once";
import { Rotation, subtractRotations } from "./rotation.ts";

export type Direction = "up" | "down" | "left" | "right";

export const allDirections: () => ReadonlyArray<Direction> = once(() =>
  [
    "up",
    "down",
    "left",
    "right",
  ] as const
);

export function reverse(direction: Direction): Direction {
  switch (direction) {
    case "up":
      return "down";
    case "down":
      return "up";
    case "left":
      return "right";
    case "right":
      return "left";
  }
}

export function clockwise(direction: Direction): Direction {
  switch (direction) {
    case "up":
      return "right";
    case "right":
      return "down";
    case "down":
      return "left";
    case "left":
      return "up";
  }
}

export function counterClockwise(direction: Direction): Direction {
  switch (direction) {
    case "up":
      return "left";
    case "left":
      return "down";
    case "down":
      return "right";
    case "right":
      return "up";
  }
}

export function rotate(direction: Direction, rotation: Rotation): Direction {
  switch (rotation) {
    case Rotation.None:
      return direction;
    case Rotation.Clockwise:
      return clockwise(direction);
    case Rotation.Flip:
      return reverse(direction);
    case Rotation.CounterClockwise:
      return counterClockwise(direction);
  }
}

/** Internal function, gets a direction relative to up. */
function directionAsRotation(direction: Direction): Rotation {
  switch (direction) {
    case "up":
      return Rotation.None;
    case "right":
      return Rotation.Clockwise;
    case "down":
      return Rotation.Flip;
    case "left":
      return Rotation.CounterClockwise;
  }
}

export function rotationTo(from: Direction, to: Direction): Rotation {
  return subtractRotations(directionAsRotation(to), directionAsRotation(from));
}
