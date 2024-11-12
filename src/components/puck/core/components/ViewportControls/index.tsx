import * as Lucide from "lucide-react";

import { useAppContext } from "../Puck/context";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Viewport } from "../../types";
import * as Select from "@/components/ui/select";

import { Button } from "@/components/ui/button";
const icons = {
  Smartphone: <Lucide.Smartphone size={16} />,
  Tablet: <Lucide.Tablet size={16} />,
  Monitor: <Lucide.Monitor size={16} />,
};

const ViewportButton = ({
  children,
  height = "auto",
  title,
  width,
  onClick,
}: {
  children: ReactNode;
  height?: number | "auto";
  title: string;
  width: number;
  onClick: (viewport: Viewport) => void;
}) => {
  const { state } = useAppContext();

  const [isActive, setIsActive] = useState(false);

  // We use an effect so this doesn't cause hydration warnings with SSR
  useEffect(() => {
    setIsActive(width === state.ui.viewports.current.width);
  }, [width, state.ui.viewports.current.width]);

  return (
    <Button
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        !isActive && onClick({ width, height });
      }}
      size="icon"
      className={
        isActive ? "bg-accent text-accent-foreground hover:bg-accent" : ""
      }
      variant="ghost-icon"
    >
      {children}
    </Button>
  );
};

// Based on Chrome dev tools
const defaultZoomOptions = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "100%", value: 1 },
  { label: "125%", value: 1.25 },
  { label: "150%", value: 1.5 },
  { label: "200%", value: 2 },
];

export const ViewportControls = ({
  autoZoom,
  zoom,
  onViewportChange,
  onZoom,
}: {
  autoZoom: number;
  zoom: number;
  onViewportChange: (viewport: Viewport) => void;
  onZoom: (zoom: number) => void;
}) => {
  const { viewports } = useAppContext();

  const defaultsContainAutoZoom = defaultZoomOptions.find(
    (option) => option.value === autoZoom,
  );

  const zoomOptions = useMemo(
    () =>
      [
        ...defaultZoomOptions,
        ...(defaultsContainAutoZoom
          ? []
          : [
              {
                value: autoZoom,
                label: `${(autoZoom * 100).toFixed(0)}% (Auto)`,
              },
            ]),
      ]
        .filter((a) => a.value <= autoZoom)
        .sort((a, b) => (a.value > b.value ? 1 : -1)),
    [autoZoom],
  );

  return (
    <div className="flex box-border justify-center gap-2 min-w-[358px] pb-2 px-2 z-[1]">
      {viewports.map((viewport, i) => (
        <ViewportButton
          key={i}
          height={viewport.height}
          width={viewport.width}
          title={
            viewport.label
              ? `Switch to ${viewport.label} viewport`
              : "Switch viewport"
          }
          onClick={onViewportChange}
        >
          {typeof viewport.icon === "string"
            ? icons[viewport.icon as keyof typeof icons] || viewport.icon
            : viewport.icon || icons.Smartphone}
        </ViewportButton>
      ))}
      <div className="border-r mx-2" />
      <Button
        size="icon"
        variant="ghost-icon"
        title="Zoom viewport out"
        disabled={zoom <= zoomOptions[0]?.value}
        onClick={(e) => {
          e.stopPropagation();
          onZoom(
            zoomOptions[
              Math.max(
                zoomOptions.findIndex((option) => option.value === zoom) - 1,
                0,
              )
            ].value,
          );
        }}
      >
        <Lucide.ZoomOut size={18} />
      </Button>
      <Button
        size="icon"
        variant="ghost-icon"
        title="Zoom viewport in"
        disabled={zoom >= zoomOptions[zoomOptions.length - 1]?.value}
        onClick={(e) => {
          e.stopPropagation();

          onZoom(
            zoomOptions[
              Math.min(
                zoomOptions.findIndex((option) => option.value === zoom) + 1,
                zoomOptions.length - 1,
              )
            ].value,
          );
        }}
      >
        <Lucide.ZoomIn size={18} />
      </Button>

      <div className="border-r mx-2" />

      <Select.Root
        value={zoom.toString()}
        onValueChange={(v) => {
          onZoom(parseFloat(v));
        }}
      >
        <Select.Trigger className="h-8 max-w-[9em] border-none focus:ring-0 focus:[box-shadow:none]">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {zoomOptions.map((option, i) => (
            <Select.Item key={i} value={option.value.toString()}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </div>
  );
};
