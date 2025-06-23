import React from "react";

const DragHandle: React.FC = () => (
  <div className="drag-handle flex items-center justify-center w-6 bg-gray-800 rounded-l-lg cursor-move hover:bg-gray-700 transition-colors">
    <div className="flex flex-col space-y-0.5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="w-1 h-1 bg-gray-400 rounded-full" />
      ))}
    </div>
  </div>
);

export default DragHandle;
