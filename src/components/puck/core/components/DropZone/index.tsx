import { useContext, useEffect } from "react";
import { DraggableComponent } from "../DraggableComponent";
import { Droppable } from "../Droppable";
import { getItem } from "../../lib/get-item";
import { setupZone } from "../../lib/setup-zone";
import { rootDroppableId } from "../../lib/root-droppable-id";
import { getClassNameFactory } from "../../lib";
import styles from "./styles.module.css";
import { DropZoneProvider, dropZoneContext } from "./context";
import { getZoneId } from "../../lib/get-zone-id";
import { useAppContext } from "../Puck/context";
import { DropZoneProps } from "./types";
import { ComponentConfig, PuckContext } from "../../types";
import { cn } from "@/lib/utils";

const getClassName = getClassNameFactory("DropZone", styles);

export { DropZoneProvider, dropZoneContext } from "./context";

function DropZoneEdit({ zone, allow, disallow, style }: DropZoneProps) {
  const appContext = useAppContext();
  const ctx = useContext(dropZoneContext);

  const {
    // These all need setting via context
    data,
    dispatch = () => null,
    config,
    itemSelector,
    setItemSelector = () => null,
    areaId,
    draggedItem,
    placeholderStyle,
    registerZoneArea,
    areasWithZones,
    hoveringComponent,
    zoneWillDrag,
    setZoneWillDrag = () => null,
  } = ctx! || {};

  let content = data.content || [];
  let zoneCompound = rootDroppableId;

  useEffect(() => {
    if (areaId && registerZoneArea) {
      registerZoneArea(areaId);
    }
  }, [areaId]);

  // Register and unregister zone on mount
  useEffect(() => {
    if (ctx?.registerZone) {
      ctx?.registerZone(zoneCompound);
    }

    return () => {
      if (ctx?.unregisterZone) {
        ctx?.unregisterZone(zoneCompound);
      }
    };
  }, []);

  if (areaId) {
    if (zone !== rootDroppableId) {
      zoneCompound = `${areaId}:${zone}`;
      content = setupZone(data, zoneCompound).zones[zoneCompound];
    }
  }

  const isRootZone =
    zoneCompound === rootDroppableId ||
    zone === rootDroppableId ||
    areaId === "root";

  const draggedSourceId = draggedItem && draggedItem.source.droppableId;
  const draggedDestinationId =
    draggedItem && draggedItem.destination?.droppableId;
  const [zoneArea] = getZoneId(zoneCompound);

  // we use the index rather than spread to prevent down-level iteration warnings: https://stackoverflow.com/questions/53441292/why-downleveliteration-is-not-on-by-default
  const [draggedSourceArea] = getZoneId(draggedSourceId);

  const userWillDrag = zoneWillDrag === zone;

  const userIsDragging = !!draggedItem;
  const draggingOverArea = userIsDragging && zoneArea === draggedSourceArea;
  const draggingNewComponent = draggedSourceId?.startsWith("component-list");

  if (
    !ctx?.config ||
    !ctx.setHoveringArea ||
    !ctx.setHoveringZone ||
    !ctx.setHoveringComponent ||
    !ctx.setItemSelector ||
    !ctx.registerPath ||
    !ctx.dispatch
  ) {
    return <div>DropZone requires context to work.</div>;
  }

  const {
    hoveringArea = "root",
    setHoveringArea,
    hoveringZone,
    setHoveringZone,
    setHoveringComponent,
  } = ctx;

  const hoveringOverArea = hoveringArea
    ? hoveringArea === zoneArea
    : isRootZone;
  const hoveringOverZone = hoveringZone === zoneCompound;

  let isEnabled = userWillDrag;

  /**
   * We enable zones when:
   *
   * 1. This is a new component and the user is dragging over the area. This
   *    check prevents flickering if you move cursor outside of zone
   *    but within the area
   * 2. This is an existing component and the user a) is dragging over the
   *    area (which prevents drags between zone areas, breaking the rules
   *    of @hello-pangea/dnd) and b) has the cursor hovering directly over
   *    the specific zone (which increases robustness when using flex
   *    layouts)
   */

  if (userIsDragging) {
    if (draggingNewComponent) {
      if (appContext.safariFallbackMode) {
        isEnabled = true;
      } else {
        isEnabled = hoveringOverArea;
      }
    } else {
      isEnabled = draggingOverArea && hoveringOverZone;
    }
  }

  // TODO WARN: Put this back
  // if (isEnabled && userIsDragging && (allow || disallow)) {
  //   const [_, componentType] = draggedItem.draggableId.split("::");

  //   if (disallow) {
  //     const defaultedAllow = allow || [];

  //     // remove any explicitly allowed items from disallow
  //     const filteredDisallow = (disallow || []).filter(
  //       (item) => defaultedAllow.indexOf(item) === -1,
  //     );

  //     if (filteredDisallow.indexOf(componentType) !== -1) {
  //       isEnabled = false;
  //     }
  //   } else if (allow) {
  //     if (allow.indexOf(componentType) === -1) {
  //       isEnabled = false;
  //     }
  //   }
  // }

  const selectedItem = itemSelector ? getItem(itemSelector, data) : null;
  const isAreaSelected = selectedItem && zoneArea === selectedItem.props.id;

  return (
    <div
      className={getClassName({
        isRootZone,
        userIsDragging,
        draggingOverArea,
        hoveringOverArea,
        hoveringOverZone,
        draggingNewComponent,
        isDestination: draggedDestinationId === zoneCompound,
        isDisabled: !isEnabled,
        isAreaSelected,
        hasChildren: content.length > 0,
      })}
      // className={cn(
      //   "mx-auto relative min-h-full ring-offset-[-2px] w-full",

      //   (isAreaSelected ||
      //     (draggingOverArea && !hoveringOverArea) ||
      //     (hoveringOverArea &&
      //       isEnabled &&
      //       !isRootZone &&
      //       content.length === 0)) &&
      //     "bg-[color-mix(in_srgb,_var(--puck-color-azure-09)_30%,transparent)] outline: 2px dashed var(--puck-color-azure-08)",

      //   content.length === 0 &&
      //     "bg-[color-mix(in_srgb,_var(--puck-color-azure-09)_30%,transparent)] outline-dashed ring-accent ring-2",
      //   draggedDestinationId === zoneCompound &&
      //     "outline: 2px dashed var(--puck-color-azure-04) !important",
      //   draggedDestinationId === zoneCompound &&
      //     !isRootZone &&
      //     "background: color-mix(in_srgb,var(--puck-color-azure-09)_30%,_transparent)_!important",
      // )}
      onMouseUp={() => {
        setZoneWillDrag("");
      }}
    >
      <Droppable
        droppableId={zoneCompound}
        direction={"vertical"}
        // isDropDisabled={!isEnabled}
      >
        {(provided, snapshot) => {
          return (
            <div
              {...(provided || { droppableProps: {} }).droppableProps}
              className={cn(
                "min-h-[128px] h-full",
                userIsDragging && "pointer-events-[all]",
                userIsDragging &&
                  !draggingOverArea &&
                  !draggingNewComponent &&
                  "pointer-events-none",
              )}
              ref={provided?.innerRef}
              style={style}
              id={zoneCompound}
              onMouseOver={(e) => {
                e.stopPropagation();
                setHoveringArea(zoneArea);
                setHoveringZone(zoneCompound);
              }}
            >
              {content.map((item, i) => {
                const componentId = item.props.id;

                const puckProps: PuckContext = {
                  renderDropZone: DropZone,
                  isEditing: true,
                };

                const defaultedProps = {
                  ...config.components[item.type]?.defaultProps,
                  ...item.props,
                  puck: puckProps,
                };

                const isSelected =
                  selectedItem?.props.id === componentId || false;

                const isDragging =
                  (draggedItem?.draggableId || "draggable-").split(
                    "draggable-",
                  )[1] === componentId;

                const containsZone = areasWithZones
                  ? areasWithZones[componentId]
                  : false;

                const Render = config.components[item.type]
                  ? config.components[item.type].render
                  : () => (
                      <div style={{ padding: 48, textAlign: "center" }}>
                        No configuration for {item.type}
                      </div>
                    );

                const componentConfig: ComponentConfig | undefined =
                  config.components[item.type];

                const label =
                  componentConfig?.["label"] ?? item.type.toString();

                const canDrag = appContext.getPermissions({
                  item: getItem(
                    { index: i, zone: zoneCompound },
                    appContext.state.data,
                  ),
                }).drag;

                return (
                  <div
                    key={item.props.id}
                    className="relative"
                    style={{ zIndex: isDragging ? 1 : undefined }}
                  >
                    <DropZoneProvider
                      value={{
                        ...ctx,
                        areaId: componentId,
                      }}
                    >
                      <DraggableComponent
                        label={label}
                        id={`draggable-${componentId}`}
                        index={i}
                        isSelected={isSelected}
                        isLocked={userIsDragging}
                        forceHover={
                          hoveringComponent === componentId && !userIsDragging
                        }
                        isDragDisabled={!canDrag}
                        indicativeHover={
                          userIsDragging &&
                          containsZone &&
                          hoveringArea === componentId
                        }
                        isLoading={
                          appContext.componentState[componentId]?.loadingCount >
                          0
                        }
                        onMount={() => {
                          ctx.registerPath!({
                            index: i,
                            zone: zoneCompound,
                          });
                        }}
                        onClick={(e) => {
                          setItemSelector({
                            index: i,
                            zone: zoneCompound,
                          });
                          e.stopPropagation();
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setZoneWillDrag(zone);
                        }}
                        onMouseOver={(e) => {
                          e.stopPropagation();

                          if (containsZone) {
                            setHoveringArea(componentId);
                          } else {
                            setHoveringArea(zoneArea);
                          }

                          setHoveringComponent(componentId);

                          setHoveringZone(zoneCompound);
                        }}
                        onMouseOut={() => {
                          setHoveringArea(null);
                          setHoveringZone(null);
                          setHoveringComponent(null);
                        }}
                        onDelete={(e) => {
                          dispatch({
                            type: "remove",
                            index: i,
                            zone: zoneCompound,
                          });

                          setItemSelector(null);

                          e.stopPropagation();
                        }}
                        onDuplicate={(e) => {
                          dispatch({
                            type: "duplicate",
                            sourceIndex: i,
                            sourceZone: zoneCompound,
                          });

                          setItemSelector({
                            zone: zoneCompound,
                            index: i + 1,
                          });

                          e.stopPropagation();
                        }}
                        style={{
                          pointerEvents:
                            userIsDragging && draggingNewComponent
                              ? "all"
                              : undefined,
                        }}
                      >
                        <div>
                          {/* className={getClassName("renderWrapper")} */}
                          <Render {...defaultedProps} />
                        </div>
                      </DraggableComponent>
                    </DropZoneProvider>
                    {userIsDragging && (
                      <div
                        className="absolute b-[-3em] h-6 w-full z-[1]"
                        onMouseOver={(e) => {
                          e.stopPropagation();
                          setHoveringArea(zoneArea);
                          setHoveringZone(zoneCompound);
                        }}
                      />
                    )}
                  </div>
                );
              })}
              {provided?.placeholder}
              {snapshot?.isDraggingOver && (
                <div
                  data-puck-placeholder
                  style={{
                    ...placeholderStyle,
                    background: "var(--puck-color-azure-06)",
                    opacity: 0.3,
                    zIndex: 0,
                  }}
                />
              )}
            </div>
          );
        }}
      </Droppable>
    </div>
  );
}

function DropZoneRender({ zone }: DropZoneProps) {
  const ctx = useContext(dropZoneContext);

  const { data, areaId = "root", config } = ctx || {};

  let zoneCompound = rootDroppableId;
  let content = data?.content || [];

  if (!data || !config) {
    return null;
  }

  if (areaId && zone && zone !== rootDroppableId) {
    zoneCompound = `${areaId}:${zone}`;
    content = setupZone(data, zoneCompound).zones[zoneCompound];
  }

  return (
    <>
      {content.map((item) => {
        const Component = config.components[item.type];

        if (Component) {
          return (
            <DropZoneProvider
              key={item.props.id}
              value={{ data, config, areaId: item.props.id }}
            >
              <Component.render
                {...item.props}
                puck={{ renderDropZone: DropZone }}
              />
            </DropZoneProvider>
          );
        }

        return null;
      })}
    </>
  );
}

export function DropZone(props: DropZoneProps) {
  const ctx = useContext(dropZoneContext);

  if (ctx?.mode === "edit") {
    return <DropZoneEdit {...props} />;
  }

  return <DropZoneRender {...props} />;
}
