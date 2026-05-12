import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

const ChangePasswordForm = ({ employeeId, onChangePass }) => {
  const { register, handleSubmit, reset } = useForm();

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data) => {
    onChangePass({
      id: employeeId,
      newPassword: data.newPassword,
    });

    reset();
    setShowPassword(false);
  };

  return (
    <div
      className="mt-6 border-t pt-4"
      style={{ borderColor: "var(--pink-soft)" }}
    >
      <h2
        className="text-lg font-semibold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        Change Password
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col md:flex-row gap-4 items-stretch md:items-center"
      >
        {/* Password Input */}
        <div className="relative w-full md:w-1/2">
          <input
            {...register("newPassword", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            className="w-full pr-11 px-3 py-2 rounded-md border focus:outline-none transition-all text-sm"
            style={{
              borderColor: "var(--pink-soft)",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "var(--text-primary)",
              boxShadow: "0 1px 6px rgba(249, 168, 212, 0.08)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--purple-soft)";
              e.target.style.boxShadow =
                "0 0 0 3px rgba(165, 180, 252, 0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--pink-soft)";
              e.target.style.boxShadow =
                "0 1px 6px rgba(249, 168, 212, 0.08)";
            }}
          />

          {/* Show / Hide Password */}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="capitalize py-3 px-4 font-bold hover:scale-105 transition-all shadow-lg w-full md:w-auto rounded-md"
          style={{
            background: "var(--gradient-primary)",
            border: "1px solid var(--purple-soft)",
            color: "white",
            boxShadow: "0 4px 12px rgba(249, 168, 212, 0.4)",
          }}
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;