import React from "react";
import { Controller } from "react-hook-form";
// react-quill replaced with native textarea (react-quill not in dependencies)

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
            className="w-full px-3 py-2 text-sm rounded-md outline-none resize-vertical"
            style={{
              border: "1px solid var(--pink-soft)",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              boxShadow: "0 2px 8px rgba(249, 168, 212, 0.1)",
              color: "var(--text-primary)",
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