"use client";

import { useState } from "react";
import { CheckCircle2Icon, ClockIcon, ExternalLinkIcon, XCircleIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDictionary } from "@/i18n/dictionary-provider";

import { approveShopAction, rejectShopAction } from "../../shops-actions";
import type { AdminShop, ShopStatus } from "../../types/shop";

export function AdminShopsQueue({ initialShops }: { initialShops: AdminShop[] }) {
  const t = useDictionary();
  const [shops, setShops] = useState<AdminShop[]>(initialShops);
  const [activeTab, setActiveTab] = useState<"pending" | "active" | "all">("pending");

  // Approval modal state
  const [approvingShop, setApprovingShop] = useState<AdminShop | null>(null);
  const [approveNote, setApproveNote] = useState("");

  // Rejection modal state
  const [rejectingShop, setRejectingShop] = useState<AdminShop | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const filteredShops = shops.filter((shop) => {
    if (activeTab === "pending") return shop.status === "PENDING_REVIEW";
    if (activeTab === "active") return shop.status === "ACTIVE";
    return true;
  });

  async function handleApprove() {
    if (!approvingShop) return;
    setIsProcessing(true);
    setGlobalError(null);
    try {
      const updated = await approveShopAction(approvingShop.id, approveNote.trim() || undefined);
      setShops((prev) => prev.map((s) => (s.id === approvingShop.id ? { ...s, ...updated } : s)));
      setApprovingShop(null);
      setApproveNote("");
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : t.adminShops.errorAction);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReject() {
    if (!rejectingShop) return;
    if (!rejectNote.trim()) {
      setRejectError(t.adminShops.reviewNoteRejectPlaceholder);
      return;
    }
    setIsProcessing(true);
    setRejectError(null);
    setGlobalError(null);
    try {
      const updated = await rejectShopAction(rejectingShop.id, rejectNote.trim());
      setShops((prev) => prev.map((s) => (s.id === rejectingShop.id ? { ...s, ...updated } : s)));
      setRejectingShop(null);
      setRejectNote("");
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : t.adminShops.errorAction);
    } finally {
      setIsProcessing(false);
    }
  }

  const pendingCount = shops.filter((s) => s.status === "PENDING_REVIEW").length;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          {t.adminShops.kicker}
        </p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{t.adminShops.title}</h1>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="font-semibold">
              {pendingCount} Pending
            </Badge>
          )}
        </div>
      </div>

      {globalError && (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          {globalError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Button
          variant={activeTab === "pending" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("pending")}
          className="gap-1.5"
        >
          <ClockIcon className="size-4" />
          {t.adminShops.tabPending}
          {pendingCount > 0 && (
            <span className="ml-1 rounded-full bg-background/20 px-1.5 py-0.2 text-[10px] font-bold">
              {pendingCount}
            </span>
          )}
        </Button>
        <Button
          variant={activeTab === "active" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("active")}
        >
          {t.adminShops.tabActive}
        </Button>
        <Button
          variant={activeTab === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("all")}
        >
          {t.adminShops.tabAll}
        </Button>
      </div>

      {/* List */}
      {filteredShops.length === 0 ? (
        <Empty className="border border-dashed py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClockIcon />
            </EmptyMedia>
            <EmptyTitle>{t.adminShops.emptyPendingTitle}</EmptyTitle>
            <EmptyDescription>{t.adminShops.emptyPendingBody}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4">
          {filteredShops.map((shop) => (
            <Card key={shop.id} className="border shadow-xs">
              <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{shop.name}</CardTitle>
                    <ShopStatusBadge status={shop.status} />
                  </div>
                  <CardDescription className="text-xs font-mono mt-1">
                    /shops/{shop.slug}
                  </CardDescription>
                </div>
                {shop.status === "PENDING_REVIEW" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setApprovingShop(shop);
                        setApproveNote("");
                      }}
                      className="gap-1.5"
                    >
                      <CheckCircle2Icon className="size-4" />
                      {t.adminShops.approveAction}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRejectingShop(shop);
                        setRejectNote("");
                        setRejectError(null);
                      }}
                      className="gap-1.5 text-destructive hover:bg-destructive/10"
                    >
                      <XCircleIcon className="size-4" />
                      {t.adminShops.rejectAction}
                    </Button>
                  </div>
                )}
                {shop.status === "ACTIVE" && (
                  <Link
                    href={`/shops/${shop.slug}`}
                    target="_blank"
                    className={buttonVariants({ size: "sm", variant: "outline" })}
                  >
                    <ExternalLinkIcon className="size-3.5 mr-1.5" />
                    View Storefront
                  </Link>
                )}
              </CardHeader>
              <CardContent className="grid gap-2 text-sm pt-0 sm:grid-cols-2">
                <div>
                  <span className="text-xs text-muted-foreground mr-1.5">
                    {t.adminShops.ownerLabel}
                  </span>
                  <span className="font-medium">{shop.owner.name || shop.owner.email}</span>
                  <span className="text-xs text-muted-foreground ml-1">({shop.owner.email})</span>
                </div>
                {shop.contactPhone && (
                  <div>
                    <span className="text-xs text-muted-foreground mr-1.5">
                      {t.adminShops.phoneLabel}
                    </span>
                    <span className="font-medium">{shop.contactPhone}</span>
                  </div>
                )}
                {shop.descriptionEn && (
                  <div className="sm:col-span-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">EN: </span>
                    {shop.descriptionEn}
                  </div>
                )}
                {shop.descriptionMy && (
                  <div className="sm:col-span-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">MY: </span>
                    {shop.descriptionMy}
                  </div>
                )}
                {shop.reviewNote && (
                  <div className="sm:col-span-2 rounded bg-muted/50 p-2 text-xs">
                    <span className="font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5">
                      Previous Review Note:
                    </span>
                    {shop.reviewNote}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog
        open={Boolean(approvingShop)}
        onOpenChange={(open) => !open && setApprovingShop(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.adminShops.approveDialogTitle}</DialogTitle>
            <DialogDescription>{t.adminShops.approveDialogBody}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="approve-note">{t.adminShops.reviewNoteLabel}</Label>
            <Textarea
              id="approve-note"
              placeholder={t.adminShops.reviewNoteApprovePlaceholder}
              value={approveNote}
              onChange={(e) => setApproveNote(e.target.value)}
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovingShop(null)}
              disabled={isProcessing}
            >
              {t.adminShops.cancel}
            </Button>
            <Button onClick={handleApprove} disabled={isProcessing}>
              {isProcessing ? t.adminShops.processing : t.adminShops.confirmApprove}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={Boolean(rejectingShop)}
        onOpenChange={(open) => !open && setRejectingShop(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.adminShops.rejectDialogTitle}</DialogTitle>
            <DialogDescription>{t.adminShops.rejectDialogBody}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="reject-note">{t.adminShops.reviewNoteLabel} *</Label>
            <Textarea
              id="reject-note"
              placeholder={t.adminShops.reviewNoteRejectPlaceholder}
              value={rejectNote}
              onChange={(e) => {
                setRejectNote(e.target.value);
                if (rejectError) setRejectError(null);
              }}
              rows={3}
            />
            {rejectError && <p className="text-xs text-destructive">{rejectError}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectingShop(null)}
              disabled={isProcessing}
            >
              {t.adminShops.cancel}
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
              {isProcessing ? t.adminShops.processing : t.adminShops.confirmReject}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShopStatusBadge({ status }: { status: ShopStatus }) {
  const styles: Record<
    ShopStatus,
    { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
  > = {
    ACTIVE: { variant: "default", label: "Active" },
    PENDING_REVIEW: { variant: "secondary", label: "Pending Review" },
    DRAFT: { variant: "destructive", label: "Draft" },
    SUSPENDED: { variant: "destructive", label: "Suspended" },
    CLOSED: { variant: "outline", label: "Closed" },
  };

  const current = styles[status];
  return <Badge variant={current.variant}>{current.label}</Badge>;
}
