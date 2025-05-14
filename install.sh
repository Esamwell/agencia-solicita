#!/bin/bash

# Cores e estilos
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Ícones
CHECK_MARK="✓"
CROSS_MARK="✗"
ARROW="➜"
STAR="★"
INFO="ℹ"
WARNING="⚠"
ERROR="✖"
GEAR="⚙"
DATABASE="🗄"
SERVER="🌐"
SHIELD="🛡"
CODE="💻"
ROCKET="🚀"

# Funções de interface
print_header() {
    echo -e "\n${BOLD}${BLUE}${STAR} ${1}${NC}\n"
}

print_section() {
    echo -e "\n${BOLD}${CYAN}${GEAR} ${1}${NC}"
    echo -e "${CYAN}${ARROW} ${2}${NC}\n"
}

print_step() {
    echo -e "${BOLD}${MAGENTA}${ARROW} ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}${CHECK_MARK} ${1}${NC}"
}

print_error() {
    echo -e "${RED}${ERROR} ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}${WARNING} ${1}${NC}"
}

print_info() {
    echo -e "${BLUE}${INFO} ${1}${NC}"
}

# Barra de progresso
progress_bar() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local completed=$((width * current / total))
    local remaining=$((width - completed))
    
    printf "\r${BOLD}${CYAN}["
    printf "%${completed}s" | tr " " "█"
    printf "%${remaining}s" | tr " " "░"
    printf "] %d%%${NC}" $percentage
}

# Função para verificar se um comando foi executado com sucesso
check_command() {
    if [ $? -eq 0 ]; then
        print_success "$1"
        return 0
    else
        print_error "$2"
        return 1
    fi
}

# Função para esperar um serviço estar pronto
wait_for_service() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    print_step "Aguardando $service iniciar..."
    while [ $attempt -le $max_attempts ]; do
        if systemctl is-active --quiet $service; then
            print_success "$service está rodando!"
            return 0
        fi
        progress_bar $attempt $max_attempts
        sleep 1
        attempt=$((attempt + 1))
    done
    print_error "$service não iniciou após $max_attempts tentativas"
    return 1
}

# Função para verificar se um domínio está respondendo
check_domain() {
    local domain=$1
    local max_attempts=30
    local attempt=1
    
    print_step "Verificando se $domain está respondendo..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "https://$domain" > /dev/null; then
            print_success "$domain está respondendo!"
            return 0
        fi
        progress_bar $attempt $max_attempts
        sleep 2
        attempt=$((attempt + 1))
    done
    print_error "$domain não está respondendo após $max_attempts tentativas"
    return 1
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    print_error "Este script precisa ser executado como root (sudo)"
    exit 1
fi

# Banner
clear
echo -e "${BOLD}${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    HubSA2 - Instalador                     ║"
echo "║                                                            ║"
echo "║  Sistema de Gerenciamento de Solicitações                  ║"
echo "╚════════════════════════════════════════════════════════════╝${NC}"

print_header "Iniciando instalação do HubSA2"
print_info "Este script irá configurar todo o ambiente necessário para o HubSA2"
print_info "Domínios: sistema.hubsa2.com.br e api.hubsa2.com.br"

# Diretórios
BASE_DIR="/var/www"
SYSTEM_DIR="$BASE_DIR/sistema.hubsa2.com.br"
API_DIR="$BASE_DIR/api.hubsa2.com.br"
BACKUP_DIR="$BASE_DIR/backups"

# Criar diretórios
print_section "Estrutura de Diretórios" "Criando diretórios necessários..."
mkdir -p $SYSTEM_DIR $API_DIR $BACKUP_DIR
print_success "Diretórios criados com sucesso!"

# Instalar dependências do sistema
print_section "Dependências do Sistema" "Instalando pacotes necessários..."
print_step "Atualizando repositórios..."
apt update > /dev/null 2>&1
progress_bar 1 5

print_step "Instalando Nginx..."
apt install -y nginx > /dev/null 2>&1
progress_bar 2 5

print_step "Instalando PostgreSQL..."
apt install -y postgresql postgresql-contrib > /dev/null 2>&1
progress_bar 3 5

print_step "Instalando Certbot..."
apt install -y certbot python3-certbot-nginx > /dev/null 2>&1
progress_bar 4 5

print_step "Instalando outras dependências..."
apt install -y curl git ufw > /dev/null 2>&1
progress_bar 5 5
print_success "Todas as dependências foram instaladas!"

# Configurar PostgreSQL
print_section "Banco de Dados" "Configurando PostgreSQL..."
print_step "Criando banco de dados..."
sudo -u postgres psql -c "CREATE DATABASE agencia_solicita;" > /dev/null 2>&1
progress_bar 1 3

print_step "Criando usuário..."
sudo -u postgres psql -c "CREATE USER agencia_user WITH ENCRYPTED PASSWORD 'SUA_SENHA_SEGURA';" > /dev/null 2>&1
progress_bar 2 3

print_step "Configurando permissões..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE agencia_solicita TO agencia_user;" > /dev/null 2>&1
progress_bar 3 3
print_success "Banco de dados configurado com sucesso!"

# Configurar Nginx
print_section "Servidor Web" "Configurando Nginx..."
print_step "Configurando virtual hosts..."

# Configuração do sistema (frontend)
cat > /etc/nginx/sites-available/sistema.hubsa2.com.br << 'EOL'
server {
    listen 80;
    server_name sistema.hubsa2.com.br;

    root /var/www/sistema.hubsa2.com.br/dist;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache para arquivos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 30d;
            add_header Cache-Control "public, no-transform";
        }
    }

    # Configurações de segurança
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
EOL

