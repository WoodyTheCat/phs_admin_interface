import { ReactNode } from "react";
import { useAppContext } from "./Puck/context";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer } from "./Drawer";

const ComponentListItem = ({
  name,
  label,
  index,
}: {
  name: string;
  label?: string;
  index: number;
}) => {
  const { overrides, getPermissions } = useAppContext();

  const canInsert = getPermissions({
    type: name,
  }).insert;

  return (
    <Drawer.Item
      label={label}
      name={name}
      index={index}
      isDragDisabled={!canInsert}
    >
      {overrides.componentItem}
    </Drawer.Item>
  );
};

const ComponentList = ({
  children,
  title,
  id,
}: {
  id: string;
  children?: ReactNode;
  title?: string;
}) => {
  const { config, state, setUi } = useAppContext();

  const { expanded = true } = state.ui.componentList[id] || {};

  return (
    <div className="max-w-full mt-2">
      {title && (
        <button
          type="button"
          className="cursor-pointer flex text-xs list-none mb-2 p-2 uppercase rounded w-full transition-colors focus-visible:ring-accent focus-visible:ring-offset-2 hover:transition-none hover:text-primary hover:bg-accent active:bg-accent"
          onClick={() =>
            setUi({
              componentList: {
                ...state.ui.componentList,
                [id]: {
                  ...state.ui.componentList[id],
                  expanded: !expanded,
                },
              },
            })
          }
          title={
            expanded
              ? `Collapse${title ? ` ${title}` : ""}`
              : `Expand${title ? ` ${title}` : ""}`
          }
        >
          <div>{title}</div>
          <div className="ml-auto">
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
        </button>
      )}
      <div className={cn("hidden", expanded && "block")}>
        <Drawer droppableId={title}>
          {children ||
            Object.keys(config.components).map((componentKey, i) => {
              return (
                <ComponentListItem
                  key={componentKey}
                  label={
                    config.components[componentKey]["label"] ?? componentKey
                  }
                  name={componentKey}
                  index={i}
                />
              );
            })}
        </Drawer>
      </div>
    </div>
  );
};

ComponentList.Item = ComponentListItem;

export { ComponentList };
