import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
// import DevTools from "../devtools";

import { Button } from "@/components/ui/button";
import * as Lucide from "lucide-react";
import axios from "@/api/axios";
import "./__root.scss";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

function RootComponent() {
  const login = async () => {
    await axios.post("/auth/login", {
      username: "kryalls",
      password: "password",
    });
  };
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5 text-muted-foreground">
          <Link
            to="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-lg text-primary-foreground hover:scale-110 transition-all"
          >
            <img src="/icon.png" className="h-8 w-8 " />
            <span className="sr-only">Peebles High School</span>
          </Link>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                activeProps={{
                  className: "bg-accent text-accent-foreground",
                }}
                to="/"
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Lucide.House className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Home</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                activeProps={{
                  className: "bg-accent text-accent-foreground",
                }}
                to="/posts"
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Lucide.Rss className="h-5 w-5" />
                <span className="sr-only">Posts</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Posts</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                activeProps={{
                  className: "bg-accent text-accent-foreground",
                }}
                to="/dynamic-pages"
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Lucide.BookOpen className="h-5 w-5" />
                <span className="sr-only">Pages</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Pages</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                activeProps={{
                  className: "bg-accent text-accent-foreground",
                }}
                to="/users"
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Lucide.Users className="h-5 w-5" />
                <span className="sr-only">Users</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Users</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                activeProps={{
                  className: "bg-accent text-accent-foreground",
                }}
                to="/requests"
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Lucide.ChartLine className="h-5 w-5" />
                <span className="sr-only">Requests</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Requests</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                activeProps={{
                  className: "bg-accent text-accent-foreground",
                }}
                to="/host"
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Lucide.Server className="h-5 w-5" />
                <span className="sr-only">Host</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Host</TooltipContent>
          </Tooltip>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Button onClick={login} size="icon" variant="outline">
            Login
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                activeProps={{
                  className: "bg-accent text-accent-foreground",
                }}
                to="/settings"
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Lucide.Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </nav>
      </aside>
      <div className="flex flex-col sm:pl-14 grow">
        {/* Mobile Menu */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <Lucide.PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <SheetClose asChild>
                  <Link
                    to="/"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <Lucide.Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                    <span className="sr-only">Peebles High School</span>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <Lucide.House className="h-5 w-5" />
                    Home
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/posts"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <Lucide.Rss className="h-5 w-5" />
                    Posts
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/dynamic-pages"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <Lucide.BookOpen className="h-5 w-5" />
                    Pages
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/users"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <Lucide.Users className="h-5 w-5" />
                    Users
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/requests"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <Lucide.ChartLine className="h-5 w-5" />
                    Requests
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/host"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <Lucide.Server className="h-5 w-5" />
                    Host
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <Lucide.Settings className="h-5 w-5" />
                    Settings
                  </Link>
                </SheetClose>
                <SheetClose>
                  <Button onClick={login}>Login</Button>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </header>

        <Outlet />
        {/* <DevTools /> */}
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
