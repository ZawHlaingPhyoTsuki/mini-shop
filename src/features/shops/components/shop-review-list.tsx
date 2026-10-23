import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { reviewShop } from "@/features/shops/server";

export type ReviewableShop = {
  id: string;
  name: string;
  slug: string;
  descriptionEn: string | null;
  contactPhone: string | null;
  createdAt: Date;
  owner: {
    name: string;
    email: string;
  };
};

export default function ShopReviewList({ shops }: { shops: ReviewableShop[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function review(shopId: string, decision: "approve" | "reject") {
    const note = notes[shopId]?.trim() ?? "";

    if (decision === "reject" && !note) {
      toast.error("Add a reason before rejecting");
      return;
    }

    setPendingId(shopId);
    const result = await reviewShop({
      data: { shopId, decision, note: note || undefined },
    });
    setPendingId(null);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success(decision === "approve" ? "Shop approved" : "Shop rejected");
    await router.invalidate();
  }

  if (shops.length === 0) {
    return <p className="text-muted-foreground">No shops are waiting for review.</p>;
  }

  return (
    <>
      {shops.map((shop) => (
        <Card key={shop.id}>
          <CardHeader>
            <CardTitle>{shop.name}</CardTitle>
            <CardDescription>
              {shop.slug} · {shop.owner.name} ({shop.owner.email}) ·{" "}
              {new Date(shop.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {shop.descriptionEn ? <p className="text-sm">{shop.descriptionEn}</p> : null}
            {shop.contactPhone ? (
              <p className="text-sm text-muted-foreground">Phone: {shop.contactPhone}</p>
            ) : null}

            <Textarea
              aria-label={`Reason for rejecting ${shop.name}`}
              placeholder="Reason (required to reject)"
              value={notes[shop.id] ?? ""}
              onChange={(event) =>
                setNotes((current) => ({ ...current, [shop.id]: event.target.value }))
              }
            />

            <div className="flex gap-2">
              <Button disabled={pendingId === shop.id} onClick={() => review(shop.id, "approve")}>
                Approve
              </Button>
              <Button
                variant="destructive"
                disabled={pendingId === shop.id}
                onClick={() => review(shop.id, "reject")}
              >
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
