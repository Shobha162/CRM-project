import React, { useEffect } from "react";
import InputField from "../../Common/fields/InputField";
import { useForm } from "react-hook-form";
import GradientButton from "../../Common/GradientButton";
import { useDispatch, useSelector } from "react-redux";
import GradientLoader from "../../Common/GradientLoader";
import { fetchCustomers } from "../../Redux/Customer/customerSlice";

const TaskForm = ({
  onSubmit,
  defaultValues = {},
  isLoading = false,
  isSubmitting = false,
}) => {
  const isEdit = !!defaultValues._id;
  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm({ defaultValues, mode: "onChange" });

  const dispatch = useDispatch();
  const customers = useSelector((state) => state.customerMaster.customers);
  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const customerOptions = customers.map((c) => ({
    value: c._id,
    label: c.names?.[0] || "Unnamed Customer",
  }));

  const selectedCustomerId = watch("customerName");
  const selectedCustomer = customers.find((c) => c._id === selectedCustomerId);

  const nameOptions =
    selectedCustomer?.names?.map((n) => ({
      value: n,
      label: n,
    })) || [];

  const phoneOptions =
    selectedCustomer?.phones?.map((p) => ({
      value: p,
      label: p,
    })) || [];

  if (isLoading) return <GradientLoader size={20} />;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <InputField
        name="customerName"
        label="Customer"
        type="select"
        mode="single"
        control={control}
        errors={errors}
        options={customerOptions}
      />

      {selectedCustomer && (
        <InputField
          name="customerPerson"
          label="Person Name"
          type="select"
          mode="single"
          control={control}
          errors={errors}
          options={nameOptions}
        />
      )}

      {selectedCustomer && (
        <InputField
          name="customerPhone"
          label="Phone Number"
          type="select"
          mode="single"
          control={control}
          errors={errors}
          options={phoneOptions}
        />
      )}

      <InputField
        name="alertDate"
        label="Alert Date"
        type="date"
        control={control}
        errors={errors}
        rules={{
          required: "Alert date is required",
          validate: (value) => {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return selectedDate > today || "Please select a future date";
          },
        }}
      />

      <InputField
        name="alertTime"
        label="Alert Time"
        type="time"
        control={control}
        errors={errors}
      />

      <div className="col-span-full">
        <InputField
          name="note"
          label="Note"
          type="description"
          control={control}
          errors={errors}
          rows={3}
        />
      </div>

      {/* New Type Dropdown */}
      <InputField
        name="type"
        label="Type"
        type="select"
        mode="single"
        control={control}
        errors={errors}
        options={[
          { value: "Quotation", label: "Quotation" },
          { value: "Normal", label: "Normal" },
        ]}
        rules={{
          required: "Please select a type",
        }}
      />

      <div className="col-span-full">
        <GradientButton
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2"
        >
          {isSubmitting && (
            <span className="w-4 h-4">
              <GradientLoader size={16} />
            </span>
          )}
          {isEdit ? "Update Task" : "Add Task"}
        </GradientButton>
      </div>
    </form>
  );
};

export default TaskForm;
