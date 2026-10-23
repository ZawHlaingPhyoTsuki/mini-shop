"use server";

import {
  createProductSchema,
  updateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from "./products-schema";
import { productsTransport } from "./products-transport";

export async function createProductAction(input: CreateProductInput) {
  const validated = createProductSchema.parse(input);
  return productsTransport.createProduct(validated);
}

export async function updateProductAction(id: string, input: UpdateProductInput) {
  const validated = updateProductSchema.parse(input);
  return productsTransport.updateProduct(id, validated);
}

export async function setProductStatusAction(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
) {
  return productsTransport.updateProduct(id, { status });
}
