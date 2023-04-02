import { useId } from "react";
import {
  JSONEditor,
  Schema,
  ObjectSchema,
  themes,
} from "react-schema-based-json-editor";

interface KWArgsInputProps {
  label: string;
  schema: Schema;
  onChange: (value: string) => void;
}

themes["daisyui"] = {
  card: "card bg-base-100 my-3 px-2",
  row: "form-control",
  errorRow: "form-control",
  input: "input input-bordered",
  errorInput: "input input-bordered input-error",
  textarea: "textarea",
  errorTextarea: "textarea textarea-error",
  checkbox: "checkbox",
  radiobox: "radio",
  button: "btn",
  buttonGroup: "btn-group",
  title: "label",
  description: "label opacity-75 text-sm",
  select: "select select-bordered",
};

export default function KWArgsInput({
  schema,
  onChange,
  label,
}: KWArgsInputProps) {
  const id = useId();

  const hasArgs = Object.keys((schema as ObjectSchema).properties).length > 0;

  return hasArgs ? (
    <>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <JSONEditor
        theme="daisyui"
        disableCollapse
        noSelect2
        schema={schema}
        initialValue={{}}
        updateValue={(value) => {
          if (value) {
            onChange(JSON.stringify(value));
          }
        }}
      />
    </>
  ) : (
    <p className="text-sm text-center opacity-75">
      Selected function has no arguments.
    </p>
  );
}
