import { promises as fs } from 'fs';
import path from 'path';

// Caminho para a pasta de dados
const DATA_DIR = path.join(process.cwd(), 'data');

// Função para garantir que a pasta data exista
export const ensureDataDir = async (): Promise<void> => {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    // Se a pasta não existir, cria
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
};

// Função para ler um arquivo JSON
export const readJsonFile = async <T>(filename: string, defaultValue: T): Promise<T> => {
  await ensureDataDir();
  
  try {
    // Remove 'data/' do início do filename se existir
    const cleanFilename = filename.replace(/^data\//, '');
    const filePath = path.join(DATA_DIR, cleanFilename);
    
    // Tenta ler o arquivo
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data) as T;
  } catch (error) {
    // Se o arquivo não existir ou outro erro ocorrer, retorna o valor padrão
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Remove 'data/' do início do filename se existir
      const cleanFilename = filename.replace(/^data\//, '');
      const filePath = path.join(DATA_DIR, cleanFilename);
      
      // Cria o arquivo com o valor padrão
      await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    throw error;
  }
};

// Função para gravar em um arquivo JSON
export const writeJsonFile = async <T>(filename: string, data: T): Promise<void> => {
  await ensureDataDir();
  
  // Remove 'data/' do início do filename se existir
  const cleanFilename = filename.replace(/^data\//, '');
  const filePath = path.join(DATA_DIR, cleanFilename);
  
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}; 