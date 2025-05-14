import React, { useEffect, useState, Suspense } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useRequests } from "@/context/RequestContext";
import { UserRoundPlus, MailIcon, PhoneIcon, CalendarIcon, FileTextIcon, Users, MessageSquare, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientFormValues {
  name: string;
  email: string;
  password: string;
}

const ClientsPage = () => {
  const { users, createUser, fetchUsers } = useAuth();
  const { requests } = useRequests();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [newClient, setNewClient] = useState<ClientFormValues>({
    name: "",
    email: "",
    password: ""
  });

  // Carregar usuários apenas uma vez quando a página for montada
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchUsers();
        console.log("Dados de clientes atualizados na página de clientes");
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      } finally {
        setUsersLoaded(true);
        setIsInitialLoading(false);
      }
    };

    loadData();
  }, [fetchUsers]);

  const clients = users.filter(user => user.role === "client");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const created = await createUser(
        newClient.name,
        newClient.email,
        newClient.password,
        "client"
      );

      if (created) {
        setNewClient({
          name: "",
          email: "",
          password: ""
        });
        setIsDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o cliente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Contador de solicitações por cliente
  const getClientRequestsCount = (clientId: string) => {
    return requests.filter(req => req.clientId === clientId).length;
  };

  // Obter a data de cadastro formatada
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Renderizar o conteúdo principal da página
  const renderContent = () => {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Clientes</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserRoundPlus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                <DialogDescription>
                  Preencha os dados abaixo para adicionar um novo cliente ao sistema.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateClient}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      name="name"
                      value={newClient.name}
                      onChange={handleInputChange}
                      placeholder="Nome do cliente"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newClient.email}
                      onChange={handleInputChange}
                      placeholder="email@cliente.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={newClient.password}
                      onChange={handleInputChange}
                      placeholder="Digite a senha"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Criando..." : "Criar Cliente"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Clientes</p>
                <h3 className="text-2xl font-bold">{clients.length}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Solicitações</p>
                <h3 className="text-2xl font-bold">{requests.length}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <MailIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Ativos</p>
                <h3 className="text-2xl font-bold">{clients.length}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">Lista de Clientes</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Nome</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Telefone</th>
                    <th className="text-left py-3 px-4 font-medium">Data de Cadastro</th>
                    <th className="text-left py-3 px-4 font-medium">Solicitações</th>
                    <th className="text-left py-3 px-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => {
                    const requestCount = getClientRequestsCount(client.id);
                    
                    // Dados fictícios para demonstração
                    const clientInfo = {
                      phone: client.id === "client-1" ? "(11) 98765-4321" : 
                            client.id === "esa-1" ? "(11) 91234-5678" :
                            client.name === "Maria Silva" ? "(11) 91234-5678" :
                            client.name === "João Santos" ? "(11) 99876-5432" :
                            client.name === "Paula Oliveira" ? "(11) 95555-4444" :
                            "(11) 99999-9999",
                      date: client.id === "client-1" ? "14/01/2023" :
                            client.id === "esa-1" ? "19/02/2023" :
                            client.name === "Maria Silva" ? "19/02/2023" :
                            client.name === "João Santos" ? "09/03/2023" :
                            client.name === "Paula Oliveira" ? "04/04/2023" :
                            new Date().toLocaleDateString('pt-BR')
                    };
                    
                    return (
                      <tr key={client.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{client.name}</td>
                        <td className="py-3 px-4">{client.email}</td>
                        <td className="py-3 px-4">{clientInfo.phone}</td>
                        <td className="py-3 px-4">{clientInfo.date}</td>
                        <td className="py-3 px-4">{requestCount}</td>
                        <td className="py-3 px-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/clients/${client.id}`)}
                          >
                            Detalhes
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  // Renderizar estado de carregamento com esqueletos
  const renderLoadingState = () => {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Skeleton className="h-12 w-12 rounded-full mr-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-40 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  return (
    <Layout>
      {isInitialLoading ? renderLoadingState() : renderContent()}
    </Layout>
  );
};

export default ClientsPage;
