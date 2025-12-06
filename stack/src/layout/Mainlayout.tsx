import Navbar from "@/components/Navbar";
import RightSideBar from "@/components/RightSideBar";
import Sidebar from "@/components/Sidebar";
import React, { ReactNode, useEffect, useState } from "react";

interface MainlayoutProps {
  children: ReactNode;
}

const Mainlayout = ({ children }: MainlayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, []);

  const handleslidein = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen((state) => !state);
    }
  };

  return (
    <div className="bg-[#f8f9fa] text-[#3a3a3a] min-h-screen">
      <Navbar handleslidein={handleslidein} />

      <div className="flex w-full pt-1">
        {/* Sidebar */}
        {/* Desktop: fixed left column; Mobile: slide-in using isopen */}
        <div className="hidden lg:block w-64 shrink-0">
          <Sidebar isopen={true} />
        </div>

        {/* Mobile sidebar overlay (if your Sidebar supports it) */}
        <div className="lg:hidden">
          <Sidebar isopen={sidebarOpen} />
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 lg:p-6 bg-white">
          {children}
        </main>

        {/* Right sidebar */}
        <div className="hidden lg:block w-72 shrink-0 border-l border-gray-200">
          <RightSideBar />
        </div>
      </div>
    </div>
  );
};

export default Mainlayout;
