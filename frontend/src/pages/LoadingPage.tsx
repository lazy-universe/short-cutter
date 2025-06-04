// src/components/LoadingPage.tsx
import { motion, useCycle } from "framer-motion";
import { useEffect } from "react";

const LoadingPage = () => {
  const [dots, cycleDots] = useCycle("", ".", "..", "...");
  const lines = [
    { text: "> Booting system...", color: "text-indigo-400" },
    { text: "> Initializing Short Cutter engine...", color: "text-purple-400" },
    { text: "> Establishing shortcut protocols...", color: "text-indigo-300" },
    { text: "✔️ System ready.", color: "text-green-400" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      cycleDots();
    }, 300);
    return () => clearInterval(interval); //  Cleanup 
  }, [cycleDots]);

  return (
    <div className="h-screen overflow-hidden flex flex-col items-center justify-center px-6 bg-gradient-to-b from-gray-900 to-gray-800 font-mono select-none">
      {/* Shared Wrapper for Consistent Alignment */}
      <div className="w-full max-w-md flex flex-col space-y-1 mb-10">
        {lines.map(({ text, color }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2, duration: 0.2, ease: "easeOut" }}
            className={`whitespace-pre ${color} text-base md:text-lg font-semibold`}
          >
            {text}
          </motion.div>
        ))}

        {/* Final line sits in same container now for perfect alignment */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2 + lines.length * 0.2,
            duration: 0.3,
            ease: "easeOut",
          }}
          className="text-lg md:text-xl lg:text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent tracking-tight mt-4"
        >
          Getting things done faster{dots}
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingPage;
