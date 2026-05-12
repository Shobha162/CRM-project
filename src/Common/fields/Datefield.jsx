import React from "react";
import { Controller } from "react-hook-form";
import { DatePicker } from "antd";
import dayjs from "../../utils/dayjsSetup";   // ✅ central import (ab file exist karti hai)
import {
  formatDateForDisplay,
  formatDateForSubmit,
} from "../../utils/DateUtils";  // ✅ central date formatting functions

import "./styles/DateStyle.css";
import { Calendar } from "lucide-react";

const DateField = ({
  control,
  errors,
  name,
  placeholder = "",
  className = "",
  parentClass = "",
  label = "",
  labelClass = "",
  disabled = false,
  picker = "date",
}) => {
  const dateFormat = "DD-MM-YYYY";

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
          render={({ field }) => {
            // ✅ formatDateForDisplay ab dayjs use karta hai (moment nahi)
            const displayValue = field.value
              ? formatDateForDisplay(field.value)
              : null;

            return (
              <DatePicker
                id={name}
                placeholder={placeholder}
                disabled={disabled}
                picker={picker}
                {...field}
                className={`w-full px-2.5 py-[7.5px] text-sm font-poppins not-italic leading-normal font-medium outline-none border-none custom-date disabled:cursor-not-allowed transition-all ${className}`}
                style={{
                  color: "var(--text-primary)",
                  backgroundColor: "transparent",
                }}
                format={dateFormat}
                value={
                  displayValue
                    ? dayjs(displayValue, "DD/MM/YYYY")
                    : null
                }
                onChange={(date) => {
                  const formatted = date
                    ? formatDateForSubmit(date.format(dateFormat))
                    : null;
                  field.onChange(formatted);
                }}
                suffixIcon={
                  <Calendar size={16} style={{ color: "var(--pink-soft)" }} />
                }
              />
            );
          }}
        />
      </div>
      {errors[name] && (
        <p style={{ color: "var(--red-soft)" }}>{errors[name]?.message}</p>
      )}
    </div>
  );
};

export default DateField;