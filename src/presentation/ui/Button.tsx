import React from "react";

interface ButtonProps {
  type: "button" | "submit" | "reset";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export const Button = ({
  type,
  children,
  onClick,
  className = "",
  disabled = false,
  id = "",
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={className}
      disabled={disabled}
      id={id}
    >
      {children}
    </button>
  );
};