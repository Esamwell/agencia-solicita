import express, { Request, Response } from 'express';
import { readJsonFile, writeJsonFile } from '../services/fileService';
import { Request as AgencyRequest } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const REQUEST_FILE = 'requests.json';

// GET /api/requests - Obter todas as solicitações
router.get('/', async (req: Request, res: Response) => {
  try {
    const requests = await readJsonFile<AgencyRequest>(REQUEST_FILE);
    return res.json(requests);
  } catch (error) {
    console.error('Erro ao ler solicitações:', error);
    return res.status(500).json({ message: 'Erro ao obter solicitações' });
  }
});

// GET /api/requests/:id - Obter uma solicitação específica
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const requests = await readJsonFile<AgencyRequest>(REQUEST_FILE);
    const request = requests.find(r => r.id === req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }
    
    return res.json(request);
  } catch (error) {
    console.error('Erro ao ler solicitação:', error);
    return res.status(500).json({ message: 'Erro ao obter solicitação' });
  }
});

// POST /api/requests - Criar uma nova solicitação
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, type, clientId, clientName } = req.body;
    
    // Validação dos campos obrigatórios
    if (!title || !description || !type || !clientId || !clientName) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    
    const requests = await readJsonFile<AgencyRequest>(REQUEST_FILE);
    
    // Criar nova solicitação
    const newRequest: AgencyRequest = {
      id: uuidv4(),
      title,
      description,
      type,
      status: 'pending',
      clientId,
      clientName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    };
    
    // Adicionar ao array e salvar
    requests.push(newRequest);
    await writeJsonFile(REQUEST_FILE, requests);
    
    return res.status(201).json(newRequest);
  } catch (error) {
    console.error('Erro ao criar solicitação:', error);
    return res.status(500).json({ message: 'Erro ao criar solicitação' });
  }
});

// PUT /api/requests/:id - Atualizar uma solicitação existente
router.put('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { status } = req.body;
    const requests = await readJsonFile<AgencyRequest>(REQUEST_FILE);
    
    const index = requests.findIndex(r => r.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }
    
    // Atualiza apenas o status e a data de atualização
    requests[index] = {
      ...requests[index],
      status,
      updatedAt: new Date().toISOString()
    };
    
    await writeJsonFile(REQUEST_FILE, requests);
    
    return res.json(requests[index]);
  } catch (error) {
    console.error('Erro ao atualizar solicitação:', error);
    return res.status(500).json({ message: 'Erro ao atualizar solicitação' });
  }
});

// DELETE /api/requests/:id - Excluir uma solicitação
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const requests = await readJsonFile<AgencyRequest>(REQUEST_FILE);
    const filteredRequests = requests.filter(r => r.id !== req.params.id);
    
    // Verifica se alguma solicitação foi removida
    if (filteredRequests.length === requests.length) {
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }
    
    await writeJsonFile(REQUEST_FILE, filteredRequests);
    
    return res.json({ message: 'Solicitação removida com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir solicitação:', error);
    return res.status(500).json({ message: 'Erro ao excluir solicitação' });
  }
});

// POST /api/requests/:id/comments - Adicionar um comentário
router.post('/:id/comments', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { content, userId, userName, userRole } = req.body;
    
    if (!content || !userId || !userName || !userRole) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    
    const requests = await readJsonFile<AgencyRequest>(REQUEST_FILE);
    const index = requests.findIndex(r => r.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }
    
    const newComment = {
      id: uuidv4(),
      content,
      userId,
      userName,
      userRole,
      createdAt: new Date().toISOString()
    };
    
    // Inicializa o array de comentários se não existir
    if (!requests[index].comments) {
      requests[index].comments = [];
    }
    
    // Adiciona o comentário e atualiza a data da solicitação
    requests[index].comments!.push(newComment);
    requests[index].updatedAt = new Date().toISOString();
    
    await writeJsonFile(REQUEST_FILE, requests);
    
    return res.status(201).json(newComment);
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    return res.status(500).json({ message: 'Erro ao adicionar comentário' });
  }
});

export default router; 