import { useRequests } from "@/context/RequestContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestCard } from "@/components/RequestCard";
import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { CheckCircle, Clock, PenLine, ClipboardList, AlertCircle } from "lucide-react";
import { useEffect } from "react";

const DashboardPage = () => {
  const { userRequests, isLoading } = useRequests();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Forçar recarregamento dos dados quando o dashboard for aberto
  useEffect(() => {
    // Recarregar a página uma vez ao abrir o dashboard para garantir dados atualizados
    const lastReload = localStorage.getItem('lastDashboardReload');
    const now = new Date().getTime();
    
    if (!lastReload || (now - parseInt(lastReload)) > 300000) { // 5 minutos
      localStorage.setItem('lastDashboardReload', now.toString());
      // Recarregar apenas se não for a primeira vez que a página é carregada
      if (lastReload) {
        window.location.reload();
      }
    }
  }, []);

  // Contador de solicitações por status
  const pendingCount = userRequests.filter((req) => req.status === "pending").length;
  const inProgressCount = userRequests.filter((req) => req.status === "in-progress").length;
  const completedCount = userRequests.filter((req) => req.status === "completed").length;
  const rejectedCount = userRequests.filter((req) => req.status === "rejected").length;

  // Dados para o gráfico de status
  const statusData = [
    { name: "Pendente", value: pendingCount, color: "#f59e0b" },
    { name: "Em Andamento", value: inProgressCount, color: "#3b82f6" },
    { name: "Concluído", value: completedCount, color: "#10b981" },
    { name: "Rejeitado", value: rejectedCount, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  // Contagem por tipo
  const cardCount = userRequests.filter((req) => req.type === "card").length;
  const postCount = userRequests.filter((req) => req.type === "post").length;
  const editCount = userRequests.filter((req) => req.type === "edit").length;
  const otherCount = userRequests.filter((req) => req.type === "other").length;

  // Dados para o gráfico de tipos
  const typeData = [
    { name: "Card", value: cardCount, color: "#8b5cf6" },
    { name: "Post", value: postCount, color: "#3b82f6" },
    { name: "Edição", value: editCount, color: "#f97316" },
    { name: "Outro", value: otherCount, color: "#6b7280" },
  ].filter((item) => item.value > 0);

  // Últimas 3 solicitações
  const recentRequests = [...userRequests]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded mt-4"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Solicitações</p>
              <h3 className="text-2xl font-bold">{userRequests.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pendentes</p>
              <h3 className="text-2xl font-bold">{pendingCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <PenLine className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Em Andamento</p>
              <h3 className="text-2xl font-bold">{inProgressCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Concluídas</p>
              <h3 className="text-2xl font-bold">{completedCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {statusData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Solicitações por Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {typeData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Solicitações por Tipo</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhuma solicitação"
              description="Você ainda não possui solicitações registradas."
              actionLabel="Criar nova solicitação"
              actionLink="/requests/new"
              showAction={!isAdmin}
              icon={<AlertCircle className="h-12 w-12 text-gray-300" />}
            />
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default DashboardPage;
