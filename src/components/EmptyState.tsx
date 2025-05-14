
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLink?: string;
  actionLabel?: string;
  showAction?: boolean;
  icon?: React.ReactNode;
}

export const EmptyState = ({
  title = "Nenhum item encontrado",
  description = "Não há itens para exibir no momento.",
  actionLink = "/requests/new",
  actionLabel = "Criar Novo",
  showAction = true,
  icon = <ClipboardList className="h-12 w-12 text-gray-300" />,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border rounded-lg bg-gray-50/50">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md mb-6">{description}</p>
      {showAction && (
        <Link to={actionLink}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
};
