// src/pages/Login.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { setUserInfo } from "../utils/userInfo";
import { useNavigate } from "react-router-dom";
import type { LoginProps } from "../utils/types";

const Login = ({ onLoginSuccess }: LoginProps) => {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    alert("This service is not available.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setUserInfo(userName);
      onLoginSuccess(userName);
      navigate("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full text-center max-w-md p-8 bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl"
      >
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-10 tracking-tight"
        >
          Short Cutter
        </motion.h1>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`w-full py-3 px-6 bg-white text-gray-800 font-semibold text-lg rounded-xl shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-3
        ${loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
        `}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
            alt="Google logo"
            className="w-5 h-5"
          />
          Sign in with Google
        </motion.button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-700"></div>
          <span className="px-4 text-gray-400">OR</span>
          <div className="flex-grow h-px bg-gray-700"></div>
        </div>

        {/* Guest Login */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="userName"
            placeholder="What do we call you ?"
            value={userName}
            required
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-5 py-4 rounded-xl bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className={`w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-semibold text-lg shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300
          ${loading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
        `}
            disabled={loading}
          >
            {loading ? "Getting In..." : "Let's Go!"}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Login;
