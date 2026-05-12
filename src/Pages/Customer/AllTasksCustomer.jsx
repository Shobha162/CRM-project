import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { tableStyle } from "../../Common/fields/tableStyle";
import GradientLoader from "../../Common/GradientLoader";
import API from "../../utils/axiosInstance";
import { useParams } from "react-router-dom";

const columns = [
  {
    name: "Alert Date",
    selector: (row) =>
      row.alertDate ? new Date(row.alertDate).toLocaleDateString() : "—",
    sortable: true,
  },
  {
    name: "Alert Time",
    selector: (row) => row.alertTime || "—",
  },
  {
    name: "Status",
    selector: (row) => row.status || "—",
  },
  {
    name: "Note",
    selector: (row) => row.note || "—",
  },
];

const AllTasksCustomer = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [tasksData, setTasksData] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const res = await API.get(`/w-customer/getID/${id}`);
        const tasks = res.data?.tasks || [];

        // Only set if tasks exist
        if (tasks.length > 0) {
          setTasksData(
            tasks.map((t) => ({
              ...t,
              status: res.data?.data?.status || "—",
              customerName: res.data?.data?.names?.[0] || "—",
            }))
          );
        } else {
          setTasksData([]); // no tasks
        }
      } catch (err) {
        console.error("Error fetching tasks", err);
        setTasksData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [id]);

  // Hide if no tasks
  if (!loading && tasksData.length === 0) {
    return null;
  }

  return (
    <div style={{ padding: 20 }}>
      {loading ? (
        <div className="flex justify-center">
          <GradientLoader size={30} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tasksData}
          customStyles={tableStyle}
          pagination
          highlightOnHover
          responsive
          paginationPerPage={5}
          paginationRowsPerPageOptions={[5, 10, 15, 20]}
        />
      )}
    </div>
  );
};

export default AllTasksCustomer;
