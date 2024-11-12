import { ComponentConfig } from "../../core/types";

import { DropZone } from "../../core/components/DropZone";
import { Section } from "../components/section";

export type FlexProps = {
  items: {
    minItemWidth?: number;
  }[];
  minItemWidth: number;
};

export const Flex: ComponentConfig<FlexProps> = {
  fields: {
    items: {
      type: "array",
      arrayFields: {
        minItemWidth: {
          label: "Minimum Item Width",
          type: "number",
          min: 0,
        },
      },
      getItemSummary: (_, id = -1) => `Item ${id + 1}`,
    },
    minItemWidth: {
      label: "Minimum Item Width",
      type: "number",
      min: 0,
    },
  },
  defaultProps: {
    items: [{}, {}],
    minItemWidth: 356,
  },
  render: ({ items, minItemWidth }) => {
    return (
      <Section>
        <div className="flex gap-6 min-h-0 min-w-0 flex-nowrap">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex-1 grow-0"
              style={{ minWidth: item.minItemWidth || minItemWidth }}
            >
              <DropZone zone={`item-${idx}`} />
            </div>
          ))}
        </div>
      </Section>
    );
  },
};
