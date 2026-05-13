import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  UserCircle,
  Package,
  ClipboardList,
  FileText,
  UserRound,
  StoreIcon,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "../Redux/Auth/authSlice";
import { jwtDecode } from "jwt-decode";

const Sidebar = ({
  isMobileOpen,
  toggleSidebar,
  isCollapsed,
  setIsCollapsed,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const rawRole = useSelector((state) => state.auth.role);
  const role = rawRole?.toLowerCase();

  const token = useSelector((state) => state.auth.token);
  const foundUser = token ? jwtDecode(token) : null;

  const superAdminRight = foundUser?.superAdminRight;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const roleMenus = {
    superadmin: [
      {
        to: `/${role}/dashboard`,
        icon: <LayoutDashboard size={20} />,
        text: "Dashboard",
      },

      {
        to: `/${role}/customers`,
        icon: <UserCircle size={20} />,
        text: "Customers",
      },
      {
        to: `/${role}/employees`,
        icon: <UserRound size={20} />,
        text: "Employee",
      },
      { to: `/${role}/products`, 
      icon: <Package size={18} />, 
      text: "Product" },
      {
        to: `/${role}/suppliers`,
        icon: <StoreIcon size={18} />,
        text: "Supplier",
      },
      
    ],

    user: [
      {
        to: `/${role}/dashboard`,
        icon: <LayoutDashboard size={20} />,
        text: "Dashboard",
      },

      {
        to: `/${role}/customers`,
        icon: <UserCircle size={20} />,
        text: "Customers",
      },
       { to: `/${role}/products`,
        icon: <Package size={18} />,
         text: "Product" },

      ...(superAdminRight
        ? [
            {
              to: `/${role}/suppliers`,
              icon: <StoreIcon size={20} />,
              text: "Supplier",
            },
          ]
        : []),


      {
        to: `/${role}/employees`,
        icon: <UserRound size={20} />,
        text: "Employee",
      },
    ],

    client: [
      {
        to: `/${role}/dashboard`,
        icon: <LayoutDashboard size={20} />,
        text: "Dashboard",
      },

      {
        to: `/${role}/quotations`,
        icon: <FileText size={20} />,
        text: "Quotations",
      },

      {
        to: `/${role}/orders`,
        icon: <Package size={20} />,
        text: "My Orders",
      },
    ],
  };

  const menuItems = roleMenus[role] || [];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && isMobile && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => toggleSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className="fixed h-screen flex flex-col shadow-2xl transition-all duration-300 z-50"
        style={{
          background:
            "linear-gradient(180deg, #0a1a0e 0%, #0f2010 60%, #111a0a 100%)",

          width: isCollapsed ? "4rem" : "14rem",

          left: isMobile ? (isMobileOpen ? "0" : "-15rem") : "0",

          borderRight: "1px solid var(--pink-soft)",
        }}
      >
        {/* Mobile Close Button */}
        {isMobile && isMobileOpen && (
          <button
            className="absolute top-3 right-3"
            style={{
              color: "var(--purple-soft)",
            }}
            onClick={() => toggleSidebar(false)}
          >
            <X size={20} />
          </button>
        )}

        {/* Desktop Collapse Button */}
        {!isMobile && (
          <button
            className="absolute top-5 -right-4 z-50 p-2 rounded-full shadow-lg transition-all duration-200"
            style={{
              background:
                "linear-gradient(135deg, var(--pink-soft), var(--purple-soft))",

              color: "#fff",

              border: "2px solid white",

              cursor: "pointer",

              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            }}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        )}

        {/* Divider */}
        <hr
          style={{
            borderColor: "var(--pink-soft)",
            opacity: 0.25,
            marginTop: "4rem",
          }}
        />

        {/* Navigation */}
        <ul className="space-y-1 flex-1 px-2 pt-4 overflow-y-auto overflow-x-visible">
          {menuItems.map(({ to, icon, text }) => (
            <NavItem
              key={to}
              to={to}
              icon={icon}
              text={text}
              isCollapsed={isCollapsed}
              isMobile={isMobile}
              toggleSidebar={toggleSidebar}
            />
          ))}
        </ul>

        {/* Bottom Divider */}
        <hr
          style={{
            borderColor: "var(--pink-soft)",
            opacity: 0.25,
          }}
        />

        {/* Logout */}
        <div className="mt-auto mb-4 px-2">
          <button
            className="flex items-center p-3 rounded-md transition-all duration-150 w-full"
            onClick={() => {
              dispatch(logout());
              navigate("/");
            }}
            style={{
              background:
                "linear-gradient(135deg, var(--pink-soft), var(--purple-soft))",

              color: "#ffffff",

              cursor: "pointer",

              fontWeight: 600,

              letterSpacing: "0.3px",

              boxShadow: "0 4px 12px rgba(5, 117, 97, 0.35)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.88";

              e.currentTarget.style.boxShadow =
                "0 6px 18px rgba(5, 117, 97, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";

              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(5, 117, 97, 0.35)";
            }}
          >
            <LogOut size={20} />

            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

const NavItem = ({
  to,
  icon,
  text,
  isCollapsed,
  isMobile,
  toggleSidebar,
}) => {
  const handleClick = () => {
    if (isMobile) {
      setTimeout(() => toggleSidebar(false), 100);
    }
  };

  return (
    <NavLink
      to={to}
      onClick={handleClick}
      className={({ isActive }) =>
        `group relative flex items-center font-medium p-3 rounded-md transition-all duration-150 text-sm ${
          isActive ? "text-white shadow-md" : "bg-transparent"
        }`
      }
      style={({ isActive }) =>
        isActive
          ? {
              background:
                "linear-gradient(to right, var(--pink-soft), var(--purple-soft))",

              borderLeft: "4px solid var(--purple-soft)",

              color: "white",

              paddingLeft: "8px",
            }
          : {
              color: "#a8c4a0",

              borderLeft: "4px solid transparent",
            }
      }
      onMouseEnter={(e) => {
        const hasGradient =
          e.currentTarget.style.background.includes("gradient");

        if (!hasGradient) {
          e.currentTarget.style.backgroundColor = "rgba(5,117,97,0.18)";
          e.currentTarget.style.color = "#ffffff";
        }
      }}
      onMouseLeave={(e) => {
        const hasGradient =
          e.currentTarget.style.background.includes("gradient");

        if (!hasGradient) {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "#64885aff";
        }
      }}
    >
      <div className="w-5 text-inherit shrink-0">{icon}</div>

      {!isCollapsed && <span className="ml-3 truncate">{text}</span>}

      {/* Tooltip */}
      {isCollapsed && (
        <div
          className="absolute left-full ml-3 px-2 py-1 text-sm rounded-md shadow-md
          opacity-0 scale-95 transition-all duration-200
          group-hover:opacity-100 group-hover:scale-100 whitespace-nowrap z-50"
          style={{
            background:
              "linear-gradient(135deg, var(--pink-soft), var(--purple-soft))",

            color: "#ffffff",

            border: "1px solid var(--purple-soft)",
          }}
        >
          {text}
        </div>
      )}
    </NavLink>
  );
};

export default Sidebar;