import { useId } from "react";

interface TextAreaProps {
  label: string;
  name: string;
  rows?: number;
  help?: string;
}

export default function TextArea({ label, rows, name, help }: TextAreaProps) {
  const id = useId();

  return (
    <>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <textarea
        className="textarea textarea-bordered"
        name={name}
        id={id}
        rows={rows}
      />
      {help ? (
        <label className="text-sm opacity-75 label" htmlFor={id}>
          {help}
        </label>
      ) : null}
    </>
  );
}
