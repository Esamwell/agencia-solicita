import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpar o banco de dados
  await prisma.comment.deleteMany();
  await prisma.request.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuário admin
  const adminPassword = await hash('123456', 8); // Senha padrão: 123456
  const admin = await prisma.user.create({
    data: {
      id: 'admin-1',
      name: 'Erico Samuel',
      email: 'admin@agencia.com',
      role: 'admin',
      password: adminPassword,
      phone: '(71) 99999-9999',
      since: new Date('2023-01-01'),
    },
  });

  // Criar alguns clientes
  const clientes = [
    {
      name: 'ESA - Escola Superior de Advocacia Orlando Gomes',
      email: 'esa@agencia.com',
      phone: '(71) 3333-3333',
      since: new Date('2023-02-15'),
    },
    {
      name: 'Escritório de Advocacia Silva & Santos',
      email: 'silva.santos@agencia.com',
      phone: '(71) 4444-4444',
      since: new Date('2023-03-01'),
    },
    {
      name: 'Associação dos Advogados da Bahia',
      email: 'aab@agencia.com',
      phone: '(71) 5555-5555',
      since: new Date('2023-04-10'),
    },
  ];

  const clientesCriados = await Promise.all(
    clientes.map(async (cliente) => {
      const password = await hash('123456', 8); // Senha padrão: 123456
      return prisma.user.create({
        data: {
          ...cliente,
          role: 'client',
          password,
        },
      });
    })
  );

  // Criar algumas solicitações
  const tiposSolicitacao = ['Design', 'Social Media', 'Website', 'Marketing'];
  const statusSolicitacao = ['pending', 'in_progress', 'completed'];

  const solicitacoes = [
    {
      title: 'Redesign do Site Institucional',
      description: 'Necessidade de atualização do site institucional com novo layout e funcionalidades.',
      type: 'Website',
      status: 'in_progress',
      clientId: clientesCriados[0].id,
    },
    {
      title: 'Campanha de Marketing Digital',
      description: 'Desenvolvimento de campanha para lançamento do novo curso de especialização.',
      type: 'Marketing',
      status: 'pending',
      clientId: clientesCriados[0].id,
    },
    {
      title: 'Gestão de Redes Sociais',
      description: 'Criação e gestão de conteúdo para redes sociais do escritório.',
      type: 'Social Media',
      status: 'completed',
      clientId: clientesCriados[1].id,
    },
    {
      title: 'Identidade Visual',
      description: 'Desenvolvimento de nova identidade visual para a associação.',
      type: 'Design',
      status: 'pending',
      clientId: clientesCriados[2].id,
    },
  ];

  const solicitacoesCriadas = await Promise.all(
    solicitacoes.map((solicitacao) =>
      prisma.request.create({
        data: {
          ...solicitacao,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Data aleatória nos últimos 30 dias
        },
      })
    )
  );

  // Criar alguns comentários
  const comentarios = [
    {
      content: 'Iniciamos o processo de redesign. Aguardando aprovação do layout inicial.',
      requestId: solicitacoesCriadas[0].id,
      userId: admin.id,
    },
    {
      content: 'Precisamos definir o público-alvo da campanha para prosseguir.',
      requestId: solicitacoesCriadas[1].id,
      userId: clientesCriados[0].id,
    },
    {
      content: 'Campanha finalizada com sucesso! Alcançamos todas as metas estabelecidas.',
      requestId: solicitacoesCriadas[2].id,
      userId: admin.id,
    },
    {
      content: 'Enviando briefing detalhado para início do projeto.',
      requestId: solicitacoesCriadas[3].id,
      userId: clientesCriados[2].id,
    },
  ];

  await Promise.all(
    comentarios.map((comentario) =>
      prisma.comment.create({
        data: {
          ...comentario,
          createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000), // Data aleatória nos últimos 15 dias
        },
      })
    )
  );

  console.log('Dados iniciais criados com sucesso!');
  console.log('Admin criado:', admin.email);
  console.log('Clientes criados:', clientesCriados.length);
  console.log('Solicitações criadas:', solicitacoesCriadas.length);
}

main()
  .catch((e) => {
    console.error('Erro ao criar dados iniciais:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 