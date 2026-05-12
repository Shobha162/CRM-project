import React from "react";
import { useDispatch, useSelector } from "react-redux";
import{addEmployee} from "../../Redux/Empoloyee/employeeSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PageCount from "../../Common/PageCount";
import Heading from "../../Common/Heading";
import BackButton from "../../Common/fields/BackButton";
import EmployeeForm from "./EmployeeForm";

const AddEmployee = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((state) => state.auth.role);

  const handleAdd = async (data) => {
    try {
      const payload = {
        ...data,
        role: "user",
      };
      await dispatch(addEmployee(payload)).unwrap();
      navigate(`/${role}/employees`);
    } catch (err) {
      console.error("Add failed: " + err);
    }
  };

  return (
    <PageCount>
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <Heading text="Add Employee" />
      </div>
      <EmployeeForm onSubmit={handleAdd} defaultValues={{}} />
    </PageCount>
  );
};

export default AddEmployee;
