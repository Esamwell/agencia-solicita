
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useRequests } from "@/context/RequestContext";
import { useAuth } from "@/context/AuthContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getStatusBadge, getTypeBadge } from "@/components/RequestCard";
import { EmptyState } from "@/components/EmptyState";
import { ArrowLeft, MessageSquare, User, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequestStatus } from "@/types";
import { Separator } from "@/components/ui/separator";

const RequestDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { userRequests, updateRequestStatus, addComment, isLoading } = useRequests();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState("");
  const [newStatus, setNewStatus] = useState<RequestStatus | "">("");

  const request = userRequests.find((r) => r.id === id);
  const isAdmin = user?.role === "admin";

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!request) {
    return (
      <Layout>
        <EmptyState
          title="Solicitação não encontrada"
          description="A solicitação que você está procurando não existe ou você não tem permissão para visualizá-la."
          actionLabel="Voltar para Solicitações"
          actionLink="/requests"
          icon={<MessageSquare className="h-12 w-12 text-gray-300" />}
        />
      </Layout>
    );
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() !== "") {
      addComment(request.id, commentText);
      setCommentText("");
    }
  };

  const handleStatusChange = (status: RequestStatus) => {
    updateRequestStatus(request.id, status);
    setNewStatus("");
  };

  return (
    <Layout>
      <div className="mb-6">
        <Link to="/requests">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Solicitações
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {getTypeBadge(request.type)}
                {getStatusBadge(request.status)}
              </div>
              <CardTitle className="text-xl">{request.title}</CardTitle>
              <CardDescription>
                ID: {request.id.slice(0, 8)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{request.description}</p>
              
              <div className="flex items-center mt-6 text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  Criado {formatDistanceToNow(new Date(request.createdAt), { 
                    addSuffix: true,
                    locale: ptBR 
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Comentários</CardTitle>
            </CardHeader>
            <CardContent>
              {request.comments && request.comments.length > 0 ? (
                <div className="space-y-4">
                  {request.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-4 rounded-lg border bg-gray-50"
                    >
                      <div className="flex items-center mb-2">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white mr-2">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {comment.userName}
                            <Badge 
                              variant="outline" 
                              className="ml-2 text-xs py-0 px-1.5 bg-gray-100"
                            >
                              {comment.userRole === "admin" ? "Admin" : "Cliente"}
                            </Badge>
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(comment.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-line">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Não há comentários nesta solicitação ainda.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <form onSubmit={handleCommentSubmit} className="w-full">
                <Textarea
                  placeholder="Adicione um comentário..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="mb-2"
                />
                <Button type="submit" disabled={commentText.trim() === ""}>
                  Enviar Comentário
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Detalhes</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Cliente</dt>
                  <dd className="font-medium">{request.clientName}</dd>
                </div>
                <Separator />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                  <dd>{getTypeBadge(request.type)}</dd>
                </div>
                <Separator />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd>{getStatusBadge(request.status)}</dd>
                </div>
                <Separator />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Data de Criação</dt>
                  <dd>{format(new Date(request.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</dd>
                </div>
                <Separator />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Última Atualização</dt>
                  <dd>{format(new Date(request.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</dd>
                </div>
              </dl>
            </CardContent>
            {isAdmin && (
              <CardFooter className="flex-col items-stretch">
                <p className="text-sm font-medium text-gray-500 mb-2">Atualizar Status</p>
                <Select value={newStatus} onValueChange={(value) => handleStatusChange(value as RequestStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alterar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RequestDetailPage;
