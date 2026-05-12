import React from "react";
import { Controller } from "react-hook-form";
// Using native textarea instead of @mui/base TextareaAutosize

const TextareaField = ({
  control,
  errors,
  defaultValue,
  name,
  placeholder = "",
  className = "",
  parentClass = "",
  label = "",
  labelClass = "",
  disabled = false,
  rows = 1,
}) => {
  return (
    <div
      className={
        "flex flex-col w-full gap-2" +
        (parentClass !== "" ? ` ${parentClass}` : "")
      }
    >
      {label && (
        <label
          htmlFor={name}
          className={
            "font-medium ml-0.5" + (labelClass !== "" ? ` ${labelClass}` : "")
          }
          style={{ color: "var(--text-primary)" }}
        >
          {label}
        </label>
      )}

      <div
        className="flex items-center border w-full border-solid overflow-hidden rounded-sm transition-all"
        style={{
          borderColor: "var(--pink-soft)",
          backgroundColor: disabled
            ? "rgba(255, 241, 242, 0.5)"
            : "rgba(255, 255, 255, 0.9)",
          boxShadow: "0 1px 6px rgba(249, 168, 212, 0.08)",
        }}
      >
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValue}
          render={({ field }) => (
            <textarea
              id={name}
              placeholder={placeholder}
              rows={rows}
              {...field}
              disabled={disabled}
              className={
                "w-full px-2.5 py-2 text-sm font-poppins placeholder:font-poppins placeholder:font-medium placeholder:text-sm not-italic leading-normal bg-transparent font-medium outline-none border-none disabled:cursor-not-allowed resize-vertical transition-all" +
                (className !== "" ? ` ${className}` : "")
              }
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
                }
              }}
              onBlur={(e) => {
                e.target.parentElement.style.borderColor = "var(--pink-soft)";
                e.target.parentElement.style.boxShadow =
                  "0 1px 6px rgba(249, 168, 212, 0.08)";
              }}
            />
          )}
        />
      </div>

      {errors[name] && (
        <p className="text-sm" style={{ color: "var(--red-soft)" }}>
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
};

export default TextareaField;