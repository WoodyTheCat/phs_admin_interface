import { Droppable } from "../Droppable";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Draggable } from "../draggable";
import { DragIcon } from "../DragIcon";
import {
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useMemo,
} from "react";
import { cn } from "@/lib/utils";

const getClassName = getClassNameFactory("Drawer", styles);
const getClassNameItem = getClassNameFactory("DrawerItem", styles);

const drawerContext = createContext<{ droppableId: string }>({
  droppableId: "",
});

const DrawerDraggable = ({
  children,
  id,
  index,
  isDragDisabled,
}: {
  children: ReactNode;
  id: string;
  index: number;
  isDragDisabled?: boolean;
}) => {
  return (
    <Draggable
      key={id}
      id={id}
      index={index}
      isDragDisabled={isDragDisabled}
      showShadow
      disableAnimations
      className={() => getClassNameItem({ disabled: isDragDisabled })}
    >
      {() => children}
    </Draggable>
  );
};

const DrawerItem = ({
  name,
  children,
  id,
  label,
  index,
  isDragDisabled,
}: {
  name: string;
  children?: (props: { children: ReactNode; name: string }) => ReactElement;
  id?: string;
  label?: string;
  index: number;
  isDragDisabled?: boolean;
}) => {
  const ctx = useContext(drawerContext);

  const resolvedId = `${ctx.droppableId}::${id || name}`;

  const Children = useMemo(
    () =>
      children ||
      (({ children, name: _ }: { children: ReactNode; name: string }) =>
        children),
    [children],
  );

  return (
    <DrawerDraggable
      id={resolvedId}
      index={index}
      isDragDisabled={isDragDisabled}
    >
      <Children name={name}>
        {/* <div className={getClassNameItem("draggableWrapper")}> */}
        <div className="draggable p-3 flex border rounded text-xs justify-between items-center transition-colors bg-background focus-visible:outline-0">
          <div className="overflow-x-hidden text-ellipsis whitespace-nowrap">
            {label ?? name}
          </div>
          {/* <div className={getClassNameItem("icon")}> */}
          <DragIcon isDragDisabled={isDragDisabled} />
          {/* </div> */}
        </div>
        {/* </div> */}
      </Children>
    </DrawerDraggable>
  );
};

export const Drawer = ({
  children,
  droppableId: _droppableId = "default",
  direction = "vertical",
}: {
  children: ReactNode;
  droppableId?: string;
  direction?: "vertical" | "horizontal";
}) => {
  const droppableId = `component-list:${_droppableId}`;

  return (
    <drawerContext.Provider value={{ droppableId }}>
      <Droppable droppableId={droppableId} isDropDisabled direction={direction}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={cn(
              "space-y-2 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
              !snapshot.draggingFromThisWith &&
                "[&>.draggable]:focus-visible:rounded [&>.draggable]:focus-visible:ring-2 [&>.draggable]:hover:transition-none",
            )}
            // className={getClassName({
            //   isDraggingFrom: !!snapshot.draggingFromThisWith,
            // })}
          >
            {children}

            {/* Use different element so we don't clash with :last-of-type */}
            <span style={{ display: "none" }}>{provided.placeholder}</span>
          </div>
        )}
      </Droppable>
    </drawerContext.Provider>
  );
};

Drawer.Item = DrawerItem;
