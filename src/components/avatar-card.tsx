import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MyAsset } from "@/functions/get-my-asset";

export default function AvatarCard({ asset }: { asset: MyAsset | null }) {
  const [url, setUrl] = useState<string | null>(asset?.url ?? null);
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File | undefined) {
    if (!file) {
      return;
    }

    setIsPending(true);
    try {
      const ticketResponse = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, size: file.size }),
      });
      const ticket = (await ticketResponse.json()) as {
        key: string;
        uploadUrl: string;
        error?: string;
      };

      if (!ticketResponse.ok) {
        toast.error(ticket.error ?? "Upload failed");
        return;
      }

      const uploadResponse = await fetch(ticket.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        toast.error("Upload failed");
        return;
      }

      const response = await fetch("/api/assets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: ticket.key, contentType: file.type, size: file.size }),
      });
      const data = (await response.json()) as {
        asset: MyAsset | null;
        error?: string;
      };

      if (!response.ok || !data.asset) {
        toast.error(data.error ?? "Upload failed");
        return;
      }

      setUrl(data.asset.url);
      toast.success("Avatar uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsPending(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile image</CardTitle>
        <CardDescription>
          Stored in Neon Object Storage, with the object key saved in Postgres.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        {url ? (
          <img src={url} alt="Your avatar" className="size-16 rounded-full border object-cover" />
        ) : (
          <div className="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-full text-xs">
            None
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(event) => upload(event.target.files?.[0])}
        />
        <Button variant="outline" disabled={isPending} onClick={() => inputRef.current?.click()}>
          {isPending ? "Uploading..." : "Upload image"}
        </Button>
      </CardContent>
    </Card>
  );
}
