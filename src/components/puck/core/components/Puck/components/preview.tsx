import { DropZone } from "../../DropZone";
import { rootDroppableId } from "../../../lib/root-droppable-id";
import { useCallback, useMemo } from "react";
import { useAppContext } from "../context";
import AutoFrame, { autoFrameContext } from "../../AutoFrame";
import { DefaultRootRenderProps } from "../../../types";

type PageProps = DefaultRootRenderProps;

export const Preview = ({ id = "puck-preview" }: { id?: string }) => {
  const { config, dispatch, state, setStatus, iframe, overrides } =
    useAppContext();

  const Page = useCallback<React.FC<PageProps>>(
    (pageProps) =>
      config.root?.render ? (
        config.root?.render({
          id: "puck-root",
          ...pageProps,
        })
      ) : (
        <>{pageProps.children}</>
      ),
    [config.root],
  );

  const Frame = useMemo(() => overrides.iframe, [overrides]);

  // DEPRECATED
  const rootProps = state.data.root.props || state.data.root;

  return (
    <div
      className="h-full"
      id={id}
      onClick={() => {
        dispatch({ type: "setUi", ui: { ...state.ui, itemSelector: null } });
      }}
    >
      {iframe.enabled ? (
        <AutoFrame
          id="preview-frame"
          className="border-none min-h-full w-full"
          data-rfd-iframe
          onStylesLoaded={() => {
            setStatus("READY");
          }}
        >
          <autoFrameContext.Consumer>
            {({ document }) => {
              const inner = (
                <Page
                  {...rootProps}
                  puck={{ renderDropZone: DropZone, isEditing: true }}
                  // editMode={true} // DEPRECATED
                >
                  <DropZone zone={rootDroppableId} />
                </Page>
              );

              if (Frame) {
                return <Frame document={document}>{inner}</Frame>;
              }

              return inner;
            }}
          </autoFrameContext.Consumer>
        </AutoFrame>
      ) : (
        <div id="preview-frame" className="border-none min-h-full w-full">
          <Page
            {...rootProps}
            puck={{ renderDropZone: DropZone, isEditing: true }}
            // editMode={true} // DEPRECATED
          >
            <DropZone zone={rootDroppableId} />
          </Page>
        </div>
      )}
    </div>
  );
};
