import React from 'react';
import { Layout } from '@/components/Layout';
import RequestCalendar from '@/components/RequestCalendar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertCircle, Calendar } from 'lucide-react';
import { useRequests } from '@/context/RequestContext';
import { EmptyState } from '@/components/EmptyState';

const CalendarPage = () => {
  const { userRequests, isLoading } = useRequests();

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-[600px] bg-gray-200 rounded"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Calendário de Solicitações</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Visualização de Solicitações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userRequests.length > 0 ? (
            <RequestCalendar />
          ) : (
            <EmptyState
              title="Sem solicitações"
              description="Não há solicitações para exibir no calendário."
              actionLabel="Criar nova solicitação"
              actionLink="/requests/new"
              icon={<AlertCircle className="h-12 w-12 text-gray-300" />}
            />
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default CalendarPage; 