import Loader from "./Loader";
import SSEConsole from "./SSEConsole";
import { motion, AnimatePresence } from "framer-motion";
import type { ResponseMsgProps } from "../utils/types";

const ResponseMessage = ({
  error,
  darkMode,
  responseMsg,
  loading,
}: ResponseMsgProps) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        {error && (
          <div
            className={`p-4 rounded-xl mb-4 ${
              darkMode ? "bg-gray-800/50" : "bg-white/50"
            }`}
          >
            <p className="text-green-500 whitespace-pre-wrap">{error}</p>
          </div>
        )}
        <SSEConsole darkMode={darkMode} loading={loading} />
      </motion.div>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mt-8"
        >
          <Loader />
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-6"
        >
          {responseMsg && "videos" in responseMsg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-6 rounded-xl ${
                darkMode ? "bg-gray-800/50" : "bg-white/50"
              }`}
            >
              <h3 className="text-lg text-gray-50 font-semibold mb-4">
                Long press to download clips:{" "}
              </h3>
              <div className="flex flex-wrap gap-4 overflow-y-auto px-1">
                {responseMsg.videos.map((url, index) => {
                  const meta = responseMsg.timestamp?.[index];
                  return (
                    <div
                      key={index}
                      className="flex-[1_1_250px] text-white shrink-0 space-y-4"
                    >
                      <video
                        controls
                        className="w-full rounded-lg h-[60vh] object-cover"
                      >
                        <source src={url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>

                      {/* Metadata Panel */}
                      <div
                        className={`p-4 rounded-lg ${
                          darkMode ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        <h4 className="text-base font-semibold">
                          {meta?.title}
                        </h4>
                        <p className="text-sm italic text-gray-400">
                          {meta?.mood}
                        </p>
                        <p className="text-sm text-gray-200">
                          {meta?.description}
                        </p>

                        {meta?.tags && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {meta.tags.map((tag, tagIdx) => (
                              <span
                                key={tagIdx}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {meta?.hook && (
                          <p className="mt-2 text-sm font-medium text-indigo-500">
                            Hook: {meta.hook}
                          </p>
                        )}
                      </div>

                      {/* Optional download of metadata as JSON */}
                      <a
                        href={`data:text/json;charset=utf-8,${encodeURIComponent(
                          JSON.stringify(meta, null, 2)
                        )}`}
                        download={`clip_${index + 1}_meta.json`}
                        className="text-sm text-blue-600 underline"
                      >
                        Download Clip Metadata
                      </a>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {responseMsg &&
            "status" in responseMsg &&
            responseMsg.status !== "error" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-6 rounded-xl ${
                  darkMode ? "bg-gray-800/50" : "bg-white/50"
                }`}
              >
                <h3 className="text-yellow-500 font-bold mb-2">
                  Fallback mode triggered
                </h3>
                <pre className="whitespace-pre-wrap text-sm text-gray-300">
                  {responseMsg.content}
                </pre>
              </motion.div>
            )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResponseMessage;
