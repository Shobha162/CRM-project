import React from "react";

const GradientButton = ({
  onClick,
  children,
  icon = null,
  className = "",
  type = "button",
  fullWidth = false,
  disabled = false,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        px-6 py-2
        ${fullWidth ? "w-full" : ""}
        text-white font-semibold text-base
        rounded-lg
        shadow-md
        hover:shadow-lg
        hover:scale-105
        active:scale-95
        disabled:opacity-50
        disabled:cursor-not-allowed
        transition-all duration-300
        whitespace-nowrap
        cursor-pointer
        ${className}
      `}
      style={{
        background: "var(--gradient-primary)",
        boxShadow: "0 4px 12px rgba(90, 7, 123, 0.3)",
      }}
      {...props}
    >
      {icon && <span className="flex-shrink-0 inline-flex">{icon}</span>}
      {children}
    </button>
  );
};

export default GradientButton;