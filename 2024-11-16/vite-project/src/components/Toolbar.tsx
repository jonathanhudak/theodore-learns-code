import React from "react";

const Toolbar = () => {
  return (
    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
      <h1
        className="text-lg font-bold text-gray-900 dark:text-white"
        aria-label="Game Title"
      >
        Game Title
      </h1>
      <div className="flex space-x-4">
        <button
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
          aria-label="Start Game"
        >
          Start
        </button>
        <button
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
          aria-label="Settings"
        >
          Settings
        </button>
        <button
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
          aria-label="Help"
        >
          Help
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
