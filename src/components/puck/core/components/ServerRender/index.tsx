import { CSSProperties } from "react";
import { rootDroppableId } from "../../lib/root-droppable-id";
import { PuckConfig, Data } from "../../types";
import { setupZone } from "../../lib/setup-zone";

type DropZoneRenderProps = {
  zone: string;
  data: Data;
  config: PuckConfig;
  areaId?: string;
  style?: CSSProperties;
};

function DropZoneRender({
  zone,
  data,
  areaId = "root",
  config,
}: DropZoneRenderProps) {
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
            <Component.render
              key={item.props.id}
              {...item.props}
              puck={{
                renderDropZone: ({ zone }: { zone: string }) => (
                  <DropZoneRender
                    zone={zone}
                    data={data}
                    areaId={item.props.id}
                    config={config}
                  />
                ),
              }}
            />
          );
        }

        return null;
      })}
    </>
  );
}

export function Render<UserConfig extends PuckConfig = PuckConfig>({
  config,
  data,
}: {
  config: UserConfig;
  data: Data;
}) {
  if (config.root?.render) {
    // DEPRECATED
    const rootProps = data.root.props || data.root;

    const title = rootProps.title || "";

    return (
      <config.root.render
        {...rootProps}
        puck={{
          renderDropZone: ({ zone }: { zone: string }) => (
            <DropZoneRender zone={zone} data={data} config={config} />
          ),
          isEditing: false,
        }}
        title={title}
        editMode={false}
        id={"puck-root"}
      >
        <DropZoneRender config={config} data={data} zone={rootDroppableId} />
      </config.root.render>
    );
  }

  return <DropZoneRender config={config} data={data} zone={rootDroppableId} />;
}
