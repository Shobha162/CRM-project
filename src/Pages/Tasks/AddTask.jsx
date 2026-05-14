import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTask } from "../../Redux/Task/taskSlice"; // ✅ real thunk
import { useNavigate } from "react-router-dom";
import TaskForm from "./TaskForm";
import PageCount from "../../Common/PageCount";
import Heading from "../../Common/Heading";
import BackButton from "../../Common/fields/BackButton";

const AddTask = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((state) => state.auth.role);
  const loading = useSelector((state) => state.taskMaster.loading);

  const handleAdd = async (data) => {
    try {
      const res = await dispatch(createTask(data));
      console.log("Task create success:", res);

      navigate(`/${role}/tasks`);
    } catch (err) {
      console.error("Task create error:", err);
    }
  };

  return (
    <PageCount>
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <Heading text="Add Task" />
      </div>
      <TaskForm onSubmit={handleAdd} isSubmitting={loading} />
    </PageCount>
  );
};

export default AddTask;
