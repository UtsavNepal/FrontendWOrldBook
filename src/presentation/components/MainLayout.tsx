import React from "react";
import Navbar from "./Navabar";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen bg-gray-50">
    <Navbar />
    <main className="flex-1 min-h-screen max-h-screen overflow-y-auto">
      {children}
    </main>
  </div>
);

export default MainLayout; 