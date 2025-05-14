
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useRequests } from "@/context/RequestContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RequestType } from "@/types";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NewRequestPage = () => {
  const { createRequest } = useRequests();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<RequestType>("post");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirecionar se for admin
  if (user?.role === "admin") {
    navigate("/requests");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      createRequest({
        title,
        description,
        type,
      });

      // Limpar campos e navegar para a lista
      setTitle("");
      setDescription("");
      setType("post");
      navigate("/requests");
    } catch (error) {
      console.error("Error creating request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="pl-0" 
          onClick={() => navigate("/requests")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Solicitações
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Nova Solicitação</CardTitle>
            <CardDescription>
              Preencha os detalhes abaixo para criar uma nova solicitação para a agência.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Solicitação</Label>
                <Input
                  id="title"
                  placeholder="Ex: Post para Instagram sobre novo produto"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Solicitação</Label>
                <Select 
                  value={type} 
                  onValueChange={(value) => setType(value as RequestType)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="edit">Edição</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva sua solicitação com detalhes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                className="mr-2"
                onClick={() => navigate("/requests")}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !title || !description}
              >
                {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default NewRequestPage;
