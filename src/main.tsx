import React from "react";
import "./index.scss";

import { createRoot } from "react-dom/client";
import { createRouter, Link, RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import store from "./store";
import { TooltipProvider } from "./components/ui/tooltip";

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  context: {
    store,
  },
  defaultNotFoundComponent: () => {
    return (
      <>
        Not Found
        <Link to="/">Go home!</Link>
      </>
    );
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  },
});

createRoot(document.getElementById("app")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>{" "}
  </React.StrictMode>,
);
