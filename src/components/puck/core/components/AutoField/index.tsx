import getClassNameFactory from "../../lib/get-class-name-factory";
import { Field, FieldProps } from "../../types";
import { UiState } from "../../types";

import styles from "./styles.module.css";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import {
  RadioField,
  SelectField,
  ExternalField,
  ArrayField,
  DefaultField,
  TextareaField,
  ObjectField,
} from "./fields";

import { useDebouncedCallback } from "use-debounce";

import { useSafeId } from "../../lib/use-safe-id";

const getClassName = getClassNameFactory("Input", styles);

// export const FieldLabel = ({
//   children,
//   icon,
//   label,
//   readOnly,
//   className,
// }: {
//   children?: ReactNode;
//   icon?: React.ComponentType<any>;
//   label: string;
//   el?: "label" | "div";
//   readOnly?: boolean;
//   className?: string;
// }) => {
//   return (
//     <label className={className}>
//       <div className={getClassName("label")}>
//         {icon &&
//           React.createElement<React.ComponentProps<typeof icon>>(icon, {
//             size: 16,
//           })}

//         {label}

//         {readOnly && (
//           <div className={getClassName("disabledIcon")} title="Read-only">
//             <Lock size="12" />
//           </div>
//         )}
//       </div>
//       {children}
//     </label>
//   );
// };

// type FieldLabelPropsInternal = {
//   children?: ReactNode;
//   icon?: React.ComponentType<any>;
//   label?: string;
//   el?: "label" | "div";
//   readOnly?: boolean;
// };

// export const FieldLabelInternal = ({
//   children,
//   icon,
//   label,
//   readOnly,
// }: FieldLabelPropsInternal) => {
//   if (!label) {
//     return <>{children}</>;
//   }

//   return (
//     <FieldLabel label={label} icon={icon} readOnly={readOnly}>
//       {children}
//     </FieldLabel>
//   );
// };

type FieldPropsInternalOptional<ValueType = any, F = Field<any>> = FieldProps<
  ValueType,
  F
> & {
  // Label?: React.FC<FieldLabelPropsInternal>;
  label?: string;
  name?: string;
};

export type FieldPropsInternal<ValueType = any, F = Field<any>> = FieldProps<
  ValueType,
  F
> & {
  // Label: React.FC<FieldLabelPropsInternal>;
  label?: string;
  id: string;
  name?: string;
};

function AutoFieldInternal<
  ValueType = any,
  FieldType extends Field<ValueType> = Field<ValueType>,
>(
  props: FieldPropsInternalOptional<ValueType, FieldType>,
  // & {
  //   Label?: React.FC<FieldLabelPropsInternal>;
  // },
) {
  const { field, label = field.label, id } = props;

  const defaultId = useSafeId();
  const resolvedId = id || defaultId;

  const fields = {
    array: ArrayField,
    external: ExternalField,
    object: ObjectField,
    select: SelectField,
    textarea: TextareaField,
    radio: RadioField,
    text: DefaultField,
    number: DefaultField,
  };

  const mergedProps = {
    ...props,
    field,
    label,
    id: resolvedId,
  };

  if (field.type === "custom") {
    if (!field.render) {
      return null;
    }

    const CustomField = field.render as any;

    return (
      <div className={getClassName()}>
        <CustomField {...mergedProps} />
      </div>
    );
  }

  const children = fields[field.type](mergedProps);

  const Render = fields[field.type] as (props: FieldProps) => ReactElement;

  return <Render {...mergedProps}>{children}</Render>;
}

// Don't let external value changes update this if it's changed manually in the last X ms
const RECENT_CHANGE_TIMEOUT = 200;

export function AutoFieldPrivate<
  ValueType = any,
  FieldType extends Field<ValueType> = Field<ValueType>,
>(
  props: FieldPropsInternalOptional<ValueType, FieldType>,
  // & {
  //   Label?: React.FC<FieldLabelPropsInternal>;
  // },
) {
  const { value, onChange } = props;

  const [localValue, setLocalValue] = useState(value);

  const [recentlyChanged, setRecentlyChanged] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const onChangeDb = useDebouncedCallback(
    (val, ui) => {
      onChange(val, ui);
    },
    50,
    { leading: true },
  );

  const onChangeLocal = useCallback((val: any, ui?: Partial<UiState>) => {
    setLocalValue(val);

    setRecentlyChanged(true);

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setRecentlyChanged(false);
    }, RECENT_CHANGE_TIMEOUT);

    onChangeDb(val, ui);
  }, []);

  useEffect(() => {
    if (!recentlyChanged) {
      setLocalValue(value);
    }
  }, [value]);

  const localProps = {
    value: localValue,
    onChange: onChangeLocal,
  };

  return <AutoFieldInternal<ValueType, FieldType> {...props} {...localProps} />;
}

export function AutoField<
  ValueType = any,
  FieldType extends Field<ValueType> = Field<ValueType>,
>(props: FieldProps<ValueType, FieldType>) {
  // const DefaultLabel = useMemo(() => {
  //   const DefaultLabel = (labelProps: any) => (
  //     <div
  //       {...labelProps}
  //       className={getClassName({ readOnly: props.readOnly })}
  //     />
  //   );

  //   return DefaultLabel;
  // }, [props.readOnly]);

  return <AutoFieldInternal<ValueType, FieldType> {...props} />;
}
