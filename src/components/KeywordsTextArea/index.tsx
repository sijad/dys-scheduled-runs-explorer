import { useId } from "react";

interface KeywordsTextAreaProps {
  label: string;
  name: string;
  rows?: number;
  help?: string;
}

export default function KeywordsTextArea({
  label,
  rows,
  name,
  help,
}: KeywordsTextAreaProps) {
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
        <label className="text-sm label" htmlFor={id}>
          {help}
        </label>
      ) : null}
    </>
  );
}
