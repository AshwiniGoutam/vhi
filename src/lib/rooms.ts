/**
 * Whole-villa vs. individual-room booking (the Airbnb "linked listings" rule):
 *  • booking the entire villa blocks every room for those nights
 *  • booking a room blocks the entire villa, but the other rooms stay bookable
 * Inventory locks are taken per "unit": `room:<key>` for room-enabled properties, `entire` otherwise.
 */
import { slugify } from "./utils";

export interface RoomLike {
  key?: string;
  name: string;
  active?: boolean;
}
export interface PropertyRoomsLike {
  roomBooking?: { enabled?: boolean } | null;
  rooms?: RoomLike[] | null;
}

export const ENTIRE_UNIT = "entire";
export const roomKeyOf = (r: RoomLike) => (r.key && r.key.trim() ? slugify(r.key) : slugify(r.name));
export const roomUnit = (key: string) => `room:${key}`;

/** Rooms guests can book on their own (only when room booking is switched on). */
export function bookableRooms<T extends RoomLike>(p: { roomBooking?: { enabled?: boolean } | null; rooms?: T[] | null }): T[] {
  if (!p.roomBooking?.enabled) return [];
  return (p.rooms ?? []).filter((r) => r.active !== false && r.name);
}

/** Lock units for a selection. Empty / no roomKeys = the entire property. */
export function unitsFor(p: PropertyRoomsLike, roomKeys?: string[] | null): string[] {
  const rooms = bookableRooms(p);
  if (!rooms.length) return [ENTIRE_UNIT];
  if (roomKeys?.length) return roomKeys.map(roomUnit);
  return rooms.map((r) => roomUnit(roomKeyOf(r)));
}
