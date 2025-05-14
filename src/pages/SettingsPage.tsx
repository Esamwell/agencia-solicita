import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserManagement } from "@/components/UserManagement";

const SettingsPage = () => {
  const { user, fetchUsers, updateProfile } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [activeTab, setActiveTab] = useState("profile");
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Efeito para atualizar campos quando o usuário mudar
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);
  
  // Efeito para carregar usuários apenas uma vez quando a página carregar
  useEffect(() => {
    const loadUsers = async () => {
      if (!usersLoaded) {
        await fetchUsers();
        setUsersLoaded(true);
      }
    };
    
    loadUsers();
  }, [fetchUsers, usersLoaded]);
  
  // Gerencia a mudança de tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Atualizar perfil do usuário
      const updatedUser = await updateProfile(user.id, name, email);
      
      if (!updatedUser) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o perfil",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o perfil",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>

      <div className="max-w-3xl">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            {user?.role === "admin" && (
              <TabsTrigger value="users">Usuários</TabsTrigger>
            )}
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais aqui.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <Input
                      id="role"
                      value={user?.role === "admin" ? "Administrador" : "Cliente"}
                      disabled
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {user?.role === "admin" && (
            <TabsContent value="users">
              {activeTab === "users" && usersLoaded && <UserManagement />}
            </TabsContent>
          )}
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Configure como você deseja receber notificações.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 italic">
                  Configurações de notificações serão implementadas em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;
