import { ReactNode, useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Navigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export const Layout = ({ children, requireAuth = true }: LayoutProps) => {
  const { user, isLoading } = useAuth();
  const { darkMode } = useTheme();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const onSidebarCollapseChange = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 bg-primary rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-24 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" />;
  }

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className={cn(
      "flex min-h-screen bg-background",
      darkMode && "dark bg-slate-900 text-white"
    )}>
      <Sidebar 
        isOpen={sidebarOpen} 
        onCollapseChange={onSidebarCollapseChange} 
      />
      
      <div 
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          sidebarOpen && !isMobile 
            ? (sidebarCollapsed 
                ? "ml-16" 
                : "ml-64")
            : "ml-0",
          darkMode ? "bg-slate-900" : "bg-background"
        )}
      >
        <Header 
          toggleSidebar={toggleSidebar} 
          sidebarCollapsed={sidebarCollapsed} 
        />
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
