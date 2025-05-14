import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Navigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import logoImage from "@/logo/logosa2hub.png";
import { cn } from "@/lib/utils";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { toast } = useToast();

  if (user) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await login(email, password);

      if (!success) {
        toast({
          title: "Erro de login",
          description: "Email ou senha incorretos. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro de login",
        description: "Ocorreu um erro ao fazer login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col items-center justify-center",
      darkMode ? "bg-slate-900" : "bg-gray-50"
    )}>
      <div className="w-full max-w-md flex flex-col items-center justify-center">
        <div className="text-center mb-6 w-full">
          <div className="mx-auto mb-3">
            <img src={logoImage} alt="SA2Hub Logo" className="h-16 mx-auto" />
          </div>
          <h1 className={cn(
            "text-xl font-bold",
            darkMode ? "text-white" : "text-gray-800"
          )}>Sistema de Solicitações</h1>
        </div>

        <Card className={cn(
          "shadow-lg w-full",
          darkMode ? "bg-slate-800 border-slate-700" : "border-0"
        )}>
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-xl text-center font-bold text-primary">Login</CardTitle>
            <CardDescription className="text-center text-sm">
              Entre com suas credenciais para acessar
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3 pt-3">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "h-10",
                    darkMode && "bg-slate-700 border-slate-600"
                  )}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "h-10",
                    darkMode && "bg-slate-700 border-slate-600"
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-10 font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-6 mb-8">
          <button 
            onClick={toggleDarkMode}
            className={cn(
              "text-xs px-4 py-1.5 rounded-md",
              darkMode 
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700" 
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            )}
          >
            {darkMode ? "Modo Claro" : "Modo Escuro"}
          </button>
        </div>
      </div>
      
      <div className={cn(
        "mt-auto py-4 text-center w-full fixed bottom-0",
        darkMode ? "text-gray-500" : "text-gray-400"
      )}>
        <p className="text-xs">© 2024 SA2 Marketing - Todos os direitos reservados | Versão: BetaV1</p>
      </div>
    </div>
  );
};

export default LoginPage;
