"use server";

import { placeInputSchema, placeUpdateSchema, type PlaceInput } from "./places-schema";
import { placesTransport } from "./places-transport";

export async function createPlace(input: PlaceInput) {
  return placesTransport.createPlace(placeInputSchema.parse(input));
}

export async function updatePlace(id: string, input: Partial<PlaceInput>) {
  return placesTransport.updatePlace(id, placeUpdateSchema.parse(input));
}

export async function deletePlace(id: string) {
  return placesTransport.deletePlace(id);
}

export async function requestUpload(contentType: string) {
  return placesTransport.createUpload(contentType);
}

export async function removeUpload(url: string) {
  return placesTransport.deleteUpload(url);
}
