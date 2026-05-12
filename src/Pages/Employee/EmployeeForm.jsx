import React from "react";
import InputField from "../../Common/fields/InputField";
import { useForm } from "react-hook-form";
import { Button } from "@material-tailwind/react";
import GradientButton from "../../Common/GradientButton";

const EmployeeForm = ({ onSubmit, defaultValues = {}, role }) => {
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({ defaultValues });

  const isEdit = !!(defaultValues.id || defaultValues._id);
 

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <InputField
        name="name"
        label="Name"
        type="text"
        control={control}
        errors={errors}
      />
      <InputField
        name="email"
        label="Email"
        type="email"
        control={control}
        errors={errors}
      />
      <InputField
        name="phone"
        label="Phone"
        type="text"
        control={control}
        errors={errors}
      />
      <InputField
        name="address"
        label="Address"
        type="text"
        control={control}
        errors={errors}
      />

      {/* Password only shown in Add mode */}
      {!isEdit && (
        <InputField
          name="password"
          label="Password"
          type="password"
          control={control}
          errors={errors}
        />
      )}

      {/* Super Admin Right Dropdown */}
      {role === "superAdmin" && (
        <InputField
          name="superAdminRight"
          label="Super Admin Right"
          type="select"
          control={control}
          errors={errors}
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ]}
          mode="single"
        />
      )}

      <div className="col-span-full">
        <GradientButton type="submit">
          {isEdit ? "Update Employee" : "Add Employee"}
        </GradientButton>
      </div>
    </form>
  );
};

export default EmployeeForm;
