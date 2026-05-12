import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { MdLockOutline } from "react-icons/md";
import { FiEye, FiEyeOff } from "react-icons/fi";

const PasswordField = ({
  control,
  errors,
  name,
  placeholder = "",
  className = "",
  parentClass = "",
  labelClass = "",
  label = "",
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    if (!disabled) setShowPassword((prev) => !prev);
  };

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
        className={`flex items-center border w-full border-solid overflow-hidden rounded-sm relative transition-all ${
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
        <MdLockOutline
          size="18px"
          className="ml-2 transition-all"
          style={{ color: "var(--pink-soft)" }}
        />
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              id={name}
              type={showPassword ? "text" : "password"}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              className={`w-full px-2.5 py-2 text-sm font-poppins bg-transparent placeholder:font-poppins placeholder:text-sm placeholder:leading-normal placeholder:font-medium outline-none disabled:cursor-not-allowed border-none${
                className ? ` ${className}` : ""
              }`}
              style={{
                color: "var(--text-primary)",
              }}
              autoComplete="off"
              onFocus={(e) => {
                if (!disabled) {
                  e.target.parentElement.style.borderColor =
                    "var(--purple-soft)";
                  e.target.parentElement.style.boxShadow =
                    "0 0 0 3px rgba(165, 180, 252, 0.15)";
                  const lockIcon =
                    e.target.parentElement.querySelector("svg:nth-child(1)");
                  const eyeBtn =
                    e.target.parentElement.querySelector("button svg");
                  if (lockIcon) lockIcon.style.color = "var(--purple-soft)";
                  if (eyeBtn)
                    eyeBtn.parentElement.style.color = "var(--purple-soft)";
                }
              }}
              onBlur={(e) => {
                e.target.parentElement.style.borderColor = "var(--pink-soft)";
                e.target.parentElement.style.boxShadow =
                  "0 1px 6px rgba(249, 168, 212, 0.08)";
                const lockIcon =
                  e.target.parentElement.querySelector("svg:nth-child(1)");
                const eyeBtn =
                  e.target.parentElement.querySelector("button svg");
                if (lockIcon) lockIcon.style.color = "var(--pink-soft)";
                if (eyeBtn)
                  eyeBtn.parentElement.style.color = "var(--pink-soft)";
              }}
            />
          )}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className={`absolute right-2 transition-all ${
            disabled ? "cursor-not-allowed" : "hover:scale-110"
          }`}
          style={{ color: "var(--pink-soft)" }}
        >
          {showPassword ? <FiEyeOff size="18px" /> : <FiEye size="18px" />}
        </button>
      </div>

      {errors[name] && (
        <p className="text-sm font-medium" style={{ color: "var(--red-soft)" }}>
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
};

export default PasswordField;
