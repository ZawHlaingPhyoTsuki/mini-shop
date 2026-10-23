export type ShopStatus = "DRAFT" | "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "CLOSED";

export type Shop = {
  id: string;
  name: string;
  slug: string;
  descriptionEn: string | null;
  descriptionMy: string | null;
  logoObjectKey: string | null;
  bannerObjectKey: string | null;
  contactPhone: string | null;
  socialLinks: Record<string, string> | null;
  status: ShopStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminShop = Shop & {
  owner: {
    id: string;
    name: string | null;
    email: string;
  };
};
