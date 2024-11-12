import { getBox } from "css-box-model";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppContext } from "../context";
import { ViewportControls } from "../../ViewportControls";
import { Preview } from "./preview";
import { getZoomConfig } from "../../../lib/get-zoom-config";
import { AppState } from "../../../types";
import { Loader } from "../../Loader";
import { cn } from "@/lib/utils";
import { DefaultOverride } from "../../default-override";

const ZOOM_ON_CHANGE = true;

export const Canvas = () => {
  const { status, iframe } = useAppContext();
  const { dispatch, state, overrides, setUi, zoomConfig, setZoomConfig } =
    useAppContext();
  const { ui } = state;
  const frameRef = useRef<HTMLDivElement>(null);

  const [showTransition, setShowTransition] = useState(false);

  const CustomPreview = useMemo(
    () => overrides.preview || DefaultOverride,
    [overrides],
  );

  const getFrameDimensions = useCallback(() => {
    if (frameRef.current) {
      const frame = frameRef.current;

      const box = getBox(frame);

      return { width: box.contentBox.width, height: box.contentBox.height };
    }

    return { width: 0, height: 0 };
  }, [frameRef]);

  const resetAutoZoom = useCallback(
    (ui: AppState["ui"] = state.ui) => {
      if (frameRef.current) {
        setZoomConfig(
          getZoomConfig(
            ui.viewports.current,
            frameRef.current,
            zoomConfig.zoom,
          ),
        );
      }
    },
    [frameRef, zoomConfig, state.ui],
  );

  // Auto zoom
  useEffect(() => {
    setShowTransition(false);
    resetAutoZoom();
  }, [frameRef, ui.leftSideBarVisible, ui.rightSideBarVisible]);

  // Constrain height
  useEffect(() => {
    const { height: frameHeight } = getFrameDimensions();

    if (ui.viewports.current.height === "auto") {
      setZoomConfig({
        ...zoomConfig,
        rootHeight: frameHeight / zoomConfig.zoom,
      });
    }
  }, [zoomConfig.zoom]);

  // Zoom whenever state changes, even if external driver
  useEffect(() => {
    if (ZOOM_ON_CHANGE) {
      setShowTransition(true);
      resetAutoZoom(ui);
    }
  }, [ui.viewports.current.width]);

  // Resize based on window size
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      setShowTransition(false);
      resetAutoZoom();
    });

    if (document.body) {
      observer.observe(document.body);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShowLoader(true);
    }, 500);
  }, []);

  const ready = status === "READY" || !iframe.enabled || !iframe.waitForStyles;

  return (
    <div
      className="bg-[var(--puck-color-grey-11)] flex flex-col [grid-area:editor] p-2 overflow-auto xl:p-3 xl:pt-2"
      onClick={() =>
        dispatch({
          type: "setUi",
          ui: { itemSelector: null },
          recordHistory: true,
        })
      }
    >
      {ui.viewports.controlsVisible && iframe.enabled && (
        <ViewportControls
          autoZoom={zoomConfig.autoZoom}
          zoom={zoomConfig.zoom}
          onViewportChange={(viewport) => {
            setShowTransition(true);

            const uiViewport = {
              ...viewport,
              height: viewport.height || "auto",
              zoom: zoomConfig.zoom,
            };

            const newUi = {
              ...ui,
              viewports: { ...ui.viewports, current: uiViewport },
            };

            setUi(newUi);

            if (ZOOM_ON_CHANGE) {
              resetAutoZoom(newUi);
            }
          }}
          onZoom={(zoom) => {
            setShowTransition(true);

            setZoomConfig({ ...zoomConfig, zoom });
          }}
        />
      )}
      <div
        className="flex h-full justify-center overflow-hidden w-full relative box-border"
        ref={frameRef}
      >
        <div
          className={cn(
            "bg-white border box-border min-w-[321px] pointer-events-none origin-top top-0 bottom-0 opacity-0 absolute xl:min-w-[unset] motion-reduce:[transition:none_!important]",
            ready && "opacity-100 [pointer-events:unset]",
          )}
          style={{
            width: iframe.enabled ? ui.viewports.current.width : "100%",
            height: zoomConfig.rootHeight,
            transform: iframe.enabled ? `scale(${zoomConfig.zoom})` : undefined,
            transition: showTransition
              ? "width 150ms ease-out, height 150ms ease-out, transform 150ms ease-out"
              : "",
            overflow: iframe.enabled ? undefined : "auto",
          }}
          suppressHydrationWarning // Suppress hydration warning as frame is not visible until after load
        >
          <CustomPreview>
            <Preview />
          </CustomPreview>
        </div>
        <div
          className={cn(
            "items-center flex h-full justify-center transition-opacity duration-[250ms] ease-out opacity-0",
            showLoader && "opacity-100",
            ready && showLoader && "opacity-0 h-0 transition-none",
          )}
        >
          <Loader size={24} />
        </div>
      </div>
    </div>
  );
};
