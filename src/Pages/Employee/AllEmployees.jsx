import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import DataTable from "react-data-table-component";
import toast from "react-hot-toast";

import{deleteEmployee,fetchEmployees} from "../../Redux/Empoloyee/employeeSlice";

import PageCount from "../../Common/PageCount";
import Heading from "../../Common/Heading";
import BackButton from "../../Common/fields/BackButton";
import { Plus } from "lucide-react";
import { tableStyle } from "../../Common/fields/tableStyle";
import { getEmployeeColumns } from "./getEmployeeColumns";
import GradientButton from "../../Common/GradientButton";
import GradientLoader from "../../Common/GradientLoader";
import DeleteConfirmAlert from "../../Common/DeleteConfirmAlert";

const AllEmployees = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.employeeMaster.employees);
  const isLoading = useSelector((state) => state.employeeMaster.loading); // ✅ from slice
  const role = useSelector((state) => state.auth.role);
  // console.log("role", role);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const handleDelete = async (row) => {
    const confirmed = await DeleteConfirmAlert({
      title: "Are you sure you want to delete this employee?",
      text: "This action cannot be undone.",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "No, cancel",
    });

    if (!confirmed) return;

    try {
      const res = await dispatch(deleteEmployee(row._id)).unwrap();
    } catch (err) {
      console.error(err?.message || "Delete failed");
    }
  };

  const handleRowClick = (row) => {
    navigate(`/${role}/edit-employee/${row._id}`, { state: row });
  };

  const safeEmployees = Array.isArray(employees) ? employees : [];

  const filteredEmployees = useMemo(() => {
    return safeEmployees.filter((emp) => {
      const name = emp?.name?.toLowerCase() || "";
      const mobile = emp?.phone?.toString().toLowerCase() || "";
      const term = searchTerm.toLowerCase();
      return name.includes(term) || mobile.includes(term);
    });
  }, [safeEmployees, searchTerm]);

  return (
    <PageCount>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <BackButton />
          <Heading text="All Employees" />
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full md:w-auto">
          {/* Search - Mobile full width */}
          <input
            type="text"
            placeholder="Search by name or mobile"
            className="px-3 py-[9px] w-full sm:w-[200px] text-sm rounded-md border focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: "var(--pink-soft)",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "var(--text-primary)",
              boxShadow: "0 1px 6px rgba(249, 168, 212, 0.08)",
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--purple-soft)";
              e.target.style.boxShadow = "0 0 0 3px rgba(165, 180, 252, 0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--pink-soft)";
              e.target.style.boxShadow = "0 1px 6px rgba(249, 168, 212, 0.08)";
            }}
          />

          {/* Add Button - Mobile full width */}
          <GradientButton
            onClick={() => navigate(`/${role}/add-employee`)}
            className="w-full sm:w-auto py-[9px] px-4 min-h-[38px]"
          >
            <Plus size={18} className="mr-1" />
            Add Employee
          </GradientButton>
        </div>
      </div>

      {/* 🌀 Loader */}
      {isLoading ? (
        <div className="flex justify-center py-12 min-h-[400px]">
          <GradientLoader size={40} />
        </div>
      ) : (
        <DataTable
          columns={getEmployeeColumns(handleDelete, role)}
          data={filteredEmployees}
          customStyles={tableStyle}
          pagination
          onRowClicked={handleRowClick}
          highlightOnHover
        />
      )}
    </PageCount>
  );
};

export default AllEmployees;
