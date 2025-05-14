#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Função para imprimir mensagens
print_message() {
    echo -e "${GREEN}[SPLIT]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script na raiz do projeto"
    exit 1
fi

# Criar diretórios temporários
TEMP_DIR="temp_split"
FRONTEND_DIR="$TEMP_DIR/frontend"
BACKEND_DIR="$TEMP_DIR/backend"

mkdir -p $FRONTEND_DIR $BACKEND_DIR

# Copiar arquivos do frontend
print_message "Copiando arquivos do frontend..."
cp -r src/pages $FRONTEND_DIR/
cp -r src/components $FRONTEND_DIR/
cp -r src/context $FRONTEND_DIR/
cp -r src/hooks $FRONTEND_DIR/
cp -r src/lib $FRONTEND_DIR/
cp -r src/types $FRONTEND_DIR/
cp -r src/utils $FRONTEND_DIR/
cp -r public $FRONTEND_DIR/
cp .env.example $FRONTEND_DIR/.env
cp index.html $FRONTEND_DIR/
cp tsconfig.json $FRONTEND_DIR/
cp vite.config.ts $FRONTEND_DIR/
cp tailwind.config.js $FRONTEND_DIR/
cp postcss.config.js $FRONTEND_DIR/

# Criar package.json do frontend
cat > $FRONTEND_DIR/package.json << 'EOL'
{
  "name": "hubsa2-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  },
  "dependencies": {
    "@fullcalendar/core": "^6.1.17",
    "@fullcalendar/daygrid": "^6.1.17",
    "@fullcalendar/interaction": "^6.1.17",
    "@fullcalendar/react": "^6.1.17",
    "@fullcalendar/timegrid": "^6.1.17",
    "@hookform/resolvers": "^3.9.0",
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-alert-dialog": "^1.1.1",
    "@radix-ui/react-aspect-ratio": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-checkbox": "^1.1.1",
    "@radix-ui/react-collapsible": "^1.1.0",
    "@radix-ui/react-context-menu": "^2.2.1",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-hover-card": "^1.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-menubar": "^1.1.1",
    "@radix-ui/react-navigation-menu": "^1.2.0",
    "@radix-ui/react-popover": "^1.1.1",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.0",
    "@radix-ui/react-scroll-area": "^1.1.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slider": "^1.2.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.1",
    "@radix-ui/react-toggle": "^1.1.0",
    "@radix-ui/react-toggle-group": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.4",
    "@tanstack/react-query": "^5.56.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.3.0",
    "input-otp": "^1.2.4",
    "lucide-react": "^0.462.0",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.53.0",
    "react-resizable-panels": "^2.1.3",
    "react-router-dom": "^6.26.2",
    "recharts": "^2.12.7",
    "sonner": "^1.5.0",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.3",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.0",
    "@tailwindcss/typography": "^0.5.15",
    "@types/node": "^22.5.5",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react-swc": "^3.5.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.9.0",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.9",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.11",
    "typescript": "^5.5.3",
    "vite": "^5.4.1"
  }
}
EOL

# Copiar arquivos do backend
print_message "Copiando arquivos do backend..."
cp -r src/api $BACKEND_DIR/
cp -r prisma $BACKEND_DIR/
cp -r src/types $BACKEND_DIR/
cp .env.example $BACKEND_DIR/.env

# Criar package.json do backend
cat > $BACKEND_DIR/package.json << 'EOL'
{
  "name": "hubsa2-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "tsx watch src/api/index.ts",
    "build": "tsc",
    "dev": "tsx watch src/api/index.ts",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^6.7.0",
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "express": "^4.18.3",
    "pg": "^8.16.0",
    "prisma": "^6.7.0",
    "uuid": "^11.1.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^22.5.5",
    "tsx": "^4.19.3",
    "typescript": "^5.5.3"
  }
}
EOL

# Criar tsconfig.json do backend
cat > $BACKEND_DIR/tsconfig.json << 'EOL'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOL

# Criar .gitignore para ambos
cat > $FRONTEND_DIR/.gitignore << 'EOL'
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
EOL

cp $FRONTEND_DIR/.gitignore $BACKEND_DIR/.gitignore

# Criar README.md para ambos
cat > $FRONTEND_DIR/README.md << 'EOL'
# HubSA2 - Frontend

Sistema de gerenciamento de solicitações da HubSA2.

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Criar build de produção
npm run build
```

## Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example` com as seguintes variáveis:

```
VITE_API_URL=https://api.hubsa2.com.br
```
EOL

cat > $BACKEND_DIR/README.md << 'EOL'
# HubSA2 - Backend

API do sistema de gerenciamento de solicitações da HubSA2.

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Criar build de produção
npm run build

# Executar migrações do banco
npm run prisma:migrate

# Popular banco com dados iniciais
npm run prisma:seed
```

## Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example` com as seguintes variáveis:

```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/agencia_solicita?schema=public"
PORT=8080
JWT_SECRET="seu-segredo-jwt-aqui"
```
EOL

print_message "Separação concluída!"
print_message "Frontend está em: $FRONTEND_DIR"
print_message "Backend está em: $BACKEND_DIR"
print_message "Próximos passos:"
print_message "1. Crie dois novos repositórios no GitHub"
print_message "2. Inicialize os repositórios em cada diretório:"
print_message "   cd $FRONTEND_DIR && git init && git add . && git commit -m 'Initial commit'"
print_message "   cd $BACKEND_DIR && git init && git add . && git commit -m 'Initial commit'"
print_message "3. Adicione os remotes e faça push:"
print_message "   git remote add origin SEU_REPOSITORIO_FRONTEND"
print_message "   git remote add origin SEU_REPOSITORIO_BACKEND"
print_message "   git push -u origin main" 