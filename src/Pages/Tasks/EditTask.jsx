import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchTaskById, updateTaskById } from "../../Redux/Task/taskSlice";
import TaskForm from "./TaskForm";
import PageCount from "../../Common/PageCount";
import Heading from "../../Common/Heading";
import BackButton from "../../Common/fields/BackButton";
import GradientLoader from "../../Common/GradientLoader";

const EditTask = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((state) => state.auth.role);
  const task = useSelector((state) => state.taskMaster.selectedTask);
  const isLoading = useSelector((state) => state.taskMaster.loading); // optional loader state

  useEffect(() => {
    if (id) dispatch(fetchTaskById(id));
  }, [dispatch, id]);

  // EditTask.js
  const handleUpdate = async (updated) => {
    try {
      await dispatch(updateTaskById({ ...updated, id }));
      navigate(`/${role}/tasks`);
    } catch (err) {
      console.error("Task update error:", err);
    }
  };

  // ✅ Wait for task to load and have _id before showing form
  if (!task || !task._id) {
    return (
      <PageCount>
        <GradientLoader />
      </PageCount>
    );
  }

  const transformedTask = {
    ...task,
    customerName: task?.customerName?._id || "",
    customerPerson: task?.customerName?.names?.[0] || "",
    customerPhone: task?.customerName?.phones?.[0] || "",
  };
  console.log(transformedTask);

  return (
    <PageCount>
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <Heading text="Edit Task" />
      </div>
      <TaskForm
        defaultValues={transformedTask}
        onSubmit={handleUpdate}
        isLoading={isLoading}
      />
    </PageCount>
  );
};

export default EditTask;
