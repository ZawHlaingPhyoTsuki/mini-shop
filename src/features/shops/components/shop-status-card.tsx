import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resubmitShop } from "@/features/shops/server";
import type { ShopStatus } from "@/features/shops/status";

const STATUS_COPY = {
  DRAFT: "Your shop is a draft. Fix any issues below, then resubmit for review.",
  PENDING_REVIEW: "Your shop is waiting for an admin to review it.",
  ACTIVE: "Your shop is active and visible to customers.",
  SUSPENDED: "Your shop is suspended. Contact support for details.",
  CLOSED: "Your shop is closed.",
} as const satisfies Record<ShopStatus, string>;

type ShopStatusCardProps = {
  shop: {
    name: string;
    status: ShopStatus;
    reviewNote: string | null;
  };
};

export default function ShopStatusCard({ shop }: ShopStatusCardProps) {
  const router = useRouter();
  const [isResubmitting, setIsResubmitting] = useState(false);

  async function handleResubmit() {
    setIsResubmitting(true);
    const result = await resubmitShop();
    setIsResubmitting(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Shop resubmitted for review");
    await router.invalidate();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{shop.name}</CardTitle>
        <CardDescription>{STATUS_COPY[shop.status]}</CardDescription>
      </CardHeader>
      {shop.status === "DRAFT" ? (
        <CardContent className="space-y-3">
          {shop.reviewNote ? (
            <p className="text-sm text-destructive">Review note: {shop.reviewNote}</p>
          ) : null}
          <Button onClick={handleResubmit} disabled={isResubmitting}>
            {isResubmitting ? "Submitting..." : "Resubmit for review"}
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
