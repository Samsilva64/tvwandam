# TV WANDAM 2.0

Monorepo com **Next.js (App Router)** no diretório `frontend` e **API Express + Prisma + MySQL** no diretório `backend`.

## Pré-requisitos

- Node.js 20+
- MySQL 8+ local, MySQL Workbench ou Docker. Na raiz existe `docker-compose.yml` com MySQL 8.

## Base de dados

1. Copie `backend/.env.example` para `backend/.env` e ajuste `DATABASE_URL`, `JWT_SECRET` e `FRONTEND_URL`.
2. Se usar Docker, suba o banco a partir da raiz:

```bash
docker compose up -d
```

3. Na pasta `backend`, gere o Prisma Client, sincronize o schema e rode o seed:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

Exemplo de `DATABASE_URL` para MySQL local/Docker:

```env
DATABASE_URL="mysql://tvwandam:tvwandam@localhost:3306/tvwandam"
```

Credenciais de seed (alterar em produção): `admin@tvwandem.local` / `admin123`.

## Backend (API)

```bash
cd backend
npm install
npm run dev
```

Servidor em `http://localhost:4000` com health check em `GET /api/health`. Uploads ficam em `backend/uploads` e são servidos em `/uploads/...`.

## Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Defina `NEXT_PUBLIC_API_URL` (URL da API) e `NEXT_PUBLIC_SITE_URL` (URL pública do site para SEO / sitemap).

## Produção

- **Backend:** `npm run build && npm start` (usa `dist/index.js`).
- **Frontend:** `npm run build && npm start`.

## Funcionalidades principais

- Página inicial com hero em vídeo, seção ao vivo, episódios, grade de programação do dia, destaques e parceiros.
- Programas, episódios com contagem de visualizações, transmissões ao vivo com status e contagem regressiva, notícias com slugs e categorias, artistas com contato por e-mail e parceiros por nível.
- Painel admin em `/admin` com JWT (login em `/admin/login`), criação de programas, episódios, notícias, lives, parceiros e upload de arquivos.

Roteiro sugerido: HLS próprio no mesmo modelo de `LiveStream`, métricas reais em `/api/stats/audience` e integração com WhatsApp para campanhas.
