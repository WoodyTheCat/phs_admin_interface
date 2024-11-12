import { ComponentConfig } from "../../core";
import { Heading as _Heading } from "../../core/components/Heading";
import type { HeadingProps as _HeadingProps } from "../../core/components/Heading";
import { Section } from "../components/section";

export type HeadingProps = {
  align: "left" | "center" | "right";
  text?: string;
  level?: _HeadingProps["rank"];
  padding?: string;
};

const levelOptions = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
];

export const Heading: ComponentConfig<HeadingProps> = {
  fields: {
    text: {
      type: "textarea",
    },
    level: {
      type: "select",
      options: levelOptions,
    },
    align: {
      type: "radio",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
    padding: { type: "text" },
  },
  defaultProps: {
    align: "left",
    text: "Heading",
    padding: "24px",
  },
  render: ({ align, text, level, padding }) => {
    return (
      <Section padding={padding}>
        <_Heading rank={level as any}>
          <span style={{ display: "block", textAlign: align, width: "100%" }}>
            {text}
          </span>
        </_Heading>
      </Section>
    );
  },
};
