import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { DragStart, DragUpdate } from "@measured/dnd";

import type {
  UiState,
  IframeConfig,
  OnAction,
  Overrides,
  Permissions,
  Plugin,
  InitialHistory,
  UserGenerics,
  PuckConfig,
  Data,
} from "../../types";

import { usePlaceholderStyle } from "../../lib/use-placeholder-style";

import { SidebarSection } from "../SidebarSection";
import * as Lucide from "lucide-react";
import { Heading } from "../Heading";
import { Button } from "@/components/ui/button";
import { DropZoneProvider } from "../DropZone";
import { ItemSelector, getItem } from "../../lib/get-item";
import { StateReducer, createReducer } from "../../reducer";
import { flushZones } from "../../lib/flush-zones";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { appContext, AppProvider, defaultAppState } from "./context";
import { MenuBar } from "../MenuBar";
import styles from "./styles.module.css";
import { Fields } from "./components/fields";
import { Components } from "./components/components";
import { Preview } from "./components/preview";
import { Outline } from "./components/outline";
import { usePuckHistory } from "../../lib/use-puck-history";
import { useHistoryStore } from "../../lib/use-history-store";
import { Canvas } from "./components/canvas";
import { defaultViewports } from "../ViewportControls/default-viewports";
import { Viewports } from "../../types";
import { DragDropContext } from "../drag-drop-context";
import { insertComponent } from "../../lib/insert-component";
import { useLoadedOverrides } from "../../lib/use-loaded-overrides";
import { cn } from "@/lib/utils";
import { DefaultOverride } from "../default-override";

const getLayoutClassName = getClassNameFactory("PuckLayout", styles);

export function Puck<
  UserConfig extends PuckConfig = PuckConfig,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>,
