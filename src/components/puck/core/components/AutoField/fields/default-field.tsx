import * as Lucide from "lucide-react";
import { FieldPropsInternal } from "..";
import { DefaultOverride } from "../../default-override";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const DefaultField = ({
  field,
  onChange,
  readOnly,
  value,
  name,
  label,
  id,
}: FieldPropsInternal) => {
  return (
    <>
      <Label
        htmlFor={id}
        icon={
          field.icon || field.type === "text"
            ? Lucide.Type
            : field.type === "number"
              ? Lucide.Hash
              : DefaultOverride
        }
        locked={readOnly}
      >
        {label || name}
      </Label>
      <Input
        autoComplete="off"
        type={field.type}
        name={name}
        value={typeof value === "undefined" ? "" : value}
        onChange={(e) => {
          if (field.type === "number") {
            onChange(Number(e.currentTarget.value));
          } else {
            onChange(e.currentTarget.value);
          }
        }}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        id={id}
        min={field.type === "number" ? field.min : undefined}
        max={field.type === "number" ? field.max : undefined}
      />
    </>
  );
};
