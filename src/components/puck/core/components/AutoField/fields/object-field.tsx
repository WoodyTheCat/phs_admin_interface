import * as Lucide from "lucide-react";
import { AutoFieldPrivate, FieldPropsInternal } from "..";
import { useAppContext } from "../../Puck/context";
import { Label } from "@/components/ui/label";

export const ObjectField = ({
  field,
  onChange,
  value,
  name,
  label,
  readOnly,
  id,
}: FieldPropsInternal) => {
  const { selectedItem } = useAppContext();

  if (field.type !== "object" || !field.objectFields) {
    return null;
  }

  const readOnlyFields = selectedItem?.readOnly || {};

  const data = value || {};

  return (
    <>
      <Label icon={field.icon || Lucide.MoreVertical} locked={readOnly}>
        {label || name}
      </Label>
      <div className="flex flex-col rounded border">
        <fieldset className="border-none m-0 min-w-0 p-4">
          {Object.keys(field.objectFields!).map((fieldName) => {
            const subField = field.objectFields![fieldName];

            const subFieldName = `${name}.${fieldName}`;
            const wildcardFieldName = `${name}.${fieldName}`;

            const subReadOnly = readOnly
              ? readOnly
              : typeof readOnlyFields[subFieldName] !== "undefined"
                ? readOnlyFields[subFieldName]
                : readOnlyFields[wildcardFieldName];

            return (
              <AutoFieldPrivate
                key={subFieldName}
                name={subFieldName}
                label={subField.label || fieldName}
                id={`${id}_${fieldName}`}
                readOnly={subReadOnly}
                field={subField}
                value={data[fieldName]}
                onChange={(val, ui) => {
                  onChange(
                    {
                      ...data,
                      [fieldName]: val,
                    },
                    ui,
                  );
                }}
              />
            );
          })}
        </fieldset>
      </div>
    </>
  );
};
