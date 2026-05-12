import React from "react";
import { Controller } from "react-hook-form";

const TextEditorField = ({
  name,
  control,
  label,
  errors,
  defaultValue = "",
  required = false,
}) => {
  return (
    <div className="col-span-2 lg:col-span-4">
      {label && (
        <label
          className="block mb-1 font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {label}{" "}
          {required && <span style={{ color: "var(--red-soft)" }}>*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={required ? { required: "This field is required" } : {}}
        render={({ field }) => (
          <textarea
            {...field}
            value={field.value || defaultValue}
            onChange={(e) => field.onChange(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 text-sm rounded-md outline-none resize-vertical transition-all duration-200"
            style={{
              border: "1px solid var(--pink-soft)",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              color: "var(--text-primary)",
              boxShadow: "0 2px 8px rgba(5, 117, 97, 0.08)",
            }}
            onFocus={(e) => {
              e.target.style.border = "1px solid var(--purple-soft)";
              e.target.style.boxShadow = "0 0 0 3px rgba(189, 186, 6, 0.15)";
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid var(--pink-soft)";
              e.target.style.boxShadow = "0 2px 8px rgba(5, 117, 97, 0.08)";
            }}
          />
        )}
      />
      {errors?.[name] && (
        <span
          className="text-sm block mt-1"
          style={{ color: "var(--red-soft)" }}
        >
          {errors[name]?.message}
        </span>
      )}
    </div>
  );
};

export default TextEditorField;