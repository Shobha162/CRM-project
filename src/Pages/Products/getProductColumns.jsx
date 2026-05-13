// getProductColumns.js - Simplified + Image Clickable

import { Trash2 } from "lucide-react";
import API from "../../utils/axiosInstance";

export const getProductColumns = (handleDelete, images, role) => {
  const columns = [
    {
      name: "Image",
      selector: (row) => {
        const imageData = images?.[row.id];
        const blobUrl = imageData?.url;
        const serverUrl = row.imagePath
          ? `${API.defaults.baseURL}/${row.imagePath.replace(/\\\\/g, "/")}`
          : null;
        return blobUrl || serverUrl;
      },
      cell: (row) => {
        const imageData = images?.[row.id];
        const blobUrl = imageData?.url;
        const serverUrl = row.imagePath
          ? `${API.defaults.baseURL}/${row.imagePath.replace(/\\\\/g, "/")}`
          : null;
        const imageUrl = blobUrl || serverUrl;

        if (imageUrl) {
          return (
            <a href={imageUrl} target="_blank" rel="noopener noreferrer">
              <img
                src={imageUrl}
                alt="Product"
                className="w-12 h-12 rounded object-cover border hover:shadow-md cursor-pointer transition-shadow"
                loading="lazy"
              />
            </a>
          );
        }
        return <span className="text-gray-400 text-xs italic">No Image</span>;
      },
      width: "80px",
      center: true,
    },
    {
      name: "Description",
      selector: (row) => row.description?.replace(/<[^>]*>?/gm, "") || "",
      sortable: true,
    },
    {
      name: "HSN/UOM",
      selector: (row) => row.hsn || "",
      sortable: true,
    },
    {
      name: "UOM",
      selector: (row) => row.uom || "",
      sortable: true,
    },
    {
      name: "Rate",
      selector: (row) => parseFloat(row.price) || 0,
      sortable: true,
    },
  ];

  if (role === "superAdmin") {
    columns.push({
      name: "Actions",
      cell: (row) => (
        <button
            onClick={(e) => {
              e.stopPropagation();
             handleDelete (row);
            }}
            className="p-2 rounded-full border border-red-400 text-red-500 hover:bg-red-400 hover:text-white transition duration-150 ease-in-out"
          >
            <Trash2 className="w-4 h-4" />
          </button>
      ),
      width: "100px",
    });
  }

  return columns;
};
