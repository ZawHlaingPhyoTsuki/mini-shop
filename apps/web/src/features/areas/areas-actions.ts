"use server";

import { areaInputSchema, areaUpdateSchema, type AreaInput, type AreaUpdate } from "./areas-schema";
import { areasTransport } from "./areas-transport";

export async function createArea(input: AreaInput) {
  return areasTransport.createArea(areaInputSchema.parse(input));
}

export async function updateArea(id: string, input: AreaUpdate) {
  return areasTransport.updateArea(id, areaUpdateSchema.parse(input));
}

export async function deleteArea(id: string) {
  return areasTransport.deleteArea(id);
}
