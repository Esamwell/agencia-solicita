
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Request } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
    case "in-progress":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Em Andamento</Badge>;
    case "completed":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Concluído</Badge>;
    case "rejected":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeitado</Badge>;
    default:
      return <Badge variant="outline">Desconhecido</Badge>;
  }
};

export const getTypeBadge = (type: string) => {
  switch (type) {
    case "card":
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Card</Badge>;
    case "post":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Post</Badge>;
    case "edit":
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Edição</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Outro</Badge>;
  }
};

interface RequestCardProps {
  request: Request;
}

export const RequestCard = ({ request }: RequestCardProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const commentCount = request.comments?.length || 0;

  return (
    <Card className="hover:shadow-md transition-shadow border animate-scale-in">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {getTypeBadge(request.type)}
            {getStatusBadge(request.status)}
          </div>
          <h3 className="font-medium text-base">{request.title}</h3>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
          {request.description}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {isAdmin ? `Cliente: ${request.clientName}` : ""}
            {!isAdmin && `Criado: ${formatDistanceToNow(new Date(request.createdAt), { 
              addSuffix: true,
              locale: ptBR 
            })}`}
          </span>
          <div className="flex items-center">
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            <span>{commentCount}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-end">
        <Link to={`/requests/${request.id}`}>
          <Button variant="ghost" size="sm" className="hover-scale">
            <Eye className="h-4 w-4 mr-2" />
            Detalhes
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
