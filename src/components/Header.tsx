import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { LogOut, Menu, ChevronRight, ChevronLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface HeaderProps {
  toggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export const Header = ({ toggleSidebar, sidebarCollapsed }: HeaderProps) => {
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const isMobile = useIsMobile();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
  };

  return (
    <header className={cn(
      "shadow-sm border-b px-4 py-3 sticky top-0 z-10",
      darkMode 
        ? "bg-slate-800 border-slate-700 text-white" 
        : "bg-white border-slate-200"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {toggleSidebar && (isMobile || !isMobile) && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9",
                darkMode && "hover:bg-slate-700 text-white"
              )}
              onClick={toggleSidebar}
            >
              {isMobile ? (
                <Menu size={20} />
              ) : (
                sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />
              )}
            </Button>
          )}
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg text-primary hidden sm:inline-block"> SISTEMA DE SOLICITAÇÃO</span>
            <span className="font-bold text-lg text-primary sm:hidden">SA2HUB</span>
          </Link>
        </div>

        {user && (
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowDropdown(!showDropdown)}
              className={cn(
                "flex items-center space-x-2",
                darkMode && "hover:bg-slate-700 text-white"
              )}
            >
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0)}
              </div>
              <span className="hidden sm:inline-block">{user.name}</span>
            </Button>

            {showDropdown && (
              <div className={cn(
                "absolute right-0 mt-2 w-48 border rounded-md shadow-lg z-50 animate-fade-in",
                darkMode 
                  ? "bg-slate-800 border-slate-700" 
                  : "bg-white border-slate-200"
              )}>
                <div className={cn(
                  "p-3 border-b",
                  darkMode ? "border-slate-700" : "border-slate-200"
                )}>
                  <p className="font-medium">{user.name}</p>
                  <p className={cn(
                    "text-sm",
                    darkMode ? "text-slate-400" : "text-gray-500"
                  )}>{user.email}</p>
                  <p className={cn(
                    "text-xs mt-1 rounded-full px-2 py-0.5 inline-block",
                    darkMode ? "bg-slate-700" : "bg-gray-100"
                  )}>
                    {user.role === "admin" ? "Administrador" : "Cliente"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start rounded-none",
                    darkMode 
                      ? "text-red-400 hover:text-red-300 hover:bg-red-900/20" 
                      : "text-red-500 hover:text-red-700 hover:bg-red-50"
                  )}
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sair
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
