import React from "react";

const VoucherModal = ({
  open,
  onClose,
  currentVoucherNo,
  prefix,
  setPrefix,
  startFrom,
  setStartFrom,
  onSave,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl border-2"
        style={{
          backgroundColor: "#ffffff", // ✅ Pure White Background
          borderColor: "var(--pink-soft)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gradient Text */}
        <h3
          className="text-xl font-bold text-center mb-6"
          style={{
            background: "var(--text-gradient)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Set Voucher Number
        </h3>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Current Voucher No (Read-only Display) */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "#000000" }} // ✅ Black text
            >
              Current Voucher No
            </label>
            <div
              className="w-full px-4 py-3 rounded-lg text-center font-mono text-lg font-semibold"
              style={{
                backgroundColor: "#f9fafb", // Light gray bg
                color: "#000000", // ✅ Black text
                border: "2px dashed var(--purple-soft)",
              }}
            >
              {currentVoucherNo || "Not Set"}
            </div>
          </div>

          {/* Prefix + Start From Row */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
            {/* Prefix Input */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#000000" }} // ✅ Black text
              >
                Prefix
              </label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="VOU"
                className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all"
                style={{
                  backgroundColor: "#ffffff", // ✅ White background
                  color: "#000000", // ✅ Black text
                  border: "2px solid var(--pink-soft)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--purple-soft)";
                  e.target.style.boxShadow = `0 0 0 4px rgba(165, 180, 252, 0.2)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--pink-soft)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Separator */}
            <div
              className="text-2xl font-bold pb-3"
              style={{ color: "var(--pink-soft)" }}
            >
              -
            </div>

            {/* Start From Input */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#000000" }} // ✅ Black text
              >
                Start From
              </label>
              <input
                type="number"
                value={startFrom}
                onChange={(e) => setStartFrom(e.target.value)}
                placeholder="1001"
                className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all"
                style={{
                  backgroundColor: "#ffffff", // ✅ White background
                  color: "#000000", // ✅ Black text
                  border: "2px solid var(--pink-soft)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--purple-soft)";
                  e.target.style.boxShadow = `0 0 0 4px rgba(165, 180, 252, 0.2)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--pink-soft)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm rounded-lg border-2 font-semibold transition-all duration-200 hover:scale-105"
            style={{
              borderColor: "var(--pink-soft)",
              color: "#000000", // ✅ Black text
              backgroundColor: "#ffffff",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "var(--gradient-soft)";
              e.target.style.borderColor = "var(--purple-soft)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#ffffff";
              e.target.style.borderColor = "var(--pink-soft)";
            }}
          >
            Cancel
          </button>

          {/* Save Button */}
          <button
            onClick={onSave}
            className="flex-1 px-4 py-3 text-sm rounded-lg text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            style={{
              background: "var(--gradient-primary)",
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherModal;
