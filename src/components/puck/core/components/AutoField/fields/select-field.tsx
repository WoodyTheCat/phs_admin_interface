import * as Lucide from "lucide-react";
import { FieldPropsInternal } from "..";
import { Label } from "@/components/ui/label";
import * as Select from "@/components/ui/select";

export const SelectField = ({
  field,
  onChange,
  label,
  value,
  name,
  readOnly,
  id,
}: FieldPropsInternal) => {
  if (field.type !== "select" || !field.options) {
    return null;
  }

  return (
    <>
      <Label icon={field.icon || Lucide.ChevronDown} locked={readOnly}>
        {label || name}
      </Label>
      <Select.Root
        onValueChange={(val) => {
          if (val === "true" || val === "false") {
            onChange(JSON.parse(val));
            return;
          }

          onChange(val);
        }}
        value={value}
      >
        <Select.Trigger id={id} disabled={readOnly}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {field.options.map((option, i) => (
            <Select.Item key={i} value={option.value.toString()}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </>
  );
};
