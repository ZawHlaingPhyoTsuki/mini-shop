import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        Mini Shop
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Discover local shops. Order with cash on delivery.
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Browse products from social-commerce merchants, open a shop, and manage orders in one place.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
          to="/login"
        >
          Get started
        </Link>
        <Link className="rounded-md border px-4 py-2 font-medium" to="/dashboard">
          Merchant dashboard
        </Link>
      </div>
    </main>
  );
}