>({
  children,
  config,
  data: initialData,
  ui: initialUi,
  onChange,
  onPublish,
  onAction,
  permissions = {},
  plugins,
  overrides,
  headerTitle,
  headerPath,
  viewports = defaultViewports,
  iframe: _iframe,
  dnd,
  initialHistory: _initialHistory,
}: {
  children?: ReactNode;
  config: UserConfig;
  data: Partial<G["UserData"] | Data>;
  ui?: Partial<UiState>;
  onChange?: (data: G["UserData"]) => void;
  onPublish?: (data: G["UserData"]) => void;
  onAction?: OnAction<G["UserData"]>;
  permissions?: Partial<Permissions>;
  plugins?: Plugin[];
  overrides?: Partial<Overrides>;
  headerTitle?: string;
  headerPath?: string;
  viewports?: Viewports;
  iframe?: IframeConfig;
  dnd?: {
    disableAutoScroll?: boolean;
  };
  initialHistory?: InitialHistory;
}) {
  const iframe: IframeConfig = {
    enabled: true,
    waitForStyles: true,
    ..._iframe,
  };

  const [generatedAppState] = useState<G["UserAppState"]>(() => {
    const initial = { ...defaultAppState.ui, ...initialUi };

    let clientUiState: Partial<G["UserAppState"]["ui"]> = {};

    if (typeof window !== "undefined") {
      // Hide side bars on mobile
      if (window.matchMedia("(max-width: 638px)").matches) {
        clientUiState = {
          ...clientUiState,
          leftSideBarVisible: false,
          rightSideBarVisible: false,
        };
      }

      const viewportWidth = window.innerWidth;

      const viewportDifferences = Object.entries(viewports)
        .map(([key, value]) => ({
          key,
          diff: Math.abs(viewportWidth - value.width),
        }))
        .sort((a, b) => (a.diff > b.diff ? 1 : -1));

      const closestViewport = viewportDifferences[0].key as any;

      if (iframe.enabled) {
        clientUiState = {
          ...clientUiState,
          viewports: {
            ...initial.viewports,

            current: {
              ...initial.viewports.current,
              height:
                initialUi?.viewports?.current?.height ||
                viewports[closestViewport]?.height ||
                "auto",
              width:
                initialUi?.viewports?.current?.width ||
                viewports[closestViewport]?.width,
            },
          },
        };
      }
    }

    // DEPRECATED
    if (
      Object.keys(initialData?.root || {}).length > 0 &&
      !initialData?.root?.props
    ) {
      console.error(
        "Warning: Defining props on `root` is deprecated. Please use `root.props`, or republish this page to migrate automatically.",
      );
    }

    // Deprecated
    const rootProps = initialData?.root?.props || initialData?.root || {};

    const defaultedRootProps = {
      ...config.root?.defaultProps,
      ...rootProps,
    };

    return {
      ...defaultAppState,
      data: {
        ...initialData,
        root: { ...initialData?.root, props: defaultedRootProps },
        content: initialData.content || [],
      },
      ui: {
        ...initial,
        ...clientUiState,
        // Store categories under componentList on state to allow render functions and plugins to modify
        componentList: config.categories
          ? Object.entries(config.categories).reduce(
              (acc, [categoryName, category]) => {
                return {
                  ...acc,
                  [categoryName]: {
                    title: category.title,
                    components: category.components,
                    expanded: category.defaultExpanded,
                    visible: category.visible,
                  },
                };
              },
              {},
            )
          : {},
      },
    } as G["UserAppState"];
  });

  const { appendData = true } = _initialHistory || {};

  const histories = [
    ...(_initialHistory?.histories || []),
    ...(appendData ? [{ state: generatedAppState }] : []),
  ].map((history) => ({
    ...history,
    // Inject default data to enable partial history injections
    state: { ...generatedAppState, ...history.state },
  }));
  const initialHistoryIndex = _initialHistory?.index || histories.length - 1;
  const initialAppState = histories[initialHistoryIndex].state;

  const historyStore = useHistoryStore({
    histories,
    index: initialHistoryIndex,
  });

  const [reducer] = useState(() =>
    createReducer<UserConfig, G["UserData"]>({
      config,
      record: historyStore.record,
      onAction,
    }),
  );

  const [appState, dispatch] = useReducer<StateReducer<G["UserData"]>>(
    reducer,
    flushZones<G["UserData"]>(initialAppState) as G["UserAppState"],
  );

  const { data, ui } = appState;

  const history = usePuckHistory({ dispatch, initialAppState, historyStore });

  const [menuOpen, setMenuOpen] = useState(false);

  const { itemSelector, leftSideBarVisible, rightSideBarVisible } = ui;

  const setItemSelector = useCallback(
    (newItemSelector: ItemSelector | null) => {
      if (newItemSelector === itemSelector) return;

      dispatch({
        type: "setUi",
        ui: { itemSelector: newItemSelector },
        recordHistory: true,
      });
    },
    [itemSelector],
  );

  const selectedItem = itemSelector ? getItem(itemSelector, data) : null;

  useEffect(() => {
    if (onChange) onChange(data as G["UserData"]);
  }, [data]);

  const { onDragStartOrUpdate, placeholderStyle } = usePlaceholderStyle();

  const [draggedItem, setDraggedItem] = useState<
    DragStart & Partial<DragUpdate>
  >();

  // DEPRECATED
  const rootProps = data.root.props || data.root;

  const toggleSidebars = useCallback(
    (sidebar: "left" | "right") => {
      const widerViewport = window.matchMedia("(min-width: 638px)").matches;
      const sideBarVisible =
        sidebar === "left" ? leftSideBarVisible : rightSideBarVisible;
      const oppositeSideBar =
        sidebar === "left" ? "rightSideBarVisible" : "leftSideBarVisible";

      dispatch({
        type: "setUi",
        ui: {
          [`${sidebar}SideBarVisible`]: !sideBarVisible,
          ...(!widerViewport ? { [oppositeSideBar]: false } : {}),
        },
      });
    },
    [dispatch, leftSideBarVisible, rightSideBarVisible],
  );

  useEffect(() => {
    if (!window.matchMedia("(min-width: 638px)").matches) {
      dispatch({
        type: "setUi",
        ui: {
          leftSideBarVisible: false,
          rightSideBarVisible: false,
        },
      });
    }

    const handleResize = () => {
      if (!window.matchMedia("(min-width: 638px)").matches) {
        dispatch({
          type: "setUi",
          ui: (ui: UiState) => ({
            ...ui,
            ...(ui.rightSideBarVisible ? { leftSideBarVisible: false } : {}),
          }),
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Load all plugins into the overrides
  const loadedOverrides = useLoadedOverrides({
    overrides: overrides,
    plugins: plugins,
  });

  const CustomPuck = useMemo(
    () => loadedOverrides.puck || DefaultOverride,
    [loadedOverrides],
  );

  const CustomHeader = useMemo(
    () => loadedOverrides.header || DefaultOverride,
    [loadedOverrides],
  );
  const CustomHeaderActions = useMemo(
    () => loadedOverrides.headerActions || DefaultOverride,
    [loadedOverrides],
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedComponentConfig =
    selectedItem && config.components[selectedItem.type];
  const selectedComponentLabel = selectedItem
    ? (selectedComponentConfig?.["label"] ?? selectedItem.type.toString())
    : "";

  return (
    <>
      <AppProvider
        value={{
          state: appState,
          dispatch,
          config,
          plugins: plugins || [],
          overrides: loadedOverrides,
          history,
          viewports,
          iframe,
          globalPermissions: {
            delete: true,
            drag: true,
            duplicate: true,
            insert: true,
            edit: true,
            ...permissions,
          },
          getPermissions: () => ({}),
          refreshPermissions: () => null,
        }}
      >
        <appContext.Consumer>
          {({ resolveData }) => (
            <DragDropContext
              autoScrollerOptions={{ disabled: dnd?.disableAutoScroll }}
              onDragUpdate={(update) => {
                setDraggedItem({ ...draggedItem, ...update });
                onDragStartOrUpdate(update);
              }}
              onBeforeDragStart={(start) => {
                onDragStartOrUpdate(start);
                setItemSelector(null);
                dispatch({ type: "setUi", ui: { isDragging: true } });
              }}
              onDragEnd={(droppedItem) => {
                setDraggedItem(undefined);
                dispatch({ type: "setUi", ui: { isDragging: false } });

                // User cancel drag
                if (!droppedItem.destination) {
                  return;
                }

                // New component
                if (
                  droppedItem.source.droppableId.startsWith("component-list") &&
                  droppedItem.destination
                ) {
                  const [_, componentType] =
                    droppedItem.draggableId.split("::");

                  insertComponent(
                    componentType || droppedItem.draggableId,
                    droppedItem.destination.droppableId,
                    droppedItem.destination!.index,
                    { config, dispatch, resolveData, state: appState },
                  );

                  return;
                } else {
                  const { source, destination } = droppedItem;

                  if (source.droppableId === destination.droppableId) {
                    dispatch({
                      type: "reorder",
                      sourceIndex: source.index,
                      destinationIndex: destination.index,
                      destinationZone: destination.droppableId,
                    });
                  } else {
                    dispatch({
                      type: "move",
                      sourceZone: source.droppableId,
                      sourceIndex: source.index,
                      destinationIndex: destination.index,
                      destinationZone: destination.droppableId,
                    });
                  }

                  setItemSelector({
                    index: destination.index,
                    zone: destination.droppableId,
                  });
                }
              }}
            >
              <DropZoneProvider
                value={{
                  data,
                  itemSelector,
                  setItemSelector,
                  config,
                  dispatch,
                  draggedItem,
                  placeholderStyle,
                  mode: "edit",
                  areaId: "root",
                }}
              >
                <CustomPuck>
                  {children || (
                    <div
                      className={getLayoutClassName({
                        menuOpen,
                        mounted,
                      })}
                    >
                      <div
                        className={cn(
                          "grid relative z-0 [grid-template-areas:'header_header_header''left_editor_right'] h-[100dvh] [grid-template-columns:0_1fr_0] [grid-template-rows:min-content_auto]",
                          leftSideBarVisible &&
                            "[grid-template-columns:300px_1fr_0]",
                          rightSideBarVisible &&
                            "[grid-template-columns:0_1fr_300px]",
                          leftSideBarVisible &&
                            rightSideBarVisible &&
                            "[grid-template-columns:300px_1fr_300px]",
                        )}
                      >
                        <CustomHeader
                          actions={
                            <CustomHeaderActions>
                              <Button
                                onClick={() => {
                                  onPublish && onPublish(data as G["UserData"]);
                                }}
                              >
                                <Lucide.Globe size="14px" /> Publish
                              </Button>
                            </CustomHeaderActions>
                          }
                        >
                          <header className="border-b [grid-area:header]">
                            <div className="grid gap-2 [grid-template-areas:'left_middle_right'] [grid-template-columns:1fr_auto_1fr] p-2">
                              <div className="flex items-center gap-2 ml-2">
                                <Button
                                  size="icon"
                                  variant="ghost-icon"
                                  onClick={() => toggleSidebars("left")}
                                  title="Toggle left sidebar"
                                  className={
                                    leftSideBarVisible
                                      ? "bg-accent hover:bg-accent"
                                      : ""
                                  }
                                >
                                  <Lucide.PanelLeft size={18} />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost-icon"
                                  onClick={() => toggleSidebars("right")}
                                  title="Toggle right sidebar"
                                  className={
                                    rightSideBarVisible
                                      ? "bg-accent hover:bg-accent"
                                      : ""
                                  }
                                >
                                  <Lucide.PanelRight size={18} />
                                </Button>
                              </div>
                              <div className="self-center">
                                <Heading rank="2">
                                  {headerTitle || rootProps.title || "Page"}
                                  {headerPath && (
                                    <>
                                      {" "}
                                      <code>{headerPath}</code>
                                    </>
                                  )}
                                </Heading>
                              </div>
                              <div className="flex gap-4 justify-end">
                                <div className="ml-[-1em] md:hidden">
                                  <Button
                                    size="icon"
                                    variant="ghost-icon"
                                    onClick={() => {
                                      return setMenuOpen(!menuOpen);
                                    }}
                                    title="Toggle menu bar"
                                  >
                                    {menuOpen ? (
                                      <Lucide.ChevronUp size={18} />
                                    ) : (
                                      <Lucide.ChevronDown size={18} />
                                    )}
                                  </Button>
                                </div>
                                <MenuBar<G["UserData"]>
                                  appState={appState}
                                  dispatch={dispatch}
                                  onPublish={onPublish}
                                  menuOpen={menuOpen}
                                  renderHeaderActions={() => (
                                    <CustomHeaderActions>
                                      <Button
                                        onClick={() => {
                                          onPublish && onPublish(data);
                                        }}
                                      >
                                        <Lucide.Globe size="14px" /> Publish
                                      </Button>
                                    </CustomHeaderActions>
                                  )}
                                  setMenuOpen={setMenuOpen}
                                />
                              </div>
                            </div>
                          </header>
                        </CustomHeader>
                        <div className="border-r flex flex-col [grid-area:left] overflow-y-auto">
                          <SidebarSection title="Components" noBorderTop>
                            <Components />
                          </SidebarSection>
                          <SidebarSection title="Outline">
                            <Outline />
                          </SidebarSection>
                        </div>
                        <Canvas />
                        <div className="border-l flex flex-col [grid-area:right] overflow-y-auto">
                          <SidebarSection
                            noBorderTop
                            showBreadcrumbs
                            title={
                              selectedItem ? selectedComponentLabel : "Page"
                            }
                          >
                            <Fields />
                          </SidebarSection>
                        </div>
                      </div>
                    </div>
                  )}
                </CustomPuck>
              </DropZoneProvider>
            </DragDropContext>
          )}
        </appContext.Consumer>
      </AppProvider>
      <div id="puck-portal-root" className="relative z-[2]" />
    </>
  );
}

Puck.Components = Components;
Puck.Fields = Fields;
Puck.Outline = Outline;
Puck.Preview = Preview;
