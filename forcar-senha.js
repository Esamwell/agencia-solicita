// Este script FORÇA a alteração da senha do admin diretamente no arquivo
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho absoluto para o arquivo de senhas
const passwordFile = path.join(__dirname, 'data', 'passwords.json');

// Nova senha que você quer definir (altere aqui se quiser)
const NOVA_SENHA = '123456';

async function forceTrocarSenha() {
  console.log('=== ALTERAÇÃO FORÇADA DE SENHA ===');
  console.log(`Arquivo de senhas: ${passwordFile}`);
  
  try {
    // Ler arquivo atual se existir
    let senhas = {};
    try {
      const conteudo = await fs.readFile(passwordFile, 'utf8');
      senhas = JSON.parse(conteudo);
      console.log('Senhas atuais:', senhas);
    } catch (erro) {
      console.log('Arquivo não existe ou está corrompido. Criando novo arquivo.');
    }
    
    // Definir a nova senha para admin-1
    console.log(`Alterando senha do admin-1 para: ${NOVA_SENHA}`);
    senhas['admin-1'] = NOVA_SENHA;
    
    // Forçar criação do diretório data se não existir
    try {
      await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
    } catch (erro) {
      // Ignorar erro se diretório já existir
    }
    
    // Salvar o arquivo
    await fs.writeFile(
      passwordFile, 
      JSON.stringify(senhas, null, 2), 
      { encoding: 'utf8', flag: 'w' }
    );
    
    console.log('Arquivo de senhas salvo com sucesso!');
    console.log('Novas senhas:', senhas);
    console.log('\nSENHA ALTERADA COM SUCESSO!');
    console.log(`A senha do admin agora é: ${NOVA_SENHA}`);
    console.log('=== OPERAÇÃO CONCLUÍDA ===');
  } catch (erro) {
    console.error('ERRO AO ALTERAR SENHA:', erro);
  }
}

// Executar a função
forceTrocarSenha(); 