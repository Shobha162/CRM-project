import React, { useRef } from "react";
import { Controller } from "react-hook-form";
import { Select } from "antd";

import "./styles/SelectStyle.css";

const SelectField = ({
  control,
  errors,
  name,
  options = [],
  placeholder = "",
  className = "",
  label = "",
  labelClass = "",
  parentClass = "",
  disabled = false,
  mode = "multiple",
  onSelectChange = function () {},
}) => {
  // ✅ Fix: document.querySelector ki jagah containerRef use karo
  // Warna page pe multiple selects hone par galat element ka border change hoga
  const containerRef = useRef(null);

  const setFocusStyle = () => {
    if (containerRef.current) {
      const selector = containerRef.current.querySelector(".ant-select-selector");
      if (selector) {
        selector.style.borderColor = "var(--purple-soft)";
        selector.style.boxShadow = "0 0 0 3px rgba(165, 180, 252, 0.15)";
      }
    }
  };

  const setBlurStyle = () => {
    if (containerRef.current) {
      const selector = containerRef.current.querySelector(".ant-select-selector");
      if (selector) {
        selector.style.borderColor = "var(--pink-soft)";
        selector.style.boxShadow = "0 1px 6px rgba(249, 168, 212, 0.08)";
      }
    }
  };

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
      <div ref={containerRef}>
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, value } }) => (
            <Select
              id={name}
              mode={mode}
              showSearch
              allowClear
              placeholder={placeholder}
              onChange={(selectedValue) => {
                onChange(selectedValue);
                if (onSelectChange) {
                  onSelectChange(selectedValue);
                }
              }}
              disabled={disabled}
              value={value}
              className={`w-full custom-multi-select rounded-sm ${className}`}
              style={{
                borderColor: "var(--pink-soft)",
                backgroundColor: disabled
                  ? "rgba(255, 241, 242, 0.5)"
                  : "rgba(255, 255, 255, 0.95)",
                boxShadow: "0 1px 6px rgba(249, 168, 212, 0.08)",
              }}
              onFocus={setFocusStyle}
              onBlur={setBlurStyle}
              options={options}
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          )}
        />
      </div>
      {errors[name] && (
        <p style={{ color: "var(--red-soft)" }}>{errors[name]?.message}</p>
      )}
    </div>
  );
};

export default SelectField;