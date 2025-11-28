import { assertEquals } from "@std/assert";
import { locationsInManhattanDistance } from "./locationsInManhattanDistance.ts";
import { Location } from "./location.ts";

Deno.test("works", () => {
  assertEquals(
    Array.from(locationsInManhattanDistance(new Location(10, 100), 2)),
    [
      new Location(8, 100),
      new Location(9, 99),
      new Location(9, 100),
      new Location(9, 101),
      new Location(10, 98),
      new Location(10, 99),
      new Location(10, 100),
      new Location(10, 101),
      new Location(10, 102),
      new Location(11, 99),
      new Location(11, 100),
      new Location(11, 101),
      new Location(12, 100),
    ],
  );
});
