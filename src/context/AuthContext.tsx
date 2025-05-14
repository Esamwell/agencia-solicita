import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { User } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";
import { useRequests } from "./RequestContext";

// API base URL
const API_BASE_URL = 'http://localhost:3001/api';

// Interface para usuário com senha (apenas para autenticação)
interface UserWithPassword extends User {
  password?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  createUser: (name: string, email: string, password: string, role: "admin" | "client") => Promise<User | null>;
  users: User[];
  fetchUsers: () => Promise<void>;
  deleteUser: (id: string) => Promise<boolean>;
  updateProfile: (id: string, name: string, email: string) => Promise<User | null>;
  updatePassword: (id: string, currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Carregar usuário do localStorage no carregamento inicial
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Carregar lista de usuários
  const fetchUsers = async (): Promise<void> => {
    // Se já temos usuários carregados, não mostramos o estado de carregamento
    // para evitar piscar a interface durante atualizações
    const shouldShowLoading = users.length === 0;
    
    if (shouldShowLoading) {
      setIsLoading(true);
    }
    
    try {
      // Adicionar parâmetros para evitar cache
      const response = await fetch(`${API_BASE_URL}/users?t=${new Date().getTime()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error("Erro ao buscar usuários");
      }
      
      const data = await response.json();
      setUsers(data);
      return;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários",
        variant: "destructive",
      });
      throw error;
    } finally {
      if (shouldShowLoading) {
        setIsLoading(false);
      }
    }
  };

  // Login de usuário
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Buscar usuários
      const response = await fetch(`${API_BASE_URL}/users`);
      
      if (!response.ok) {
        throw new Error("Falha ao buscar usuários para login");
      }
      
      const usersData = await response.json();
      
      // Encontrar usuário pelo email
      const foundUser = usersData.find((u: User) => u.email.toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        toast({
          title: "Erro",
          description: "Email ou senha incorretos",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }

      // Buscar senhas do arquivo
      const passwordResponse = await fetch(`${API_BASE_URL}/users/passwords`);
      if (!passwordResponse.ok) {
        throw new Error("Falha ao verificar credenciais");
      }
      const passwords = await passwordResponse.json();
      
      // Verificar senha
      if (passwords[foundUser.id] === password) {
        setUser(foundUser);
        localStorage.setItem("user", JSON.stringify(foundUser));
        
        toast({
          title: "Login realizado",
          description: "Bem-vindo(a) de volta!",
        });
        
        setIsLoading(false);
        return true;
      }
      
      toast({
        title: "Erro",
        description: "Email ou senha incorretos",
        variant: "destructive",
      });
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Erro ao tentar login:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar fazer login",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  // Atualizar perfil de usuário
  const updateProfile = async (
    id: string,
    name: string,
    email: string
  ): Promise<User | null> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar perfil");
      }

      const updatedUser = await response.json();
      
      // Se o usuário logado foi atualizado, atualizar o estado
      if (user && user.id === id) {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      
      // Atualizar a lista de usuários
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso",
      });
      
      return updatedUser;
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o perfil",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar senha do usuário
  const updatePassword = async (
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log(`Iniciando atualização de senha para usuário ${id}`);
      console.log(`Dados: ID=${id}, Nova senha=${newPassword}`);
      
      // MODO EMERGÊNCIA: Usar o endpoint que força a alteração da senha
      const updateResponse = await fetch(`${API_BASE_URL}/force-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          userId: id,
          newPassword
        }),
      });
      
      console.log(`Resposta recebida. Status: ${updateResponse.status}`);
      
      // Imprimir texto da resposta para debug em caso de erro
      const responseText = await updateResponse.text();
      console.log(`Texto da resposta: ${responseText}`);
      
      // Tentar converter para JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log(`Dados da resposta:`, responseData);
      } catch (e) {
        console.error(`Erro ao parsear resposta JSON:`, e);
        throw new Error(`Resposta inválida do servidor: ${responseText}`);
      }
      
      if (!updateResponse.ok || !responseData.success) {
        console.error('Erro na resposta:', responseData);
        throw new Error(responseData.message || "Falha ao atualizar senha");
      }
      
      console.log('Senha atualizada com sucesso no servidor');
      
      toast({
        title: "Senha atualizada",
        description: "A senha foi atualizada com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível atualizar a senha",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Criar um novo usuário
  const createUser = async (
    name: string, 
    email: string,
    password: string,
    role: "admin" | "client"
  ): Promise<User | null> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          role
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar usuário");
      }

      const newUser = await response.json();
      
      // Atualizar o arquivo de senhas
      const passwordResponse = await fetch(`${API_BASE_URL}/users/passwords`);
      const passwords = await passwordResponse.json();
      
      // Adicionar nova senha
      passwords[newUser.id] = password;
      
      // Salvar arquivo atualizado
      const saveResponse = await fetch(`${API_BASE_URL}/users/passwords`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwords),
      });
      
      if (!saveResponse.ok) {
        throw new Error('Falha ao salvar senha');
      }
      
      // Atualizar a lista de usuários
      setUsers(prev => [...prev, newUser]);
      
      toast({
        title: "Usuário criado",
        description: `Usuário ${name} foi criado com sucesso!`,
      });
      
      return newUser;
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível criar o usuário",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Excluir um usuário
  const deleteUser = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir usuário");
      }

      // Remover da lista de usuários local
      setUsers(prev => prev.filter(u => u.id !== id));
      
      // Remover a senha armazenada
      const passwordResponse = await fetch(`${API_BASE_URL}/users/passwords`);
      const passwords = await passwordResponse.json();
      delete passwords[id];
      
      await fetch(`${API_BASE_URL}/users/passwords`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwords),
      });
      
      toast({
        title: "Usuário excluído",
        description: "Usuário e todas suas solicitações foram removidos com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading,
      createUser,
      users,
      fetchUsers,
      deleteUser,
      updateProfile,
      updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
