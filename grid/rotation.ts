export enum Rotation {
  None = 0,
  Clockwise = 1,
  Flip = 2,
  Counterclockwise = 3,
}

export function rotationToString(
  rotation: Rotation,
): keyof typeof Rotation {
  switch (rotation) {
    case Rotation.None:
      return "None";
    case Rotation.Clockwise:
      return "Clockwise";
    case Rotation.Flip:
      return "Flip";
    case Rotation.Counterclockwise:
      return "Counterclockwise";
  }
}

export function reverseRotation(rotation: Rotation): Rotation {
  switch (rotation) {
    case Rotation.None:
      return Rotation.None;
    case Rotation.Clockwise:
      return Rotation.Counterclockwise;
    case Rotation.Flip:
      return Rotation.Flip;
    case Rotation.Counterclockwise:
      return Rotation.Clockwise;
  }
}

export function addRotations(a: Rotation, b: Rotation): Rotation {
  return (((a + b) % 4) + 4) % 4 as Rotation;
}

export function subtractRotations(a: Rotation, b: Rotation): Rotation {
  return (((a - b) % 4) + 4) % 4 as Rotation;
}

export function multiplyRotation(rotation: Rotation, factor: number): Rotation {
  return (((rotation * factor) % 4) + 4) % 4 as Rotation;
}
