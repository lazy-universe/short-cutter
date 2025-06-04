// src/App.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { logout } from "../utils/logout";
import FormInputs from "../components/InputHandler";
import ResponseMessage from "../components/ResponseMsg";
import type { ResponseData } from "../utils/types";
import type { FormValues } from "../utils/types";
import { getUserInfo } from "../utils/userInfo";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [youtubeURL, setYoutubeURL] = useState("");
  const [urlError, setUrlError] = useState("");
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const { userName } = getUserInfo();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(
    localStorage.getItem("progressError")
  );
  const [responseMsg, setResponseMsg] = useState<ResponseData | null>(() => {
    const stored = localStorage.getItem("responseMsg");
    return stored ? (JSON.parse(stored) as ResponseData) : null;
  });

  const handleFormChange = (values: FormValues) => {
    setFormValues(values);
  };

  const isValidYouTubeURL = (url: string) => {
    const regex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]{11}/;
    return regex.test(url.trim());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (urlError) {
      alert("Fix errors before submitting.");
      return;
    }

    if (responseMsg) {
      const result = confirm("Are you sure ?");
      if (!result) return;
    }

    localStorage.removeItem("yt-logs");
    setLoading(true);
    setError("Fetching data...");
    setResponseMsg(null);
    setYoutubeURL(youtubeURL.trim());

    try {
      const res = await fetch(`/api/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtube_url: youtubeURL,
          quality: formValues?.quality,
          locally_cached: formValues?.cache,
          keywords: formValues?.highlightKeyword,
          clip_count: Math.min(formValues?.clipCount || 4, 10),
          clip_duration: Math.min(formValues?.maxDuration || 40, 100),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data.message || data.error || "Unknown error occurred.";
        throw new Error(message);
      }

      setResponseMsg(data);
      setError(
        `Data fetched successfully 🔰\nTotal time taken by the server to respond: ${data.time_taken}`
      );
      localStorage.setItem("responseMsg", JSON.stringify(data));
      localStorage.setItem(
        "progressError",
        "Here is your cached Data 🔰\nNOTE: If videos are not playable servers might be down"
      );
    } catch (err) {
      setError("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${
        darkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-white to-gray-100"
      } min-h-screen p-4 md:p-8 transition-all duration-500 ease-in-out`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="backdrop-blur-md bg-white/10 p-6 md:p-8 rounded-2xl shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <motion.h1
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              className="leading-relaxed text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
            >
              Hey, {userName || "Buddy"}!
            </motion.h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-full cursor-pointer text-sm font-medium transition-all duration-300 ${
                darkMode
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900"
                  : "bg-gradient-to-r from-gray-800 to-gray-900 text-white"
              }`}
            >
              {darkMode ? "Switch to Light" : "Switch to Dark"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => logout(navigate)}
              className="px-4 py-2 rounded-full cursor-pointer text-sm font-medium bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md hover:from-red-600 hover:to-pink-700 transition-all duration-300"
            >
              Logout
            </motion.button>
          </div>

          <motion.form onSubmit={handleSubmit} className="space-y-6 ">
            <div className="relative">
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
                type="text"
                placeholder="Paste YouTube URL here..."
                value={youtubeURL}
                onChange={(e) => setYoutubeURL(e.target.value)}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (!isValidYouTubeURL(value)) {
                    setUrlError("Please enter a valid YouTube URL.");
                  } else {
                    setUrlError("");
                  }
                }}
                className={`w-full p-4 rounded-xl border focus:outline-none transition-all duration-200 ${
                  urlError
                    ? "border-red-500 text-white"
                    : darkMode
                    ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                    : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                }`}
                required
              />
              {urlError && (
                <p className="mt-1 text-sm text-red-500">{urlError}</p>
              )}
            </div>
            <FormInputs darkMode={darkMode} onChange={handleFormChange} />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full md:w-auto cursor-pointer px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Download"}
            </motion.button>
          </motion.form>

          <ResponseMessage
            error={error}
            darkMode={darkMode}
            responseMsg={responseMsg}
            loading={loading}
          />
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;
