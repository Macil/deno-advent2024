import { Location } from "./location.ts";

export function* locationsInManhattanDistance(
  location: Location,
  distance: number,
): Generator<Location> {
  for (let dr = -distance; dr <= distance; dr++) {
    const dcAbs = distance - Math.abs(dr);
    for (let dc = -dcAbs; dc <= dcAbs; dc++) {
      yield new Location(location.row + dr, location.column + dc);
    }
  }
}
