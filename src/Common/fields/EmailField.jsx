import React from "react";
import { Controller } from "react-hook-form";
import { MdOutlineMailOutline } from "react-icons/md";

const EmailField = ({
  control,
  errors,
  name,
  placeholder = "",
  className = "",
  parentClass = "",
  label = "",
  labelClass = "",
  disabled = false,
}) => {
  return (
    <div
      className={`flex flex-col w-full gap-2${
        parentClass ? ` ${parentClass}` : ""
      }`}
    >
      {label && (
        <label
          htmlFor={name}
          className={`font-medium ml-0.5${labelClass ? ` ${labelClass}` : ""}`}
          style={{ color: "var(--text-primary)" }}
        >
          {label}
        </label>
      )}
      <div
        className={`flex items-center w-full overflow-hidden rounded-sm border border-solid transition-all ${
          disabled ? "cursor-not-allowed" : ""
        }`}
        style={{
          borderColor: "var(--pink-soft)",
          backgroundColor: disabled
            ? "rgba(255, 241, 242, 0.5)"
            : "rgba(255, 255, 255, 0.9)",
          boxShadow: "0 1px 6px rgba(249, 168, 212, 0.08)",
        }}
      >
        <MdOutlineMailOutline
          size={18}
          className="ml-2 transition-all"
          style={{ color: "var(--pink-soft)" }}
        />
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              id={name}
              type="email"
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              className={`w-full px-2.5 py-2 text-sm outline-none border-none font-medium bg-transparent font-poppins ${className}`}
              style={{
                color: "var(--text-primary)",
                backgroundColor: "transparent",
              }}
              onFocus={(e) => {
                if (!disabled) {
                  e.target.parentElement.style.borderColor =
                    "var(--purple-soft)";
                  e.target.parentElement.style.boxShadow =
                    "0 0 0 3px rgba(165, 180, 252, 0.15)";
                  const icon = e.target.parentElement.querySelector("svg");
                  if (icon) icon.style.color = "var(--purple-soft)";
                }
              }}
              onBlur={(e) => {
                e.target.parentElement.style.borderColor = "var(--pink-soft)";
                e.target.parentElement.style.boxShadow =
                  "0 1px 6px rgba(249, 168, 212, 0.08)";
                const icon = e.target.parentElement.querySelector("svg");
                if (icon) icon.style.color = "var(--pink-soft)";
              }}
            />
          )}
        />
      </div>
      {errors[name] && (
        <p className="text-xs" style={{ color: "var(--red-soft)" }}>
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
};

export default EmailField;
