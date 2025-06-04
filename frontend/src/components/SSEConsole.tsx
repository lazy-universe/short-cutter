// src/components/SSEConsole.tsx
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SSEConsoleProps } from "../utils/types";

const SSEConsole = ({ darkMode, loading }: SSEConsoleProps) => {
  const [topPosition, setTopPosition] = useState(
    window.scrollY + window.innerHeight / 2
  );
  const [showLogs, setShowLogs] = useState(false);
  const [latestMessages, setLatestMessages] = useState<string[]>([]);
  const [messages, setMessages] = useState<string[]>(() => {
    const saved = localStorage.getItem("yt-logs");
    return saved ? JSON.parse(saved) : [];
  });

  const logsRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (msgRef.current) {
      msgRef.current.scrollTo({
        top: msgRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [latestMessages]);

  useEffect(() => {
    if (!showLogs) return;

    const timeout = setTimeout(() => {
      if (logsRef.current) {
        logsRef.current.scrollTo({
          top: logsRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 300); // Delay to wait for animation (~200ms transition)

    return () => clearTimeout(timeout);
  }, [showLogs, messages]);

  useEffect(() => {
    function handleScroll() {
      setTopPosition(window.scrollY + window.innerHeight / 2);
    }
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll); // update on resize too

    // Initialize
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        logsRef.current &&
        !logsRef.current.contains(target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(target) // ✅ exclude button
      ) {
        setShowLogs(false);
      }
    }

    if (showLogs) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLogs]);

  useEffect(() => {
    if (!loading) return setLatestMessages([]);

    const eventSource = new EventSource(`/api/events`);

    eventSource.onmessage = (event) => {
      const timestamp = new Date().toLocaleTimeString();
      const logWithTimestamp = `[${timestamp}] ${event.data}`;

      setLatestMessages((prev) => [...prev, event.data + "\n"]);
      setMessages((prev) => {
        const updated = [...prev, logWithTimestamp + "\n"];
        localStorage.setItem("yt-logs", JSON.stringify(updated));
        return updated;
      });
    };

    eventSource.onerror = () => {
      const errorMsg = "[ERROR] SSE connection lost.";
      console.error("❌", errorMsg);

      setLatestMessages((prev) => [...prev, errorMsg]);
      setMessages((prev) => {
        const updated = [...prev, errorMsg];
        localStorage.setItem("yt-logs", JSON.stringify(updated));
        return updated;
      });
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setLatestMessages([]);
    };
  }, [loading]);

  const clearLogs = () => {
    const result = confirm("Are you sure you want to clear all logs?");
    if (!result) return;
    setMessages([]);
    localStorage.removeItem("yt-logs");
  };

  const getColorClass = (msg: string) => {
    if (msg.includes("[INFO]")) return "text-blue-400";
    if (msg.includes("[WARN]")) return "text-yellow-400";
    if (msg.includes("[ERROR]")) return "text-red-500";
    if (msg.includes("[DONE]")) return "text-green-500";
    if (msg.includes("[PROGRESS]")) return "text-green-300";
    if (msg.includes("[FALLBACK]")) return "text-orange-400";
    if (msg.includes("[DEV]")) return "text-purple-600";
    return darkMode ? "text-gray-300" : "text-gray-700";
  };

  return (
    <>
      <div className="w-full flex justify-end">
        <motion.button
          ref={toggleBtnRef}
          onClick={() => setShowLogs((prev) => !prev)}
          whileHover={{ scale: 1.05 }}
          className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg shadow-lg z-50"
        >
          {showLogs ? "Hide Logs" : "Show Logs"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showLogs && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{top: topPosition}}
            className={`absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 
        w-full max-w-md max-h-[60vh] rounded-xl shadow-2xl z-50 border
        ${
          darkMode
            ? "bg-gray-900 text-white border-gray-700"
            : "bg-white text-gray-800 border-gray-300"
        }`}
          >
            {/* Sticky Header */}
            <div className="flex justify-between items-center px-4 pt-3 pb-2 border-b text-sm font-semibold sticky top-0 z-10 bg-inherit">
              <span>Logs</span>
              <button
                onClick={clearLogs}
                className={`text-xs cursor-pointer hover:underline ${
                  darkMode ? "text-red-400" : "text-red-600"
                }`}
              >
                Clear
              </button>
            </div>

            {/* Scrollable content */}
            <div
              ref={logsRef}
              className="px-4 py-3 space-y-2 text-sm font-mono truncate overflow-y-auto max-h-[50vh]"
            >
              {messages.length > 0 ? (
                messages.map((msg, idx) => (
                  <pre
                    key={idx}
                    className={`whitespace-pre-wrap ${getColorClass(msg)}`}
                  >
                    {msg}
                  </pre>
                ))
              ) : (
                <p
                  className={`italic ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  No logs yet.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {latestMessages.length > 0 && (
        <div
          ref={msgRef}
          className={`${
            darkMode
              ? "bg-gray-800/50 text-gray-200"
              : "bg-white/50 text-gray-800"
          } p-4 mt-4 max-h-60 overflow-auto rounded-xl font-mono text-sm whitespace-pre-wrap`}
        >
          {latestMessages.map((msg, index) => (
            <span key={index} className={getColorClass(msg)}>
              {msg}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default SSEConsole;
