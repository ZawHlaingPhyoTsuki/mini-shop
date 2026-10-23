"use server";

import {
  categoryInputSchema,
  categoryUpdateSchema,
  type CategoryInput,
  type CategoryUpdate,
} from "./categories-schema";
import { categoriesTransport } from "./categories-transport";

export async function createCategory(input: CategoryInput) {
  return categoriesTransport.createCategory(categoryInputSchema.parse(input));
}

export async function updateCategory(id: string, input: CategoryUpdate) {
  return categoriesTransport.updateCategory(id, categoryUpdateSchema.parse(input));
}

export async function deleteCategory(id: string) {
  return categoriesTransport.deleteCategory(id);
}
