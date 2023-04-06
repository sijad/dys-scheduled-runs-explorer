import { forwardRef, useId, ChangeEvent, ReactNode } from "react";

interface TextInputProps {
  label: string;
  name: string;
  help?: ReactNode;
  disabled?: boolean;
  after?: ReactNode;
  onBlur?: (e: ChangeEvent<HTMLInputElement>) => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ onChange, onBlur, name, label, help, disabled, after }, ref) => {
    const id = useId();

    return (
      <>
        <label className="label" htmlFor={id}>
          {label}
        </label>
        <div className="w-full input-group">
          <input
            ref={ref}
            className="w-full input input-bordered"
            type="text"
            onBlur={onBlur}
            onChange={onChange}
            name={name}
            disabled={disabled}
            id={id}
          />
          {after}
        </div>
        {help ? (
          <label className="text-sm opacity-75 label" htmlFor={id}>
            {help}
          </label>
        ) : null}
      </>
    );
  }
);

TextInput.displayName = "TextInput";

export default TextInput;
