import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RequestProvider } from "./context/RequestContext";
import { ThemeProvider } from "./context/ThemeContext";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RequestsListPage from "./pages/RequestsListPage";
import RequestDetailPage from "./pages/RequestDetailPage";
import NewRequestPage from "./pages/NewRequestPage";
import SettingsPage from "./pages/SettingsPage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailsPage from "./pages/ClientDetailsPage";
import CalendarPage from "./pages/CalendarPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <RequestProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<DashboardPage />} />
                <Route path="/requests" element={<RequestsListPage />} />
                <Route path="/requests/:id" element={<RequestDetailPage />} />
                <Route path="/requests/new" element={<NewRequestPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/clients/:clientId" element={<ClientDetailsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </RequestProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
