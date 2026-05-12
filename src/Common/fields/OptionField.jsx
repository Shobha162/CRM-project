import React from "react";
import { Select } from "antd";
import { Controller } from "react-hook-form";

import "./styles/OptionStyle.css";

const OptionField = ({
  control,
  errors,
  name,
  options = [],
  placeholder = "",
  className = "",
  onSelectChange = () => {},
  label = "",
  labelClass = "",
  parentClass = "",
  disabled = false,
}) => {
  return (
    <div className={`flex flex-col w-full gap-2 ${parentClass}`}>
      {label && (
        <label
          htmlFor={name}
          className={`font-medium ml-0.5 ${labelClass}`}
          style={{ color: "var(--text-primary)" }}
        >
          {label}
        </label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <Select
            placeholder={placeholder}
            onChange={(selectedOption) => {
              onChange(selectedOption ? selectedOption : null);
              onSelectChange(selectedOption);
            }}
            onBlur={onBlur}
            disabled={disabled}
            ref={ref}
            className={`w-full custom-select rounded-sm ${className}`}
            value={value}
            style={{
              borderColor: "var(--pink-soft)",
              backgroundColor: disabled
                ? "rgba(255, 241, 242, 0.5)"
                : "rgba(255, 255, 255, 0.95)",
              boxShadow: "0 1px 6px rgba(249, 168, 212, 0.08)",
            }}
          >
            {options.map((item, index) => (
              <Select.Option
                key={index}
                value={item.value}
                className="capitalize"
              >
                {item.label}
              </Select.Option>
            ))}
          </Select>
        )}
      />
      {errors[name] && (
        <p style={{ color: "var(--red-soft)" }}>{errors[name]?.message}</p>
      )}
    </div>
  );
};

export default OptionField;
