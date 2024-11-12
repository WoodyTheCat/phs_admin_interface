import { ComponentConfig } from "../../core/types";
import { DropZone } from "../../core/components/DropZone";
import { Section } from "../components/section";
import { cn } from "@/lib/utils";
import * as Lucide from "lucide-react";

export type ColumnsProps = {
  distribution: "auto" | "manual";
  columns: {
    span?: number;
  }[];
};

export const Columns: ComponentConfig<ColumnsProps> = {
  fields: {
    distribution: {
      type: "radio",
      icon: Lucide.BetweenVerticalEnd,
      options: [
        {
          value: "auto",
          label: "Auto",
        },
        {
          value: "manual",
          label: "Manual",
        },
      ],
    },
    columns: {
      type: "array",
      icon: Lucide.Columns3,
      getItemSummary: (col, id = -1) =>
        `Column ${id + 1}, span ${
          col.span ? Math.max(Math.min(col.span, 12), 1) : "auto"
        }`,
      arrayFields: {
        span: {
          label: "Span (1-12)", // TODO: Consider changing this to 1-10
          type: "number",
          min: 0,
          max: 12,
        },
      },
    },
  },
  defaultProps: {
    distribution: "auto",
    columns: [{}, {}],
  },
  render: ({ columns, distribution }) => {
    return (
      <Section>
        <div
          className={cn("flex g-4 flex-col min-h-0 min-w-0 md:grid")}
          style={{
            gridTemplateColumns:
              distribution === "manual"
                ? "repeat(12, minmax(0, 1fr))"
                : `repeat(${columns.length}, minmax(0, 1fr))`,
          }}
        >
          {columns.map(({ span }, i) => (
            <div
              key={i}
              className="flex flex-col grow-0"
              style={{
                gridColumn:
                  span && distribution === "manual"
                    ? `span ${Math.max(Math.min(span, 12), 1)}`
                    : "",
              }}
            >
              <DropZone
                zone={`column-${i}`}
                disallow={["Hero", "Logos", "Stats"]}
              />
            </div>
          ))}
        </div>
      </Section>
    );
  },
};
