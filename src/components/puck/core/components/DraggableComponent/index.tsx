import {
  CSSProperties,
  ReactNode,
  SyntheticEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Draggable } from "@measured/dnd";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Copy, Trash } from "lucide-react";
import { useModifierHeld } from "../../lib/use-modifier-held";
import { isIos } from "../../lib/is-ios";
import { useAppContext } from "../Puck/context";
import { DefaultDraggable } from "../draggable";
import { Loader } from "../Loader";
import { ActionBar } from "../action-bar";
import { cn } from "@/lib/utils";

const getClassName = getClassNameFactory("DraggableComponent", styles);

// Magic numbers are used to position actions overlay 8px from top of component, bottom of component (when sticky scrolling) and side of preview
const space = 8;
const actionsOverlayTop = space * 6.5;
const actionsTop = -(actionsOverlayTop - 8);
const actionsRight = space;

const DefaultActionBar = ({
  label,
  children,
}: {
  label: string | undefined;
  children: ReactNode;
}) => (
  <ActionBar label={label}>
    <ActionBar.Group>{children}</ActionBar.Group>
  </ActionBar>
);

export const DraggableComponent = ({
  children,
  id,
  index,
  isLoading = false,
  isSelected = false,
  onClick = () => null,
  onMount = () => null,
  onMouseDown = () => null,
  onMouseUp = () => null,
  onMouseOver = () => null,
  onMouseOut = () => null,
  onDelete = () => null,
  onDuplicate = () => null,
  debug,
  label,
  isLocked = false,
  isDragDisabled,
  forceHover = false,
  indicativeHover = false,
  style,
}: {
  children: ReactNode;
  id: string;
  index: number;
  isSelected?: boolean;
  onClick?: (e: SyntheticEvent) => void;
  onMount?: () => void;
  onMouseDown?: (e: SyntheticEvent) => void;
  onMouseUp?: (e: SyntheticEvent) => void;
  onMouseOver?: (e: SyntheticEvent) => void;
  onMouseOut?: (e: SyntheticEvent) => void;
  onDelete?: (e: SyntheticEvent) => void;
  onDuplicate?: (e: SyntheticEvent) => void;
  debug?: string;
  label?: string;
  isLocked: boolean;
  isLoading: boolean;
  isDragDisabled?: boolean;
  forceHover?: boolean;
  indicativeHover?: boolean;
  style?: CSSProperties;
}) => {
  const { zoomConfig, status, overrides, selectedItem, getPermissions } =
    useAppContext();
  const isModifierHeld = useModifierHeld("Alt");

  const El = status !== "LOADING" ? Draggable : DefaultDraggable;

  useEffect(onMount, []);

  const [disableSecondaryAnimation, setDisableSecondaryAnimation] =
    useState(false);

  useEffect(() => {
    // Disable animations on iOS to prevent GPU memory crashes
    if (isIos()) {
      setDisableSecondaryAnimation(true);
    }
  }, []);

  const CustomActionBar = useMemo(
    () => overrides.actionBar || DefaultActionBar,
    [overrides.actionBar],
  );

  const permissions = getPermissions({
    item: selectedItem,
  });

  return (
    <El
      key={id}
      draggableId={id}
      index={index}
      isDragDisabled={isDragDisabled}
      disableSecondaryAnimation={disableSecondaryAnimation}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={getClassName({
            isSelected,
            isModifierHeld,
            isDragging: snapshot.isDragging,
            isLocked,
            forceHover,
            indicativeHover,
          })}
          style={{
            ...style,
            ...provided.draggableProps.style,
            cursor: isModifierHeld || isDragDisabled ? "pointer" : "grab",
          }}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onClick={onClick}
        >
          {debug}
          {isLoading && (
            <div className={getClassName("loadingOverlay")}>
              <Loader />
            </div>
          )}
          {isSelected && (
            <div
              className={cn(isSelected && "block sticky z-[2]")}
              style={{
                top: actionsOverlayTop / zoomConfig.zoom,
              }}
            >
              <div
                className="absolute w-auto cursor-grab pointer-events-auto box-border origin-top-right"
                style={{
                  display: isSelected ? "flex" : "none",
                  transform: `scale(${1 / zoomConfig.zoom}`,
                  top: actionsTop / zoomConfig.zoom,
                  right: actionsRight / zoomConfig.zoom,
                }}
              >
                <CustomActionBar label={label}>
                  {permissions.duplicate && (
                    <ActionBar.Action onClick={onDuplicate} label="Duplicate">
                      <Copy size={16} />
                    </ActionBar.Action>
                  )}
                  {permissions.delete && (
                    <ActionBar.Action
                      onClick={onDelete}
                      label="Delete"
                      className="hover:text-primary"
                    >
                      <Trash size={16} />
                    </ActionBar.Action>
                  )}
                </CustomActionBar>
              </div>
            </div>
          )}

          <div
            // className={cn(
            //   "cursor-pointer h-full w-full top-0 outline-offset-[-2px] absolute pointer-events-none box-border z-[1]",
            //   snapshot.isDragging &&
            //     "[outline:2px_var(--puck-color-azure-09)_solid_!important]",
            //   !isLocked && "hover:[background:var(--overlay-background)]",

            //   forceHover && "[background:var(--overlay-background)]",

            //   !isSelected &&
            //     "hover:[outline:2px_var(--puck-color-azure-09)_solid_!important]",
            //   // indicativeHover && "pointer-events: none",

            //   isSelected &&
            //     "[outline:2px_var(--puck-color-azure-07)_solid_!important]",
            // )}
            className={getClassName("overlay")}
          />
          <div className={getClassName("contents")}>{children}</div>
        </div>
      )}
    </El>
  );
};
