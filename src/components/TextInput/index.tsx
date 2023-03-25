import { useId } from "react";

interface TextInputProps {
  label: string;
  name: string;
  help?: string;
}

export default function TextInput({ label, name, help }: TextInputProps) {
  const id = useId();

  return (
    <>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input type="text" name={name} className="input input-bordered" id={id} />
      {help ? (
        <label className="text-sm opacity-75 label" htmlFor={id}>
          {help}
        </label>
      ) : null}
    </>
  );
}
