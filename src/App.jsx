import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import toast, { Toaster } from "react-hot-toast";
import { lazy, Suspense, useEffect } from "react";
import { setUserFromToken } from "./Redux/Auth/authSlice";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import ProtectedRoute from "./Components/ProtectedRoute";
import DashboardLayout from "./Common/Layout/DashboardLayout";
import GradientLoader from "./Common/GradientLoader";
import { fetchTaskReminders } from "./Redux/Task/taskSlice";
import NotificationWidget from "./Components/NotificationWidget";

// 🔥 Lazy Load Pages
const Login = lazy(() => import("./Pages/Login"));
const Dashboard = lazy(() => import("./Pages/Dashboard/Dashboard"));
const AllEmployees = lazy(() => import("./Pages/Employee/AllEmployees"));
const AddEmployee = lazy(() => import("./Pages/Employee/AddEmployee"));
const EditEmployee = lazy(() => import("./Pages/Employee/EditEmployee"));
const AddCustomer = lazy(() => import("./Pages/Customer/AddCustomer"));
const AllCustomers = lazy(() => import("./Pages/Customer/AllCustomers"));
const EditCustomer = lazy(() => import("./Pages/Customer/EditCustomer"));
const AllProducts = lazy(() => import("./Pages/Products/AllProducts"));
const AddProduct = lazy(() => import("./Pages/Products/AddProduct"));
const EditProduct = lazy(() => import("./Pages/Products/EditProduct"));
const AllSupplier = lazy(() => import("./Pages/Supplier/AllSupplier"));
const AddSupplier = lazy(() => import("./Pages/Supplier/AddSupplier"));
const EditSupplier = lazy(() => import("./Pages/Supplier/EditSupplier"));
const AllTasks = lazy(() => import("./Pages/Tasks/AllTasks"));
const AddTask = lazy(() => import("./Pages/Tasks/AddTask"));
const EditTask = lazy(() => import("./Pages/Tasks/EditTask"));
const AllPurchaseOrders = lazy(() => import("./Pages/PurchaseOrder/AllPurchaseOrders"));
const CreatePurchaseOrder = lazy(() => import("./Pages/PurchaseOrder/CreatePurchaseOrder"));
const EditPurchaseOrder = lazy(() => import("./Pages/PurchaseOrder/EditPurchaseOrder"));

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ FIX: Primitive value select karo — object nahi
  // useSelector se poora `user` object lene par har render pe naya reference banta tha
  // isAuthenticated ek boolean hai — same value pe rerender nahi hoga
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // ✅ Token check on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          dispatch(setUserFromToken(token));
        } else {
          localStorage.removeItem("token");
          toast.error("Session expired. Please login again.");
          navigate("/login");
        }
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
        toast.error("Invalid session. Please login again.");
        navigate("/login");
      }
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    dispatch(fetchTaskReminders());

    const interval = setInterval(() => {
      dispatch(fetchTaskReminders());
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [dispatch, isAuthenticated]);

  return (
    <>
      <Toaster position="top-right" />
      <NotificationWidget />
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[700px]">
            <GradientLoader size={40} />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/:type" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Customers */}
              <Route path="customers" element={<AllCustomers />} />
              <Route path="add-customer" element={<AddCustomer />} />
              <Route path="edit-customer/:id" element={<EditCustomer />} />

              {/* Employees */}
              <Route path="employees" element={<AllEmployees />} />
              <Route path="add-employee" element={<AddEmployee />} />
              <Route path="edit-employee/:id" element={<EditEmployee />} />

              {/* Products */}
              <Route path="products" element={<AllProducts />} />
              <Route path="add-product" element={<AddProduct />} />
              <Route path="edit-product/:id" element={<EditProduct />} />

              {/* Suppliers */}
              <Route path="suppliers" element={<AllSupplier />} />
              <Route path="add-supplier" element={<AddSupplier />} />
              <Route path="edit-supplier/:id" element={<EditSupplier />} />

              {/* Tasks */}
              <Route path="tasks" element={<AllTasks />} />
              <Route path="add-task" element={<AddTask />} />
              <Route path="edit-task/:id" element={<EditTask />} />

               {/* Purchase Orders */}
              <Route path="purchase-order" element={<AllPurchaseOrders />} />
              <Route
                path="create-purchase-order"
                element={<CreatePurchaseOrder />}
              />
              <Route
                path="edit-purchase-order/:id"
                element={<EditPurchaseOrder />}
              />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;