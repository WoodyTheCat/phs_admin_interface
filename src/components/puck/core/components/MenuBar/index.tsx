import { Dispatch, ReactElement, SetStateAction } from "react";
import * as Lucide from "lucide-react";

import { IconButton } from "../IconButton/IconButton";
import { useAppContext } from "../Puck/context";

import { PuckAction } from "../../reducer";
import type { AppState, Data } from "../../types";

import { cn } from "@/lib/utils";

export function MenuBar<UserData extends Data>({
  appState,
  dispatch,
  menuOpen = false,
  onPublish,
  renderHeaderActions,
  setMenuOpen,
}: {
  appState: AppState<UserData>;
  dispatch: (action: PuckAction) => void;
  onPublish?: (data: UserData) => void;
  menuOpen: boolean;
  renderHeaderActions?: (props: {
    state: AppState<UserData>;
    dispatch: (action: PuckAction) => void;
  }) => ReactElement;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    history: { back, forward, historyStore },
  } = useAppContext();

  const { hasFuture = false, hasPast = false } = historyStore || {};

  return (
    <div
      className={cn(
        "border-b hidden px-4 z-[2] md:border-none md:block md:overflow-y-visible",
        menuOpen && "block",
      )}
      onClick={(event) => {
        const element = event.target as HTMLElement;

        if (window.matchMedia("(min-width: 638px)").matches) {
          return;
        }
        if (
          element.tagName === "A" &&
          element.getAttribute("href")?.startsWith("#")
        ) {
          setMenuOpen(false);
        }
      }}
    >
      <div className="items-center flex flex-wrap gap-x-4 gap-y-2 justify-end md:flex-row md:flex-nowrap">
        <div className="flex">
          <IconButton title="undo" disabled={!hasPast} onClick={back}>
            <Lucide.RotateCcw size={21} />
          </IconButton>
          <IconButton title="redo" disabled={!hasFuture} onClick={forward}>
            <Lucide.RotateCw size={21} />
          </IconButton>
        </div>
        <>
          {renderHeaderActions &&
            renderHeaderActions({
              state: appState,
              dispatch,
            })}
        </>
      </div>
    </div>
  );
}
