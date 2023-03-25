import { ReactNode, useState } from "react";

interface AsyncButtonProps {
  children: ReactNode;
  title?: string;
  className?: string;
  type?: "submit" | "reset" | "button";

  onClick: () => Promise<void>;
}

export default function AsyncButton({
  onClick,
  children,
  title,
  className,
  type = "button",
}: AsyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const handleOnClick = () => {
    setIsLoading(true);
    onClick().finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <button
      type={type}
      title={title}
      onClick={handleOnClick}
      className={`btn ${className} ${isLoading ? "loading" : ""}`}
    >
      {children}
    </button>
  );
}
