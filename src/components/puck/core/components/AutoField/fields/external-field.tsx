import { FieldPropsInternal } from "..";
import type { ExternalField as ExternalFieldType } from "../../../types";

import { ExternalInput } from "../../ExternalInput";
import * as Lucide from "lucide-react";
import { Label } from "@/components/ui/label";

export const ExternalField = ({
  field: _field,
  onChange,
  value,
  name,
  label,

  id,
  readOnly,
}: FieldPropsInternal) => {
  // DEPRECATED or maybe not, I changed it
  const field = _field as ExternalFieldType;

  if (_field.type !== "external") {
    return null;
  }

  return (
    <>
      <Label icon={_field.icon || Lucide.Link} htmlFor={id}>
        {label || name}
      </Label>
      <ExternalInput
        name={name}
        field={{
          ...field,

          placeholder: field.placeholder || "Select data",
          mapProp: field.mapProp,
          mapRow: field.mapRow,
          fetchList: field.fetchList,
        }}
        onChange={onChange}
        value={value}
        id={id}
        readOnly={readOnly}
      />
    </>
  );
};
