"use server";

import {
  createShopSchema,
  updateShopSchema,
  type CreateShopInput,
  type UpdateShopInput,
} from "./shops-schema";
import { shopsTransport } from "./shops-transport";

export async function createShopAction(input: CreateShopInput) {
  const validated = createShopSchema.parse(input);
  const socialLinks: Record<string, string> = {};
  if (validated.facebookUrl) socialLinks.facebook = validated.facebookUrl;
  if (validated.tiktokUrl) socialLinks.tiktok = validated.tiktokUrl;

  return shopsTransport.createShop({
    name: validated.name,
    slug: validated.slug,
    descriptionEn: validated.descriptionEn,
    descriptionMy: validated.descriptionMy,
    contactPhone: validated.contactPhone,
    socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
  });
}

export async function updateMyShopAction(input: UpdateShopInput) {
  const validated = updateShopSchema.parse(input);
  const socialLinks: Record<string, string> = {};
  if (validated.facebookUrl) socialLinks.facebook = validated.facebookUrl;
  if (validated.tiktokUrl) socialLinks.tiktok = validated.tiktokUrl;

  return shopsTransport.updateMyShop({
    name: validated.name,
    descriptionEn: validated.descriptionEn,
    descriptionMy: validated.descriptionMy,
    contactPhone: validated.contactPhone,
    socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
  });
}

export async function resubmitMyShopAction() {
  return shopsTransport.resubmitMyShop();
}

export async function approveShopAction(id: string, reviewNote?: string) {
  return shopsTransport.approveShop(id, reviewNote);
}

export async function rejectShopAction(id: string, reviewNote: string) {
  if (!reviewNote.trim()) {
    throw new Error("A review note is required when rejecting a shop");
  }
  return shopsTransport.rejectShop(id, reviewNote);
}
