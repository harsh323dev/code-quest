import { cn } from "@/lib/utils";
import {
  Globe,
  Home,
  MessageSquareIcon,
  Tag,
  Users,
  CreditCard // ✅ Your new icon
} from "lucide-react";
import Link from "next/link";
import React from "react";

const Sidebar = ({ isopen }: any) => {
  return (
    <div>
      <aside
        className={cn(
          "fixed left-0 top-[53px] z-40 w-48 lg:w-64 min-h-[calc(100vh-53px)] bg-white shadow-sm border-r transition-transform duration-200 ease-in-out md:translate-x-0",
          isopen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="p-2 lg:p-4 overflow-y-auto h-full">
          <ul className="space-y-1">
            <li>
              <Link href="/" className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm">
                <Home className="w-4 h-4 mr-2 lg:mr-3" /> Home
              </Link>
            </li>
            <li>
              <Link href="/public-space" className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm">
                <Globe className="w-4 h-4 mr-2 lg:mr-3 text-orange-500" /> Public Space
              </Link>
            </li>
            
            {/* ✅ Subscription Link */}
            <li>
              <Link href="/subscription" className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm font-semibold text-blue-600">
                <CreditCard className="w-4 h-4 mr-2 lg:mr-3" /> 
                Plans & Pricing
              </Link>
            </li>

            <li>
              <Link href="/questions" className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm">
                <MessageSquareIcon className="w-4 h-4 mr-2 lg:mr-3" /> Questions
              </Link>
            </li>
            <li>
              <Link href="/tags" className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm">
                <Tag className="w-4 h-4 mr-2 lg:mr-3" /> Tags
              </Link>
            </li>
            <li>
              <Link href="/users" className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm">
                <Users className="w-4 h-4 mr-2 lg:mr-3" /> Users
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;