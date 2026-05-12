import  { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
// import logo from "../../assets/logo.png";
import { Menu } from "lucide-react";

const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex w-full min-h-screen ">
      {/* Sidebar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        toggleSidebar={(val) => setIsMobileOpen(val)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Mobile overlay */}
      {isMobileOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          !isMobile ? (isCollapsed ? "ml-[4rem]" : "ml-[14rem]") : "ml-0"
        } flex-1 w-0`}
      >
        {/* Mobile Top Navbar */}
        {isMobile && (
          <div className="md:hidden flex items-center justify-between px-4 sm:px-6 py-3 bg-white shadow-md sticky top-0 z-30">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="text-gray-800 focus:outline-none"
            >
              <Menu size={24} />
            </button>
          </div>
        )}

        {/* Routed children */}
        <div className="flex-1 px-4 sm:px-6 py-4 w-full max-w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;