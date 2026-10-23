import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
    </div>
  );
}
