import React from "react";

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center h-40">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

export default Spinner; 

export const SpinnerOverlay = () => (
    <div className="fixed inset-0 bg-white bg-opacity-60 flex items-center justify-center z-50">
      <Spinner />
    </div>
  );
