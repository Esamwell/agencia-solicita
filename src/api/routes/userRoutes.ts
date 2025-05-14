import express, { Request, Response } from 'express';
import { readJsonFile, writeJsonFile } from '../services/fileService';
import { User } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();
const USERS_FILE = 'users.json';
const PASSWORDS_FILE = 'passwords.json';

// Interface para o arquivo de senhas
interface PasswordStore {
  [key: string]: string;
}

// GET /api/users - Listar todos os usuários
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await readJsonFile<User[]>(USERS_FILE, []);
    return res.json(users);
  } catch (error) {
    console.error('Erro ao ler usuários:', error);
    return res.status(500).json({ message: 'Erro ao obter usuários' });
  }
});

// GET /api/users/passwords - Obter senhas (ROTA CORRIGIDA)
router.get('/passwords', async (req: Request, res: Response) => {
  try {
    const passwords = await readJsonFile<PasswordStore>(PASSWORDS_FILE, {});
    return res.json(passwords);
  } catch (error) {
    console.error('Erro ao ler senhas:', error);
    return res.status(500).json({ message: 'Erro ao obter senhas' });
  }
});

// PUT /api/users/passwords - Atualizar senhas (ROTA CORRIGIDA)
router.put('/passwords', async (req: Request, res: Response) => {
  try {
    const passwords = req.body;
    console.log('Atualizando senhas:', passwords);
    
    // Garantir que o arquivo existe antes de escrever
    const DATA_DIR = path.join(process.cwd(), 'data');
    const filePath = path.join(DATA_DIR, PASSWORDS_FILE);
    
    // Verificar se a pasta data existe, caso contrário, criar
    try {
      await fs.access(DATA_DIR);
    } catch (error) {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
    
    // Escrever diretamente no arquivo para garantir
    await fs.writeFile(filePath, JSON.stringify(passwords, null, 2));
    
    console.log('Senhas atualizadas com sucesso!');
    return res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar senhas:', error);
    return res.status(500).json({ message: 'Erro ao atualizar senhas' });
  }
});

// POST /api/users/change-password - Rota específica para alteração de senha
router.post('/change-password', async (req: Request, res: Response) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    
    if (!userId || !currentPassword || !newPassword) {
      console.error('Dados incompletos:', { userId, currentPassword: !!currentPassword, newPassword: !!newPassword });
      return res.status(400).json({ 
        success: false, 
        message: 'Dados incompletos para alteração de senha' 
      });
    }
    
    console.log(`----- ALTERANDO SENHA -----`);
    console.log(`Usuário: ${userId}`);
    console.log(`Senha atual recebida: ${currentPassword}`);
    console.log(`Nova senha recebida: ${newPassword}`);
    
    // Garantir que o arquivo existe antes de ler
    const DATA_DIR = path.join(process.cwd(), 'data');
    const filePath = path.join(DATA_DIR, PASSWORDS_FILE);
    
    console.log(`Caminho do arquivo de senhas: ${filePath}`);
    
    // Verificar se a pasta data existe, caso contrário, criar
    try {
      await fs.access(DATA_DIR);
      console.log(`Diretório data existe.`);
    } catch (error) {
      console.log(`Diretório data não existe. Criando...`);
      await fs.mkdir(DATA_DIR, { recursive: true });
      console.log(`Diretório data criado.`);
    }
    
    let passwords: PasswordStore = {};
    
    try {
      console.log(`Tentando ler o arquivo de senhas...`);
      const data = await fs.readFile(filePath, 'utf8');
      passwords = JSON.parse(data);
      console.log(`Arquivo de senhas lido com sucesso.`);
      console.log(`Senhas atuais:`, passwords);
    } catch (error) {
      console.error(`Erro ao ler o arquivo de senhas:`, error);
      console.log(`Criando novo arquivo de senhas...`);
      passwords = {};
    }
    
    // Verificar se a senha atual está correta
    console.log(`Senha armazenada para o usuário ${userId}: ${passwords[userId]}`);
    console.log(`Senha fornecida: ${currentPassword}`);
    
    if (passwords[userId] !== currentPassword) {
      console.error(`Senha atual incorreta para o usuário ${userId}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Senha atual incorreta' 
      });
    }
    
    // Atualizar a senha
    console.log(`Senha atual validada com sucesso. Atualizando para a nova senha...`);
    passwords[userId] = newPassword;
    
    // Transformar em string JSON formatada
    const passwordsJson = JSON.stringify(passwords, null, 2);
    console.log(`Novo conteúdo do arquivo de senhas:`, passwordsJson);
    
    // Salvar as alterações
    try {
      await fs.writeFile(filePath, passwordsJson, 'utf8');
      console.log(`Arquivo de senhas atualizado com sucesso.`);
    } catch (error) {
      console.error(`Erro ao salvar o arquivo de senhas:`, error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao salvar a nova senha'
      });
    }
    
    console.log(`----- ALTERAÇÃO DE SENHA CONCLUÍDA COM SUCESSO -----`);
    return res.json({ 
      success: true, 
      message: 'Senha atualizada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno ao alterar senha' 
    });
  }
});

// GET /api/users/:id - Obter usuário específico
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const users = await readJsonFile<User[]>(USERS_FILE, []);
    const user = users.find(u => u.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    return res.json(user);
  } catch (error) {
    console.error('Erro ao ler usuário:', error);
    return res.status(500).json({ message: 'Erro ao obter usuário' });
  }
});

// POST /api/users - Criar novo usuário
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, role } = req.body;
    
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Dados incompletos' });
    }
    
    const users = await readJsonFile<User[]>(USERS_FILE, []);
    
    // Verificar se email já existe
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }
    
    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      role
    };
    
    users.push(newUser);
    await writeJsonFile(USERS_FILE, users);
    
    return res.status(201).json(newUser);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ message: 'Erro ao criar usuário' });
  }
});

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Dados incompletos' });
    }
    
    const users = await readJsonFile<User[]>(USERS_FILE, []);
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Verificar se o novo email já existe (exceto para o próprio usuário)
    const emailExists = users.some(u => 
      u.email.toLowerCase() === email.toLowerCase() && u.id !== req.params.id
    );
    
    if (emailExists) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }
    
    const updatedUser = {
      ...users[userIndex],
      name,
      email
    };
    
    users[userIndex] = updatedUser;
    await writeJsonFile(USERS_FILE, users);
    
    return res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
});

// DELETE /api/users/:id - Excluir usuário
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const users = await readJsonFile<User[]>(USERS_FILE, []);
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    users.splice(userIndex, 1);
    await writeJsonFile(USERS_FILE, users);
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return res.status(500).json({ message: 'Erro ao excluir usuário' });
  }
});

export default router; 