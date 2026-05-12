import React, { useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { GoUpload } from "react-icons/go";
import { RxCross2 } from "react-icons/rx";

const UploadField = ({
  control,
  errors,
  name,
  placeholder = "",
  className = "",
  parentClass = "",
  label = "",
  labelClass = "",
  accept = "*",
  disabled = false,
}) => {
  const [fileName, setFileName] = useState(placeholder);
  const [showCross, setShowCross] = useState(false);
  const inputRef = useRef(null);

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setFileName(event.target.files[0].name);
    } else {
      setFileName(placeholder);
    }
  };

  const handleRemoveFile = (onChange) => {
    setFileName(placeholder);
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = null;
    }
  };

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
        className={`flex items-center border relative w-full py-2 border-solid overflow-hidden rounded-sm transition-all cursor-pointer ${disabled ? "cursor-not-allowed" : ""}`}
        style={{
          borderColor: "var(--pink-soft)",
          backgroundColor: disabled
            ? "rgba(255, 241, 242, 0.5)"
            : "rgba(255, 255, 255, 0.9)",
          boxShadow: "0 1px 6px rgba(249, 168, 212, 0.08)",
        }}
        onClick={handleClick}
        onMouseEnter={() => !disabled && setShowCross(true)}
        onMouseLeave={() => setShowCross(false)}
      >
        <Controller
          name={name}
          control={control}
          render={({ field: { onChange, value } }) => (
            <>
              <h2
                className={`w-full px-2.5 text-sm font-poppins not-italic leading-normal font-medium bg-transparent outline-none border-none ${className}`}
                style={{ color: "var(--text-primary)" }}
              >
                {fileName}
              </h2>

              <input
                id={name}
                type="file"
                accept={accept}
                ref={inputRef}
                disabled={disabled}
                onChange={(e) => {
                  if (e.target.files.length > 0) {
                    handleFileChange(e);
                    onChange(e.target.files);
                  }
                }}
                className="hidden"
              />
              {fileName !== placeholder && showCross && !disabled && (
                <button
                  className="p-1 transition-all hover:scale-110 absolute top-2.5 right-2.5 rounded-3xl"
                  style={{
                    backgroundColor: "rgba(254, 202, 202, 0.5)",
                    border: "1px solid var(--red-soft)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(onChange);
                  }}
                >
                  <RxCross2 size={10} style={{ color: "var(--red-soft)" }} />
                </button>
              )}
            </>
          )}
        />
        <GoUpload
          size={"18px"}
          style={{
            color: "var(--pink-soft)",
            marginRight: "12px",
          }}
        />
      </div>
      {errors[name] && (
        <p style={{ color: "var(--red-soft)" }}>{errors[name]?.message}</p>
      )}
    </div>
  );
};

export default UploadField;
