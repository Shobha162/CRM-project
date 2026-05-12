import { Trash2 } from "lucide-react";

export const getCustomerColumns = (handleDeleteClick, role) => {
  const columns = [
    {
      name: "Name of the Party",
      selector: (row) =>
        Array.isArray(row.names) ? row.names.join(", ") : "-",
      sortable: true,
      width: "220px",
    },

    {
      name: "Phone No",
      selector: (row) =>
        Array.isArray(row.phones) ? row.phones.join(", ") : "-",
      width: "180px",
    },

    {
      name: "Source",
      selector: (row) => row.status || "-",
      sortable: true,
      width: "150px",
    },

    {
      name: "Email",
      selector: (row) =>
        Array.isArray(row.emails) ? row.emails.join(", ") : "-",
      sortable: true,
      width: "250px",
    },

    {
      name: "Created By",
      selector: (row) => row.createdBy?.name || "-",
      sortable: true,
      width: "180px",
    },

    {
      name: "Address",
      selector: (row) =>
        Array.isArray(row.addresses)
          ? row.addresses
              .map((a) => a.address?.replace(/<[^>]*>?/gm, ""))
              .filter(Boolean)
              .join(", ")
          : "-",
      width: "300px",
    },

    {
      name: "Actions",

      cell: (row) => (
        <div className="flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
            className="p-2 rounded-full border border-red-400 text-red-500 hover:bg-red-400 hover:text-white transition duration-150 ease-in-out"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),

      ignoreRowClick: true,
      width: "120px",
    },
  ];

  return columns;
};