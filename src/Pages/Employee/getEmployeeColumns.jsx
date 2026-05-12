// @material-tailwind/react ka Button hata diya —
// wo React 19 ke saath compatible nahi hai aur useContext hook
// react-data-table cell renderer (plain function) ke andar crash karta tha.
// Ab plain <button> use kar rahe hain jo bilkul same dikhega.

import { Trash2 } from "lucide-react";

export const getEmployeeColumns = (handleDelete, role) => [
  {
    name: "Name",
    selector: (row) =>
      typeof row.name === "string" ? row.name : JSON.stringify(row.name),
    sortable: true,
  },
  {
    name: "Email",
    selector: (row) =>
      typeof row.email === "string" ? row.email : JSON.stringify(row.email),
  },
  {
    name: "Phone",
    selector: (row) =>
      typeof row.phone === "string" ? row.phone : JSON.stringify(row.phone),
  },
  {
    name: "Address",
    selector: (row) =>
      typeof row.address === "string"
        ? row.address
        : JSON.stringify(row.address),
  },
  ...(role === "superAdmin"
    ? [
        {
          name: "Action",
          cell: (row) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
              className="p-2 rounded-full border border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition duration-150 ease-in-out cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ),
        },
      ]
    : []),
];