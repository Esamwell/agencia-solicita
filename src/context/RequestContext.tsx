import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Request, RequestStatus, RequestType, Comment } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";

// API base URL
const API_BASE_URL = 'http://localhost:3001/api';

interface RequestContextType {
  requests: Request[];
  userRequests: Request[];
  createRequest: (data: {
    title: string;
    description: string;
    type: RequestType;
  }) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus) => void;
  addComment: (requestId: string, content: string) => void;
  deleteClientRequests: (clientId: string) => Promise<void>;
  isLoading: boolean;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

// Gerar data de exemplo para demonstração
const generateMockDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// Dados de exemplo
const MOCK_REQUESTS: Request[] = [
  {
    id: "req-1",
    title: "Post para Instagram",
    description: "Preciso de um post sobre nosso novo produto para Instagram",
    type: "post",
    status: "completed",
    clientId: "client-1",
    clientName: "Cliente Demo",
    createdAt: generateMockDate(5),
    updatedAt: generateMockDate(3),
    comments: [
      {
        id: "com-1",
        content: "Post aprovado e agendado para quinta-feira",
        userId: "admin-1",
        userName: "Admin Agência",
        userRole: "admin",
        createdAt: generateMockDate(3),
      },
    ],
  },
  {
    id: "req-2",
    title: "Card de promoção",
    description: "Card promocional para a campanha de fim de ano",
    type: "card",
    status: "in-progress",
    clientId: "client-1",
    clientName: "Cliente Demo",
    createdAt: generateMockDate(2),
    updatedAt: generateMockDate(1),
    comments: [
      {
        id: "com-2",
        content: "Já estamos trabalhando neste card, deve ficar pronto amanhã",
        userId: "admin-1",
        userName: "Admin Agência",
        userRole: "admin",
        createdAt: generateMockDate(1),
      },
    ],
  },
  {
    id: "req-3",
    title: "Edição de capa do Facebook",
    description: "Ajustar a imagem atual da capa conforme as novas cores da marca",
    type: "edit",
    status: "pending",
    clientId: "client-1",
    clientName: "Cliente Demo",
    createdAt: generateMockDate(1),
    updatedAt: generateMockDate(1),
    comments: [],
  },
];

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carregamento de dados da API
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/requests`);
        
        if (!response.ok) {
          throw new Error(`Erro ao carregar solicitações: ${response.status}`);
        }
        
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error("Erro ao carregar solicitações:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as solicitações.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtra solicitações por cliente atual (se for cliente)
  const userRequests = user?.role === "client"
    ? requests.filter((req) => req.clientId === user.id)
    : requests;

  const createRequest = async (data: {
    title: string;
    description: string;
    type: RequestType;
  }) => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      const requestData = {
        ...data,
        clientId: user.id,
        clientName: user.name,
      };

      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar solicitação: ${response.status}`);
      }

      const newRequest = await response.json();
      setRequests(prev => [...prev, newRequest]);
      
      toast({
        title: "Solicitação criada",
        description: "Sua solicitação foi enviada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao criar solicitação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a solicitação.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: RequestStatus) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar status: ${response.status}`);
      }

      const updatedRequest = await response.json();
      
      setRequests(prev => prev.map(req => 
        req.id === requestId ? updatedRequest : req
      ));
      
      toast({
        title: "Status atualizado",
        description: `Status da solicitação alterado para ${status}`,
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da solicitação.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (requestId: string, content: string) => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      const commentData = {
        content,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
      };

      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        throw new Error(`Erro ao adicionar comentário: ${response.status}`);
      }

      const newComment = await response.json();
      
      // Atualiza a solicitação com o novo comentário
      setRequests(prev => prev.map(req => {
        if (req.id === requestId) {
          const comments = req.comments || [];
          return {
            ...req,
            comments: [...comments, newComment],
            updatedAt: new Date().toISOString(),
          };
        }
        return req;
      }));
      
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi adicionado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteClientRequests = async (clientId: string) => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/requests/client/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir solicitações: ${response.status}`);
      }

      const updatedRequests = requests.filter((req) => req.clientId !== clientId);
      setRequests(updatedRequests);
      
      toast({
        title: "Solicitações excluídas",
        description: "Todas as solicitações deste cliente foram excluídas com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao excluir solicitações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir as solicitações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RequestContext.Provider
      value={{
        requests,
        userRequests,
        createRequest,
        updateRequestStatus,
        addComment,
        deleteClientRequests,
        isLoading,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (context === undefined) {
    throw new Error("useRequests must be used within a RequestProvider");
  }
  return context;
};
