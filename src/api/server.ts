import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import requestRoutes from './routes/requestRoutes';
import userRoutes from './routes/userRoutes';
import { ensureDataDir } from './services/fileService';
import fs from 'fs/promises';

// Inicializa o app Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware para desabilitar cache nas respostas
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Garantir que a pasta de dados exista
ensureDataDir();

// Rota simples e direta para alterar senha
app.post('/api/update-password', async (req, res) => {
  try {
    console.log('=====================================================');
    console.log('REQUISIÇÃO DE ALTERAÇÃO DE SENHA RECEBIDA');
    console.log('=====================================================');
    console.log('Corpo da requisição:', req.body);
    const { userId, currentPassword, newPassword } = req.body;
    
    if (!userId || !currentPassword || !newPassword) {
      console.log('ERRO: Dados incompletos', { 
        userId, 
        currentPassword: currentPassword ? '(preenchido)' : '(vazio)', 
        newPassword: newPassword ? '(preenchido)' : '(vazio)'
      });
      return res.status(400).json({ success: false, message: 'Dados incompletos para alteração de senha' });
    }
    
    console.log(`ID do usuário: ${userId}`);
    console.log(`Senha atual recebida: ${currentPassword}`);
    console.log(`Nova senha recebida: ${newPassword}`);
    
    // Ler arquivo de senhas
    const passwordFile = path.join(process.cwd(), 'data', 'passwords.json');
    console.log(`Arquivo de senhas: ${passwordFile}`);
    
    let passwords = {};
    
    try {
      const data = await fs.readFile(passwordFile, 'utf8');
      passwords = JSON.parse(data);
      console.log('Senhas armazenadas no arquivo:', passwords);
    } catch (error) {
      console.log('ERRO: Não foi possível ler o arquivo de senhas:', error);
      console.log('Criando arquivo de senhas vazio');
      passwords = {};
    }
    
    // Verificar senha atual
    console.log(`Senha armazenada para usuário ${userId}: "${passwords[userId]}"`);
    console.log(`Senha atual fornecida: "${currentPassword}"`);
    
    if (passwords[userId] !== currentPassword) {
      console.log('ERRO: Senha atual incorreta');
      return res.status(400).json({ 
        success: false, 
        message: 'Senha atual incorreta',
        debug: {
          stored: passwords[userId],
          provided: currentPassword,
          match: passwords[userId] === currentPassword
        }
      });
    }
    
    // Atualizar senha
    console.log(`Atualizando senha do usuário ${userId} para: "${newPassword}"`);
    passwords[userId] = newPassword;
    
    // Salvar alterações
    await fs.writeFile(passwordFile, JSON.stringify(passwords, null, 2), 'utf8');
    console.log('Arquivo de senhas atualizado com sucesso');
    console.log('Novas senhas:', passwords);
    
    console.log('=====================================================');
    console.log('ALTERAÇÃO DE SENHA CONCLUÍDA COM SUCESSO');
    console.log('=====================================================');
    
    return res.json({ 
      success: true, 
      message: 'Senha atualizada com sucesso'
    });
  } catch (error) {
    console.error('ERRO AO PROCESSAR ALTERAÇÃO DE SENHA:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno ao processar alteração de senha'
    });
  }
});

// Rota especial para forçar a alteração de senha (não verifica senha atual)
app.post('/api/force-password', async (req, res) => {
  try {
    console.log('=====================================================');
    console.log('FORÇANDO ALTERAÇÃO DE SENHA (MODO EMERGÊNCIA)');
    console.log('=====================================================');

    const { userId, newPassword } = req.body;
    
    if (!userId || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Precisa informar userId e newPassword' 
      });
    }
    
    console.log(`ID do usuário: ${userId}`);
    console.log(`Nova senha: ${newPassword}`);
    
    // Ler arquivo de senhas
    const passwordFile = path.join(process.cwd(), 'data', 'passwords.json');
    console.log(`Arquivo de senhas: ${passwordFile}`);
    
    let passwords = {};
    
    try {
      const data = await fs.readFile(passwordFile, 'utf8');
      passwords = JSON.parse(data);
      console.log('Senhas armazenadas no arquivo:', passwords);
    } catch (error) {
      console.log('Erro ao ler senhas, criando novo arquivo');
      passwords = {};
    }
    
    // Atualizar senha diretamente, sem verificar a atual
    console.log(`Forçando alteração de senha para: "${newPassword}"`);
    passwords[userId] = newPassword;
    
    // Salvar alterações
    await fs.writeFile(passwordFile, JSON.stringify(passwords, null, 2), 'utf8');
    console.log('Arquivo de senhas atualizado com sucesso');
    console.log('Novas senhas:', passwords);
    
    console.log('=====================================================');
    console.log('ALTERAÇÃO FORÇADA CONCLUÍDA COM SUCESSO');
    console.log('=====================================================');
    
    return res.json({ 
      success: true, 
      message: 'Senha alterada com sucesso (modo emergência)' 
    });
  } catch (error) {
    console.error('ERRO AO FORÇAR ALTERAÇÃO DE SENHA:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno ao processar alteração de senha' 
    });
  }
});

// Rotas da API
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);

// Porta da aplicação
const PORT = process.env.PORT || 3001;

// Inicia o servidor
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
};

// Exporta funções para uso externo
export { app, startServer }; 