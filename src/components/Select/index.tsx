import { forwardRef, useId, ChangeEvent } from "react";

export interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  name: string;
  help?: string;
  options: Option[];
  onBlur?: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ onChange, onBlur, name, label, help, options, disabled }, ref) => {
    const id = useId();

    return (
      <>
        <label className="label" htmlFor={id}>
          {label}
        </label>
        <select
          ref={ref}
          className="select select-bordered"
          onBlur={onBlur}
          onChange={onChange}
          name={name}
          id={id}
          disabled={disabled}
        >
          {options.map(({ label, value }, i) => (
            <option key={i} value={value}>
              {label}
            </option>
          ))}
        </select>
        {help ? (
          <label className="text-sm opacity-75 label" htmlFor={id}>
            {help}
          </label>
        ) : null}
      </>
    );
  }
);

Select.displayName = "Select";

export default Select;
