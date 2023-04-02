import { ChangeEvent, forwardRef, useId } from "react";

interface TextAreaProps {
  label: string;
  name: string;
  rows?: number;
  help?: string;
  onBlur?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ onChange, onBlur, name, label, help, rows }, ref) => {
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
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
        />
        {help ? (
          <label className="text-sm opacity-75 label" htmlFor={id}>
            {help}
          </label>
        ) : null}
      </>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