# Configuração da API (backend)
cat > /etc/nginx/sites-available/api.hubsa2.com.br << 'EOL'
server {
    listen 80;
    server_name api.hubsa2.com.br;

    # API
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Configurações de segurança
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
EOL

print_step "Habilitando sites..."
ln -sf /etc/nginx/sites-available/sistema.hubsa2.com.br /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/api.hubsa2.com.br /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
progress_bar 1 2

print_step "Reiniciando Nginx..."
nginx -t > /dev/null 2>&1 && systemctl restart nginx
progress_bar 2 2
print_success "Nginx configurado com sucesso!"

# Configurar SSL
print_section "Segurança" "Configurando SSL..."
print_step "Obtendo certificados SSL..."
certbot --nginx -d sistema.hubsa2.com.br -d api.hubsa2.com.br --non-interactive --agree-tos --email seu-email@hubsa2.com.br > /dev/null 2>&1
print_success "SSL configurado com sucesso!"

# Configurar Firewall
print_section "Firewall" "Configurando regras de segurança..."
print_step "Configurando UFW..."
ufw default deny incoming > /dev/null 2>&1
ufw default allow outgoing > /dev/null 2>&1
ufw allow ssh > /dev/null 2>&1
ufw allow http > /dev/null 2>&1
ufw allow https > /dev/null 2>&1
ufw --force enable > /dev/null 2>&1
print_success "Firewall configurado com sucesso!"

# Instalar Node.js
print_section "Ambiente Node.js" "Configurando ambiente de desenvolvimento..."
print_step "Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash - > /dev/null 2>&1
apt install -y nodejs > /dev/null 2>&1
progress_bar 1 2

print_step "Instalando PM2..."
npm install -g pm2 > /dev/null 2>&1
progress_bar 2 2
print_success "Node.js e PM2 instalados com sucesso!"

# Criar arquivo de configuração do PM2
print_section "Process Manager" "Configurando PM2..."
cat > $API_DIR/ecosystem.config.js << 'EOL'
module.exports = {
  apps: [{
    name: "hubsa2-api",
    script: "npm",
    args: "start",
    cwd: "/var/www/api.hubsa2.com.br",
    env: {
      NODE_ENV: "production",
      PORT: 8080,
      DATABASE_URL: "postgresql://agencia_user:SUA_SENHA_SEGURA@localhost:5432/agencia_solicita?schema=public"
    },
    instances: "max",
    exec_mode: "cluster",
    watch: false,
    max_memory_restart: "1G"
  }]
}
EOL
print_success "PM2 configurado com sucesso!"

# Criar script de backup
print_section "Backup" "Configurando sistema de backup..."
cat > $BASE_DIR/backup.sh << 'EOL'
#!/bin/bash

# Configurações
BACKUP_DIR="/var/backups/hubsa2"
DB_NAME="agencia_solicita"
DB_USER="agencia_user"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Criar backup
pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

# Manter apenas os últimos 7 backups
ls -t $BACKUP_DIR/backup_*.sql.gz | tail -n +8 | xargs -r rm
EOL

chmod +x $BASE_DIR/backup.sh
(crontab -l 2>/dev/null; echo "0 2 * * * $BASE_DIR/backup.sh") | crontab -
print_success "Sistema de backup configurado!"

# Criar script de deploy
print_section "Deploy" "Configurando script de deploy..."
cat > $BASE_DIR/deploy.sh << 'EOL'
#!/bin/bash

# Diretórios
SYSTEM_DIR="/var/www/sistema.hubsa2.com.br"
API_DIR="/var/www/api.hubsa2.com.br"

# Deploy do Frontend
echo "Deployando frontend..."
cd $SYSTEM_DIR
git pull
npm install
npm run build

# Deploy do Backend
echo "Deployando backend..."
cd $API_DIR
git pull
npm install
npx prisma migrate deploy
pm2 restart hubsa2-api

echo "Deploy concluído!"
EOL

chmod +x $BASE_DIR/deploy.sh
print_success "Script de deploy configurado!"

# Configurar permissões
print_section "Permissões" "Ajustando permissões dos arquivos..."
chown -R $SUDO_USER:$SUDO_USER $BASE_DIR
print_success "Permissões configuradas!"

# Configurar repositórios
print_section "Código Fonte" "Configurando repositórios..."

# Solicitar URLs dos repositórios
echo -e "\n${BOLD}${YELLOW}${WARNING} URLs dos Repositórios${NC}"
read -p "URL do repositório frontend (ex: https://github.com/seu-usuario/hubsa2-frontend.git): " FRONTEND_REPO
read -p "URL do repositório backend (ex: https://github.com/seu-usuario/hubsa2-backend.git): " BACKEND_REPO

print_step "Clonando repositório frontend..."
git clone $FRONTEND_REPO $SYSTEM_DIR
check_command "Frontend clonado com sucesso" "Erro ao clonar frontend"

print_step "Clonando repositório backend..."
git clone $BACKEND_REPO $API_DIR
check_command "Backend clonado com sucesso" "Erro ao clonar backend"

# Configurar variáveis de ambiente
print_section "Configuração" "Configurando variáveis de ambiente..."

# Gerar senha aleatória para o banco
DB_PASSWORD=$(openssl rand -base64 12)
JWT_SECRET=$(openssl rand -base64 32)

# Configurar .env do backend
cat > $API_DIR/.env << EOL
DATABASE_URL="postgresql://agencia_user:${DB_PASSWORD}@localhost:5432/agencia_solicita?schema=public"
PORT=8080
JWT_SECRET="${JWT_SECRET}"
EOL

# Configurar .env do frontend
cat > $SYSTEM_DIR/.env << EOL
VITE_API_URL="https://api.hubsa2.com.br"
EOL

# Atualizar configuração do PM2 com a nova senha
sed -i "s/SUA_SENHA_SEGURA/${DB_PASSWORD}/g" $API_DIR/ecosystem.config.js

# Atualizar configuração do PostgreSQL
sudo -u postgres psql -c "ALTER USER agencia_user WITH PASSWORD '${DB_PASSWORD}';"

# Criar usuário padrão
print_section "Usuário Padrão" "Criando usuário administrador inicial..."

# Gerar senha aleatória para o admin
ADMIN_PASSWORD=$(openssl rand -base64 8)

# Criar arquivo de seed temporário
cat > $API_DIR/prisma/seed-admin.ts << EOL
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('${ADMIN_PASSWORD}', 10)
  
  await prisma.user.upsert({
    where: { email: 'admin@hubsa2.com.br' },
    update: {},
    create: {
      email: 'admin@hubsa2.com.br',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '(00) 00000-0000',
      since: new Date()
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
EOL

# Executar deploy inicial
print_section "Deploy" "Realizando deploy inicial..."

print_step "Instalando dependências do frontend..."
cd $SYSTEM_DIR
npm install > /dev/null 2>&1
check_command "Dependências do frontend instaladas" "Erro ao instalar dependências do frontend"

print_step "Instalando dependências do backend..."
cd $API_DIR
npm install > /dev/null 2>&1
check_command "Dependências do backend instaladas" "Erro ao instalar dependências do backend"

print_step "Gerando cliente Prisma..."
npx prisma generate > /dev/null 2>&1
check_command "Cliente Prisma gerado" "Erro ao gerar cliente Prisma"

print_step "Executando migrações do banco..."
npx prisma migrate deploy > /dev/null 2>&1
check_command "Migrações executadas" "Erro ao executar migrações"

print_step "Criando usuário administrador..."
npx tsx prisma/seed-admin.ts > /dev/null 2>&1
check_command "Usuário administrador criado" "Erro ao criar usuário administrador"

print_step "Construindo frontend..."
cd $SYSTEM_DIR
npm run build > /dev/null 2>&1
check_command "Frontend construído" "Erro ao construir frontend"

print_step "Iniciando backend..."
cd $API_DIR
pm2 start ecosystem.config.js > /dev/null 2>&1
check_command "Backend iniciado" "Erro ao iniciar backend"

# Verificar serviços
print_section "Verificação" "Verificando serviços..."

wait_for_service "nginx"
wait_for_service "postgresql"

# Verificar domínios
check_domain "sistema.hubsa2.com.br"
check_domain "api.hubsa2.com.br"

# Remover arquivo de seed temporário
rm $API_DIR/prisma/seed-admin.ts

# Resumo da instalação
print_header "Instalação Concluída!"
echo -e "${BOLD}${GREEN}${ROCKET} O HubSA2 foi instalado e está pronto para uso!${NC}\n"

echo -e "${BOLD}${CYAN}Credenciais de Acesso:${NC}"
echo -e "${ARROW} ${BOLD}URL do Sistema:${NC} ${GREEN}https://sistema.hubsa2.com.br${NC}"
echo -e "${ARROW} ${BOLD}Email:${NC} ${GREEN}admin@hubsa2.com.br${NC}"
echo -e "${ARROW} ${BOLD}Senha:${NC} ${GREEN}${ADMIN_PASSWORD}${NC}"

echo -e "\n${BOLD}${YELLOW}${WARNING} Importante:${NC}"
echo -e "${ARROW} Altere a senha do administrador no primeiro acesso"
echo -e "${ARROW} Mantenha estas credenciais em um local seguro"
echo -e "${ARROW} A senha do banco de dados foi configurada automaticamente"

echo -e "\n${BOLD}${GREEN}${CHECK_MARK} Suporte:${NC}"
echo -e "${ARROW} Em caso de problemas, verifique os logs em:"
echo -e "   ${BLUE}Frontend:${NC} /var/www/sistema.hubsa2.com.br/logs"
echo -e "   ${BLUE}Backend:${NC} /var/www/api.hubsa2.com.br/logs"
echo -e "   ${BLUE}Nginx:${NC} /var/log/nginx/"
echo -e "   ${BLUE}PM2:${NC} pm2 logs hubsa2-api"

echo -e "\n${BOLD}${MAGENTA}${STAR} Obrigado por escolher o HubSA2!${NC}"
echo -e "${ARROW} Seu sistema está pronto em: ${GREEN}https://sistema.hubsa2.com.br${NC}\n" 