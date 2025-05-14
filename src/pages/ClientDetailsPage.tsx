import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Request } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useRequests } from "@/context/RequestContext";
import { 
  ArrowLeft, 
  UserRound, 
  MailIcon, 
  PhoneIcon, 
  CalendarIcon, 
  FileText, 
  Edit, 
  Trash,
  Clock,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

// Definindo a interface para os dados de atualização do perfil
interface UpdateProfileData {
  name: string;
  email: string;
  phone?: string;
  since?: string;
}

const ClientDetailsPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { users, deleteUser, updateProfile, fetchUsers } = useAuth();
  const { requests, deleteClientRequests } = useRequests();
  const { toast } = useToast();
  const [client, setClient] = useState<User | null>(null);
  const [clientRequests, setClientRequests] = useState<Request[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedSince, setEditedSince] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dados fictícios
  const clientPhones: Record<string, string> = {
    "client-1": "(11) 98765-4321",
    "esa-1": "(11) 91234-5678"
  };

  useEffect(() => {
    loadInitialData();
  }, [clientId]);

  // Função para carregar dados iniciais do cliente
  const loadInitialData = async () => {
    if (!clientId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await fetchUsers();
      let user = users.find(u => u.id === clientId);
      
      if (!user) {
        const cachedClient = localStorage.getItem(`client_${clientId}`);
        if (cachedClient) {
          const cachedData = JSON.parse(cachedClient);
          const now = new Date().getTime();
          if (cachedData && (now - cachedData.timestamp) < 300000) {
            user = cachedData;
          }
        }
      }
      
      if (user) {
        setClient(user);
        setEditedName(user.name);
        setEditedEmail(user.email);
        
        // Carregar dados do localStorage
        const cachedClient = localStorage.getItem(`client_${clientId}`);
        if (cachedClient) {
          const cachedData = JSON.parse(cachedClient);
          setEditedPhone(cachedData.phone || "");
          setEditedSince(cachedData.since || "01/01/2023");
        } else if (clientPhones[clientId]) {
          setEditedPhone(clientPhones[clientId]);
          setEditedSince("01/01/2023");
        }
        
        const clientRequests = requests.filter(req => req.clientId === clientId);
        setClientRequests(clientRequests || []);
      } else {
        setError("Cliente não encontrado");
        toast({
          title: "Erro",
          description: "Cliente não encontrado",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Erro ao carregar dados do cliente:", err);
      setError("Erro ao carregar dados do cliente");
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do cliente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (clientId) {
      try {
        toast({
          title: "Excluindo cliente...",
          description: "Aguarde enquanto o cliente é excluído",
        });
        
        const success = await deleteUser(clientId);
        if (success) {
          toast({
            title: "Cliente excluído",
            description: "O cliente foi excluído com sucesso. Redirecionando...",
          });
          
          // Redirecionar para a página de clientes após uma breve pausa
          setTimeout(() => {
            window.location.href = "/clients";
          }, 1500);
        } else {
          toast({
            title: "Erro",
            description: "Não foi possível excluir o cliente.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao excluir o cliente.",
          variant: "destructive",
        });
      }
    }
  };

  // Função para atualizar o cliente
  const handleUpdateClient = async (data: UpdateProfileData) => {
    if (!client) return;
    
    setLoading(true);
    try {
      // Atualizar o perfil do cliente na API
      const updatedUser = await updateProfile(
        client.id,
        data.name,
        data.email
      );
      
      if (updatedUser) {
        // Atualizar o cliente no estado local
        setClient(updatedUser);
        setEditedName(updatedUser.name);
        setEditedEmail(updatedUser.email);
        
        // Salvar no localStorage com timestamp, telefone e data
        const clientData = {
          ...updatedUser,
          phone: data.phone,
          since: data.since,
          timestamp: new Date().getTime()
        };
        localStorage.setItem(`client_${client.id}`, JSON.stringify(clientData));
        
        // Atualizar a lista global de usuários
        await fetchUsers();
        
        toast({
          title: "Cliente atualizado",
          description: "Os dados do cliente foram atualizados com sucesso",
        });
        
        // Recarregar os dados do cliente para garantir que tudo está sincronizado
        await loadInitialData();
      }
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar os dados do cliente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500">Em Andamento</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Concluído</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejeitado</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case "card":
        return "Cartão";
      case "post":
        return "Post";
      case "edit":
        return "Edição";
      case "other":
        return "Outro";
      default:
        return "Desconhecido";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Carregando dados do cliente...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !client) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-red-500">{error || "Cliente não encontrado"}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate("/clients")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Clientes
        </Button>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold" data-client-name>{editedName}</h1>
          <div className="space-x-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Cliente</DialogTitle>
                  <DialogDescription>
                    Atualize as informações do cliente.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      name="name"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={editedPhone}
                      onChange={(e) => setEditedPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="since">Cliente desde</Label>
                    <Input
                      id="since"
                      name="since"
                      type="text"
                      value={editedSince}
                      onChange={(e) => setEditedSince(e.target.value)}
                      placeholder="DD/MM/AAAA"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsEditDialogOpen(false)} type="button" variant="outline">
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => {
                      handleUpdateClient({
                        name: editedName,
                        email: editedEmail,
                        phone: editedPhone,
                        since: editedSince
                      });
                      setIsEditDialogOpen(false);
                    }} 
                    type="button" 
                    id="saveChangesButton"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      "Salvar Alterações"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Excluir Cliente</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja excluir o cliente <span data-client-name>{editedName}</span>? Esta ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteClient}>
                    Excluir
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <UserRound className="h-5 w-5 mr-2 text-gray-500" />
              <span data-client-name>{editedName}</span>
            </div>
            <div className="flex items-center">
              <MailIcon className="h-5 w-5 mr-2 text-gray-500" />
              <span data-client-email>{editedEmail}</span>
            </div>
            <div className="flex items-center">
              <PhoneIcon className="h-5 w-5 mr-2 text-gray-500" />
              <span data-client-phone>{editedPhone}</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
              <span data-client-since>Cliente desde: {editedSince}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo de Solicitações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-500" />
              <span>Total: {clientRequests.length}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-yellow-500" />
              <span>Pendentes: {clientRequests.filter(req => req.status === "pending").length}</span>
            </div>
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
              <span>Em andamento: {clientRequests.filter(req => req.status === "in-progress").length}</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
              <span>Concluídas: {clientRequests.filter(req => req.status === "completed").length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações do Cliente</CardTitle>
          <CardDescription>
            Histórico de todas as solicitações feitas por este cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id.slice(0, 8)}</TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>{getRequestTypeLabel(request.type)}</TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/requests/${request.id}`)}
                      >
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">Nenhuma solicitação encontrada</h3>
              <p className="text-gray-500 mt-2">Este cliente ainda não fez nenhuma solicitação.</p>
              <Button className="mt-4" onClick={() => navigate(`/requests/new?clientId=${clientId}`)}>
                Criar Nova Solicitação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default ClientDetailsPage; 