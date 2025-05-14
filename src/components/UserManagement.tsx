import React, { useState, memo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/types";
import { UserRoundPlus, UserCog, Trash2 } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { useAuth } from "@/context/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface NewUserFormValues {
  name: string;
  email: string;
  password: string;
  role: "admin" | "client";
}

interface EditUserFormValues {
  id: string;
  name: string;
  email: string;
  role: "admin" | "client";
  newPassword?: string;
}

const UserManagementComponent = () => {
  const { toast } = useToast();
  const { users, createUser, deleteUser, updateProfile, updatePassword } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState<NewUserFormValues>({
    name: "",
    email: "",
    password: "",
    role: "client"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<EditUserFormValues | null>(null);
  
  // Exibir todos os usuários, não apenas clientes
  const allUsers = users;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (userToEdit) {
      setUserToEdit(prev => ({
        ...prev!,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Tentando criar usuário com os dados:', newUser);
      
      const createdUser = await createUser(
        newUser.name,
        newUser.email,
        newUser.password,
        newUser.role
      );
      
      console.log('Resposta da API de criação:', createdUser);
      
      if (createdUser) {
        // Reset form
        setNewUser({
          name: "",
          email: "",
          password: "",
          role: "client"
        });
        setShowForm(false);
        
        toast({
          title: "Usuário criado com sucesso",
          description: `O usuário ${createdUser.name} foi criado com sucesso.`,
        });
        
        // Forçar atualização da interface
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error("Erro detalhado ao criar usuário:", error);
      toast({
        title: "Erro ao criar usuário",
        description: "Ocorreu um erro ao criar o usuário.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setUserToEdit({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    
    setIsLoading(true);
    
    try {
      // Atualizar perfil
      const updatedUser = await updateProfile(
        userToEdit.id,
        userToEdit.name,
        userToEdit.email
      );
      
      if (!updatedUser) {
        throw new Error("Não foi possível atualizar o usuário");
      }
      
      // Se uma nova senha foi fornecida, atualizá-la
      if (userToEdit.newPassword && userToEdit.newPassword.trim() !== "") {
        const passwordUpdated = await updatePassword(
          userToEdit.id,
          "", // senha atual não é necessária para admin
          userToEdit.newPassword
        );
        
        if (!passwordUpdated) {
          throw new Error("Não foi possível atualizar a senha");
        }
      }
      
      toast({
        title: "Usuário atualizado",
        description: `O usuário ${updatedUser.name} foi atualizado com sucesso.`,
      });
      
      // Limpar o estado de edição
      setUserToEdit(null);
      setIsEditDialogOpen(false);
      
      // Forçar atualização da interface após sucesso
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast({
        title: "Erro ao atualizar",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    setIsLoading(true);
    setUserToDelete({ id: userId, name: userName } as User);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      const success = await deleteUser(userToDelete.id);
      
      if (!success) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o usuário.",
          variant: "destructive",
        });
      }
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "client"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gerenciamento de Usuários</CardTitle>
            <CardDescription>
              Crie e gerencie contas de usuários para a plataforma.
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <a href="/emergencia-senha.html" target="_blank" rel="noopener noreferrer">
              <Button variant="destructive">
                Emergência Senha
              </Button>
            </a>
            <Button onClick={toggleForm} disabled={isLoading}>
              <UserRoundPlus className="mr-2 h-4 w-4" />
              {showForm ? "Cancelar" : "Novo Usuário"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6 p-4 border rounded-md bg-gray-50">
              <h3 className="text-lg font-medium mb-4">Adicionar Novo Usuário</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    placeholder="Nome do usuário"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    placeholder="email@usuario.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    placeholder="Digite a senha"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Tipo de Usuário</Label>
                  <Select
                    onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value as "admin" | "client" }))}
                    value={newUser.role}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="client">Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Criando..." : "Criar Usuário"}
                  </Button>
                  <Button type="button" variant="outline" onClick={toggleForm} disabled={isLoading}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          )}

          {allUsers.length > 0 ? (
            <div className="divide-y">
              <Table>
                <TableCaption>Lista de usuários do sistema</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role === "admin" ? "Administrador" : "Cliente"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditUser(user)}
                          >
                            <UserCog className="h-4 w-4 mr-2" />
                            Gerenciar
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id, user.name)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              title="Nenhum usuário cadastrado"
              description="Você ainda não cadastrou nenhum usuário no sistema."
              actionLabel="Adicionar Usuário"
              showAction={false}
              icon={<UserRoundPlus className="h-12 w-12 text-gray-300" />}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário{" "}
              <strong>{userToDelete?.name}</strong>? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Alterar informações do usuário
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={userToEdit?.name || ""}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={userToEdit?.email || ""}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Digite a nova senha"
                  onChange={handleEditInputChange}
                />
                <p className="text-sm text-gray-500">
                  Deixe em branco para manter a senha atual
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Tipo de Usuário</Label>
                <Input
                  id="role"
                  value={userToEdit?.role === "admin" ? "Administrador" : "Cliente"}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500">
                  O tipo de usuário não pode ser alterado
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Usando memo para evitar re-renderizações desnecessárias
export const UserManagement = memo(UserManagementComponent);
