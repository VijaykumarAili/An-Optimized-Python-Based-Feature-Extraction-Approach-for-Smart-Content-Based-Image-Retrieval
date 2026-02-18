import { motion } from "framer-motion";
// ❌ Remove LucideIcon import — it doesn't exist
// ✅ Import icons directly or accept them as props
import React from "react";

const StatsCard = ({ title, value, icon: Icon, color = "primary" }) => {
  const colorClasses = {
    primary:
      "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400",
    green:
      "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    purple:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
            {value}
          </p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon size={24} /> {/* ✅ icon prop passed in from parent */}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
