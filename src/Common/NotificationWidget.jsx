import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { setTaskData } from "../redux/task/taskSlice";

const NotificationWidget = () => {
  const dispatch = useDispatch();
  const { reminders } = useSelector((state) => state.taskMaster);

  const [visible, setVisible] = React.useState(true);
  const [minimizedMap, setMinimizedMap] = React.useState({});

  if (!visible || !Array.isArray(reminders) || reminders.length === 0)
    return null;

  const handleDismiss = (id) => {
    const updatedReminders = reminders.filter((r) => r.id !== id);
    dispatch(setTaskData({ reminders: updatedReminders }));

    setMinimizedMap((prev) => {
      const newMap = { ...prev };
      delete newMap[id];
      return newMap;
    });
  };

  const toggleMinimize = (id) => {
    setMinimizedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB");
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${String(hour12).padStart(2, "0")}:${String(m).padStart(
      2,
      "0",
    )} ${period}`;
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end gap-3 z-[999] max-w-[calc(100vw-2rem)] sm:max-w-none">
      <AnimatePresence>
        {reminders.map((reminder) => {
          const minimized = minimizedMap[reminder.id] || false;

          return (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full sm:w-[320px] md:w-[360px] rounded-2xl shadow-2xl overflow-hidden"
              style={{
                backgroundColor: "var(--color-backgroundMid)",
                border: "2px solid var(--pink-soft)",
              }}
            >
              {/* ✅ Header - Theme Colors */}
              <div
                className="flex justify-between items-center px-4 py-3 rounded-t-2xl"
                style={{
                  background: "var(--gradient-primary)",
                }}
              >
                <span className="font-semibold text-sm sm:text-base text-white flex items-center gap-2">
                  🔔 Task Reminder
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleMinimize(reminder.id)}
                    className="hover:bg-white/20 hover:scale-110 transition-all p-1.5 rounded-lg"
                    style={{ color: "white" }}
                  >
                    {minimized ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDismiss(reminder.id)}
                    className="hover:bg-white/20 hover:scale-110 transition-all p-1.5 rounded-lg"
                    style={{ color: "white" }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* ✅ Body - Theme Colors */}
              {!minimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 py-4 text-xs sm:text-sm rounded-b-2xl"
                  style={{
                    backgroundColor: "var(--color-backgroundMid)",
                    color: "var(--text-primary)",
                  }}
                >
                  <p className="mb-2 leading-relaxed">
                    <strong
                      className="font-semibold"
                      style={{ color: "var(--pink-soft)" }}
                    >
                      Message:
                    </strong>{" "}
                    <span style={{ color: "var(--text-primary)" }}>
                      You have an upcoming task!
                    </span>
                  </p>

                  <p className="mb-2 leading-relaxed">
                    <strong
                      className="font-semibold"
                      style={{ color: "var(--pink-soft)" }}
                    >
                      Customer:
                    </strong>{" "}
                    <span style={{ color: "var(--text-primary)" }}>
                      {reminder.customer?.names?.join(", ") || "-"}
                    </span>
                  </p>

                  <p className="mb-2 leading-relaxed">
                    <strong
                      className="font-semibold"
                      style={{ color: "var(--pink-soft)" }}
                    >
                      Alert Date:
                    </strong>{" "}
                    <span style={{ color: "var(--text-primary)" }}>
                      {reminder.alertDate
                        ? formatDate(reminder.alertDate)
                        : "-"}
                    </span>
                  </p>

                  <p className="mb-2 leading-relaxed">
                    <strong
                      className="font-semibold"
                      style={{ color: "var(--pink-soft)" }}
                    >
                      Alert Time:
                    </strong>{" "}
                    <span style={{ color: "var(--text-primary)" }}>
                      {formatTime(reminder.alertTime)}
                    </span>
                  </p>

                  <p className="leading-relaxed">
                    <strong
                      className="font-semibold"
                      style={{ color: "var(--pink-soft)" }}
                    >
                      Note:
                    </strong>{" "}
                    <span style={{ color: "var(--text-primary)" }}>
                      {reminder.note || "-"}
                    </span>
                  </p>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default NotificationWidget;
