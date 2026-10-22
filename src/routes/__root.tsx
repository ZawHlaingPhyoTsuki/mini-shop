import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Toaster } from "@/components/ui/sonner";

import Header from "../components/header";
import appCss from "../index.css?url";

export interface RouterAppContext {}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Mini Shop",
      },
      {
        name: "description",
        content: "Discover products from local shops and order with cash on delivery.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function NotFoundComponent() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        The page you are looking for does not exist or has moved.
      </p>
      <Link className="mt-6 inline-block font-medium underline underline-offset-4" to="/">
        Back to Mini Shop
      </Link>
    </main>
  );
}

function ErrorComponent() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">Try reloading the page.</p>
      <Link className="mt-6 inline-block font-medium underline underline-offset-4" to="/">
        Back to Mini Shop
      </Link>
    </main>
  );
}

function RootDocument() {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="grid h-svh grid-rows-[auto_1fr]">
          <Header />
          <Outlet />
        </div>
        <Toaster richColors />
        <TanStackRouterDevtools position="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}
