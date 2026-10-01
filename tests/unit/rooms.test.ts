import { test } from "node:test";
import assert from "node:assert/strict";
import { bookableRooms, roomKeyOf, unitsFor } from "../../src/lib/rooms";

const villa = { roomBooking: { enabled: true }, rooms: [{ name: "Bedroom 1 · King", key: "bedroom-1" }, { name: "Bedroom 2" }, { name: "Store", active: false }] };

test("whole-property listings lock the 'entire' unit", () => {
  assert.deepEqual(unitsFor({}), ["entire"]);
  assert.deepEqual(unitsFor({ roomBooking: { enabled: false }, rooms: villa.rooms }), ["entire"]);
});

test("booking the entire villa locks every bookable room (blocks all rooms)", () => {
  assert.deepEqual(unitsFor(villa), ["room:bedroom-1", "room:bedroom-2"]);
});

test("booking a room locks only that room (other rooms stay bookable)", () => {
  assert.deepEqual(unitsFor(villa, ["bedroom-2"]), ["room:bedroom-2"]);
});

test("room keys default to a slug of the name; inactive rooms are not bookable", () => {
  assert.equal(roomKeyOf({ name: "Bedroom 2" }), "bedroom-2");
  assert.equal(bookableRooms(villa).length, 2);
});
