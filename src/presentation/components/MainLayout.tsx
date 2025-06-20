import React from "react";
import Navbar from "./Navabar";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen min-w-screen bg-gray-50">
    <Navbar />
    <main className="flex-1 min-h-screen min-w-screen overflow-y-auto mt-16 md:mt-0 md:ml-56">
      {children}
    </main>
  </div>
);

export default MainLayout; 