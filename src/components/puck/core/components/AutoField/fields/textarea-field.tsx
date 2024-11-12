import * as Lucide from "lucide-react";
import { FieldPropsInternal } from "..";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const TextareaField = ({
  onChange,
  readOnly,
  value,
  name,
  label,
  id,
  field,
}: FieldPropsInternal) => {
  return (
    <>
      <Label icon={field.icon || Lucide.Type} locked={readOnly}>
        {label || name}
      </Label>
      <Textarea
        id={id}
        autoComplete="off"
        name={name}
        value={typeof value === "undefined" ? "" : value}
        onChange={(e) => onChange(e.currentTarget.value)}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        rows={5}
      />
    </>
  );
};
