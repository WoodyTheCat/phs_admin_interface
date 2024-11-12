import { ComponentConfig } from "../../../core/types";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { cn } from "@/lib/utils";
// import { LucideProps } from "lucide-react";

// interface IconProps extends Omit<LucideProps, 'ref'> {
//   name: keyof typeof dynamicIconImports;
// }

// const icons = Object.keys(dynamicIconImports).reduce<
//   Record<string, ReactElement>
// >((acc, iconName) => {
//   const El = lazy(dynamicIconImports[iconName]);

//   return {
//     ...acc,
//     [iconName]: <El />,
//   };
// }, {});

const iconOptions = Object.keys(dynamicIconImports).map((iconName) => ({
  label: iconName,
  value: iconName,
}));

export type CardProps = {
  title: string;
  description: string;
  icon?: string;
  mode: "flat" | "card";
};

export const Card: ComponentConfig<CardProps> = {
  fields: {
    title: { type: "text" },
    description: { type: "textarea" },
    icon: {
      type: "select",
      options: iconOptions,
    },
    mode: {
      type: "radio",
      options: [
        { label: "card", value: "card" },
        { label: "flat", value: "flat" },
      ],
    },
  },
  defaultProps: {
    title: "Title",
    description: "Description",
    icon: "Feather",
    mode: "flat",
  },
  render: ({ title, icon, description, mode }) => {
    return (
      <div
        className={cn(
          "flex flex-col items-center mx-auto gap-4 w-full",
          mode === "card" &&
            "bg-card rounded-xl flex-1 mx-[unset] p-6 items-start w-auto",
        )}
      >
        <div className="rounded-lg bg-[lighten(var(--accent),20%)] text-accent flex justify-center items-center w-16 h-16">
          {icon && "TEMP"}
        </div>
        {/* icons[icon] */}
        <div
          className={cn("text-lg text-center", mode === "card" && "text-left")}
        >
          {title}
        </div>
        <div
          className={cn(
            "[line-height:1.5] text-muted-foreground text-center font-thin",
            mode === "card" && "text-left",
          )}
        >
          {description}
        </div>
      </div>
    );
  },
};
