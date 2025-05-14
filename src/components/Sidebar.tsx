import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Plus, 
  Users, 
  Settings, 
  ChevronRight,
  Calendar,
  LogOut,
  User
} from "lucide-react";
import logoImage from "@/logo/logosa2hub.png";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SidebarProps {
  isOpen: boolean;
  className?: string;
  onCollapseChange?: (collapsed: boolean) => void;
}

export const Sidebar = ({ isOpen, className, onCollapseChange }: SidebarProps) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = user?.role === "admin";

  const navigationItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      role: "all"
    },
    {
      label: "Solicitações",
      icon: ClipboardList,
      href: "/requests",
      role: "all"
    },
    {
      label: "Nova Solicitação",
      icon: Plus,
      href: "/requests/new",
      role: "client"
    },
    {
      label: "Calendário",
      icon: Calendar,
      href: "/calendar",
      role: "all"
    },
    {
      label: "Clientes",
      icon: Users,
      href: "/clients",
      role: "admin"
    },
    {
      label: "Configurações",
      icon: Settings,
      href: "/settings",
      role: "all"
    },
  ];

  // Filtra itens de navegação com base na função do usuário
  const filteredItems = navigationItems.filter(
    item => item.role === "all" || item.role === user?.role
  );

  // Notificar o componente pai sobre o estado inicial de colapso
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(collapsed);
    }
  }, [collapsed, onCollapseChange]);
  
  // Corrigir comportamento do menu colapsado
  // Quando o sidebar não estiver aberto, devemos garantir que o estado colapsado seja mantido
  useEffect(() => {
    if (!isOpen) {
      setCollapsed(true);
    }
  }, [isOpen]);

  // Função para alternar o modo recolhido
  const toggleCollapse = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    // Notificar o componente pai sobre a mudança
    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-20 transition-all duration-200 ease-in-out",
        darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-800",
        collapsed ? "w-16" : "w-64",
        !isOpen && "-translate-x-full",
        "border-r",
        darkMode ? "border-slate-700" : "border-slate-200",
        className
      )}
    >
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className={cn(
          "flex items-center border-b relative",
          darkMode ? "border-slate-700" : "border-slate-200"
        )}>
          {!collapsed ? (
            <div className="w-full flex flex-col items-center justify-center py-6">
              <img src={logoImage} alt="SA2Hub" className="h-16 w-auto object-contain" />
              <div className="mt-2 text-sm font-medium uppercase">MENU</div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-4 relative">
              <img src={logoImage} alt="SA2Hub" className="h-10 w-auto object-contain" />
              <div className="mt-1 text-[8px] uppercase font-medium">MENU</div>
            </div>
          )}
          
          {/* Botão de colapso unificado e elegante */}
          <button
            onClick={toggleCollapse}
            className={cn(
              "absolute flex items-center justify-center",
              "w-7 h-7 rounded-full shadow-sm",
              "top-1/2 -right-3.5 transform -translate-y-1/2",
              darkMode 
                ? "bg-slate-800 text-white border border-slate-700" 
                : "bg-white text-slate-600 border border-slate-200",
              "transition-colors hover:bg-primary hover:text-white hover:border-primary"
            )}
          >
            <ChevronRight 
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed ? "" : "rotate-180"
              )} 
            />
          </button>
        </div>

        {/* Menu */}
        <div className={cn(
          "flex-grow py-3",
          collapsed ? "px-3" : "px-4"
        )}>
          <nav className={cn(
            "space-y-1.5", 
            collapsed && "flex flex-col items-center"
          )}>
            {filteredItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center rounded-md transition-colors",
                    collapsed ? "justify-center w-10 h-10" : "px-3 py-2.5",
                    isActive
                      ? darkMode 
                          ? "bg-primary text-white" 
                          : "bg-primary/10 text-primary"
                      : darkMode
                          ? "hover:bg-primary/20" 
                          : "hover:bg-primary/10",
                    "my-0.5"
                  )}
                  title={collapsed ? item.label : ""}
                >
                  <Icon className={cn(
                    "flex-shrink-0",
                    collapsed ? "h-5 w-5" : "h-5 w-5 mr-3",
                    isActive 
                      ? darkMode 
                          ? "text-white" 
                          : "text-primary"
                      : ""
                  )} />
                  {!collapsed && (
                    <span className={cn(
                      "text-sm font-medium",
                      isActive 
                        ? darkMode 
                            ? "font-medium text-white" 
                            : "font-medium text-primary"
                        : ""
                    )}>
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Divider */}
        <div className={cn(
          "my-2 mx-4 border-t",
          darkMode ? "border-slate-700" : "border-slate-200"
        )}></div>
        
        {/* Bottom actions */}
        <div className={cn(
          "p-4 space-y-3",
          darkMode ? "text-white" : "text-slate-800"
        )}>
          {/* User info */}
          <div className={cn(
            "flex items-center rounded-md",
            collapsed ? "justify-center" : "px-2 py-1.5"
          )}>
            {!collapsed ? (
              <>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                  darkMode ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
                )}>
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs opacity-60 truncate">{user?.email}</p>
                </div>
              </>
            ) : (
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                darkMode ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
              )}>
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
          
          {/* Dark Mode Switch */}
          <div className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "px-2 py-1.5 justify-between"
          )}>
            {!collapsed && <span className="text-sm">Dark Mode</span>}
            <Switch 
              checked={darkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
          
          {/* Logout button */}
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              logout && logout();
            }}
            className={cn(
              "flex items-center rounded-md transition-colors",
              collapsed ? "justify-center w-10 h-10" : "px-3 py-2.5",
              darkMode ? "hover:bg-primary/20" : "hover:bg-primary/10"
            )}
          >
            <LogOut className={cn(
              "flex-shrink-0",
              collapsed ? "h-5 w-5" : "h-5 w-5 mr-3"
            )} />
            {!collapsed && <span className="text-sm font-medium">Log Out</span>}
          </Link>
        </div>

        {/* Footer */}
        <div className={cn(
          "py-3 border-t",
          darkMode ? "border-slate-700" : "border-slate-200",
          collapsed ? "px-1 text-center" : "px-4"
        )}>
          <div className="flex flex-col items-center">
            <p className={cn(
              "text-center text-xs",
              collapsed ? "text-[9px]" : "text-xs",
              "font-medium opacity-60"
            )}>
              {collapsed ? "SA2 Marketing" : "Desenvolvido por: Agência SA2 Marketing"}
            </p>
            <p className={cn(
              "text-center",
              collapsed ? "text-[9px]" : "text-xs",
              "opacity-60"
            )}>
              Versão: BetaV1
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
