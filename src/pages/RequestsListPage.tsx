
import { Layout } from "@/components/Layout";
import { useRequests } from "@/context/RequestContext";
import { RequestCard } from "@/components/RequestCard";
import { EmptyState } from "@/components/EmptyState";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const RequestsListPage = () => {
  const { userRequests, isLoading } = useRequests();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const isAdmin = user?.role === "admin";

  const filteredRequests = userRequests.filter((request) => {
    // Filtro de pesquisa (título ou descrição)
    const matchesSearch =
      searchQuery === "" ||
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Filtro de status
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;

    // Filtro de tipo
    const matchesType = typeFilter === "all" || request.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Ordenar por data de atualização (mais recente primeiro)
  const sortedRequests = [...filteredRequests].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Solicitações</h1>
        {!isAdmin && (
          <Link to="/requests/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Solicitação
            </Button>
          </Link>
        )}
      </div>

      <div className="mb-6 p-4 bg-white border rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar solicitações..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 h-4 w-4" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in-progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 h-4 w-4" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="post">Post</SelectItem>
                <SelectItem value="edit">Edição</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {sortedRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedRequests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhuma solicitação encontrada"
          description={
            userRequests.length > 0
              ? "Tente ajustar seus filtros de pesquisa."
              : "Comece criando sua primeira solicitação."
          }
          actionLabel="Nova Solicitação"
          actionLink="/requests/new"
          showAction={!isAdmin}
        />
      )}
    </Layout>
  );
};

export default RequestsListPage;
