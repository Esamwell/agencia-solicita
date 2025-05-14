import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { EventClickArg } from '@fullcalendar/core';
import { useRequests } from '@/context/RequestContext';
import { Request, RequestStatus } from '@/types';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  pending: '#f59e0b',     // Yellow
  'in-progress': '#3b82f6', // Blue
  completed: '#10b981',   // Green
  rejected: '#ef4444',    // Red
};

const RequestCalendar = () => {
  const { userRequests } = useRequests();
  const [selectedEvent, setSelectedEvent] = useState<Request | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Converter as solicitações para eventos do calendário
  const events = userRequests.map((request) => ({
    id: request.id,
    title: request.title,
    start: new Date(request.createdAt),
    // Para solicitações concluídas, definir uma data de término
    end: request.status === "completed" 
      ? new Date(request.updatedAt) 
      : undefined,
    backgroundColor: statusColors[request.status],
    borderColor: statusColors[request.status],
    textColor: '#ffffff',
    extendedProps: {
      description: request.description,
      status: request.status,
      id: request.id,
      type: request.type
    }
  }));

  const handleEventClick = (clickInfo: EventClickArg) => {
    const requestId = clickInfo.event.extendedProps.id as string;
    const request = userRequests.find(req => req.id === requestId);
    
    if (request) {
      setSelectedEvent(request);
      setIsDialogOpen(true);
    }
  };

  const viewDetails = () => {
    if (selectedEvent) {
      navigate(`/requests/${selectedEvent.id}`);
    }
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: RequestStatus) => {
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
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  return (
    <div className="h-[700px]">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        locale={ptBrLocale}
        events={events}
        eventClick={handleEventClick}
        height="100%"
        buttonText={{
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia'
        }}
      />

      {selectedEvent && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{selectedEvent.title}</DialogTitle>
              <DialogDescription className="flex flex-col gap-2 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status:</span>
                  {getStatusBadge(selectedEvent.status)}
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Tipo:</span>
                  <span>{getRequestTypeLabel(selectedEvent.type)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Data de criação:</span>
                  <span>{formatDate(selectedEvent.createdAt)}</span>
                </div>

                {selectedEvent.status === "completed" && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Data de conclusão:</span>
                    <span>{formatDate(selectedEvent.updatedAt)}</span>
                  </div>
                )}

                <div className="mt-2">
                  <span className="font-medium">Descrição:</span>
                  <p className="mt-1 text-gray-700">{selectedEvent.description}</p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Fechar
              </Button>
              <Button onClick={viewDetails}>
                Ver Detalhes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RequestCalendar; 