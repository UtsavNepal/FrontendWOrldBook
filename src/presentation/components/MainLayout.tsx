import React from "react";
import Navbar from "./Navabar";
import ChatDock from "./ChatDock";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen bg-wb-canvas">
    <Navbar />
    <main className="min-h-screen min-w-0 flex-1 overflow-y-auto pt-14 md:ml-64">
      {children}
    </main>
    <ChatDock />
  </div>
);

export default MainLayout;
