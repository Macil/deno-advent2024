import { assertEquals } from "@std/assert";
import { rotationTo } from "./direction.ts";
import { Rotation } from "./rotation.ts";

Deno.test("rotationTo", () => {
  assertEquals(rotationTo("up", "right"), Rotation.Clockwise);
  assertEquals(rotationTo("right", "up"), Rotation.CounterClockwise);
});
