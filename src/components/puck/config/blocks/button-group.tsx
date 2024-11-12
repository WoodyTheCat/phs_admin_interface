import { ComponentConfig } from "../../core";
import { Button } from "../../core/components/Button";
import { Section } from "../components/section";
import { cn } from "@/lib/utils";

export type ButtonGroupProps = {
  align?: string;
  buttons: { label: string; href: string; variant: "primary" | "secondary" }[];
};

export const ButtonGroup: ComponentConfig<ButtonGroupProps> = {
  label: "Button Group",
  fields: {
    buttons: {
      type: "array",
      getItemSummary: (item) => item.label || "Button",
      arrayFields: {
        label: { type: "text" },
        href: { type: "text" },
        variant: {
          type: "radio",
          options: [
            { label: "primary", value: "primary" },
            { label: "secondary", value: "secondary" },
          ],
        },
      },
      defaultItemProps: {
        label: "Button",
        href: "#",
        variant: "primary",
      },
    },
    align: {
      type: "radio",
      options: [
        { label: "left", value: "left" },
        { label: "center", value: "center" },
      ],
    },
  },
  defaultProps: {
    buttons: [{ label: "Learn more", href: "#", variant: "primary" }],
  },
  render: ({ align, buttons, puck }) => {
    return (
      <Section className={cn(align === "center" && "justify-center")}>
        <div className="flex gap-6 flex-wrap">
          {buttons.map((button, i) => (
            <Button
              key={i}
              href={button.href}
              variant={button.variant}
              size="large"
              tabIndex={puck.isEditing ? -1 : undefined}
            >
              {button.label}
            </Button>
          ))}
        </div>
      </Section>
    );
  },
};
