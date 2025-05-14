import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Função para alterar a senha
function changePassword(userId, newPassword) {
  // Caminho para o arquivo de senhas
  const passwordFile = join(__dirname, 'data', 'passwords.json');
  
  console.log(`Alterando senha para o usuário: ${userId}`);
  console.log(`Nova senha: ${newPassword}`);
  
  try {
    // Ler o arquivo de senhas atual
    const data = readFileSync(passwordFile, 'utf8');
    const passwords = JSON.parse(data);
    
    console.log('Senhas atuais:', passwords);
    
    // Alterar a senha
    passwords[userId] = newPassword;
    
    console.log('Senhas atualizadas:', passwords);
    
    // Salvar o arquivo
    writeFileSync(passwordFile, JSON.stringify(passwords, null, 2));
    
    console.log('Senha alterada com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao alterar a senha:', error);
    return false;
  }
}

// Alterar a senha do admin
const result = changePassword('admin-1', '654321');
console.log(`Resultado da operação: ${result ? 'Sucesso' : 'Falha'}`); 