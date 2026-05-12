import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateEmployee,
  changePassword,
} from "../../Redux/Empoloyee/employeeSlice";
import { data, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import EmployeeForm from "./EmployeeForm";
import PageCount from "../../Common/PageCount";
import Heading from "../../Common/Heading";
import BackButton from "../../Common/fields/BackButton";
import ChangePasswordForm from "./ChangePassowrdForm";

const EditEmployee = () => {
  const { state: currentData } = useLocation();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((state) => state.auth.role);

  if (!currentData) {
    return (
      <PageCount>
        <Heading text="Employee not found!" />
      </PageCount>
    );
  }

  const handleUpdate = async (data) => {
    try {
      await dispatch(
        updateEmployee({ ...data, id: data._id })
      ).unwrap();
      navigate(`/${role}/employees`);
    } catch (err) {
      console.error("Update failed: " + err);
    }
  };

  const onChangePass = async ({ id, newPassword }) => {
    try {
      await dispatch(changePassword({ id, newPassword })).unwrap();
    } catch (err) {
      console.error("Password update failed: " + err);
    }
  };

  return (
    <PageCount>
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <Heading text="Edit Employee" />
      </div>
      <EmployeeForm defaultValues={currentData} onSubmit={handleUpdate} role={role} />
      {role === "superAdmin" && (
        <ChangePasswordForm
          employeeId={currentData._id}
          onChangePass={onChangePass}
        />
      )}
    </PageCount>
  );
};

export default EditEmployee;
