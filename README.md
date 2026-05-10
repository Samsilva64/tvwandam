# TV WANDAM

Monorepo com **Next.js (App Router)** no diretório `frontend` e **API Express + Prisma + MySQL** no diretório `backend`.

## Pré-requisitos

- Node.js 20+
- MySQL 8+ local, MySQL Workbench ou Docker. Na raiz existe `docker-compose.yml` com MySQL 8.

## Base de dados

1. Copie `backend/.env.example` para `backend/.env` e ajuste `DATABASE_URL`, `JWT_SECRET` e `FRONTEND_URL`.
2. Para importar tudo que a TV Wandam publicou no YouTube, adicione também:

```env
YOUTUBE_CHANNEL_ID="UCQQFSDHUUuavl2q9YAXAgBQ"
YOUTUBE_API_KEY="sua-chave-da-youtube-data-api"
```

Crie a chave em Google Cloud Console, ativando a **YouTube Data API v3**. Sem essa chave, o sistema mantém os conteúdos já cadastrados, mas não consegue puxar todos os vídeos, Shorts e playlists do canal.
3. Se usar Docker, suba o banco a partir da raiz:

```bash
docker compose up -d
```

4. Na pasta `backend`, gere o Prisma Client, sincronize o schema e rode o seed:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

5. Para sincronizar todos os vídeos, Shorts, podcasts identificados e playlists do canal TV Wandam:

```bash
cd backend
npm run youtube:sync
```

O comando recria as secções `Todos os vídeos`, `Shorts`, `Podcasts` e uma secção para cada playlist oficial encontrada no canal. Rode novamente sempre que quiser atualizar o site com novas publicações do YouTube.

Além das playlists oficiais, o sync também organiza automaticamente programas temáticos no painel com nomes de playlist:
`Playlist Todos os vídeos`, `Playlist Shorts`, `Playlist Músicas`, `Playlist Eventos` e `Playlist Podcasts`.

Para atualizar apenas conteúdos que **não** foram editados manualmente no admin:

```bash
cd backend
npm run youtube:refresh
```

Nesse modo, itens marcados como editados manualmente pelo admin não são sobrescritos pelo sync.

Se quiser liberar conteúdos editados manualmente para voltarem a receber atualização do YouTube, use os endpoints admin:

- `POST /api/programs/unlock-sync` com body opcional `{ "ids": ["..."] }` para programas específicos, ou vazio para desbloquear todos os programas YouTube.
- `POST /api/episodes/unlock-sync` com body opcional `{ "ids": ["..."] }` ou `{ "programId": "..." }` para episódios específicos.

Também é possível disparar sync pelo próprio admin (sem terminal):

- `POST /api/admin/youtube/sync` com body `{ "refreshNonManual": true }` para atualizar somente conteúdos não editados manualmente.

Para o portfólio, a API já devolve conteúdos no mesmo padrão de organização do YouTube:

- `GET /api/episodes?youtubeOnly=true&sort=recent&take=50` → mais recentes
- `GET /api/episodes?youtubeOnly=true&sort=oldest&take=50` → mais antigos
- `GET /api/episodes?youtubeOnly=true&sort=popular&take=50` → mais populares
- `GET /api/episodes/portfolio?take=50` → devolve tudo junto em `{ maisRecentes, maisAntigos, maisPopulares }`

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

Defina `NEXT_PUBLIC_API_URL` (URL da API), `NEXT_PUBLIC_SITE_URL` (URL pública do site para SEO / sitemap) e, se quiser contacto direto pelo WhatsApp, `NEXT_PUBLIC_WHATSAPP_NUMBER`.

Exemplo:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_WHATSAPP_NUMBER="245XXXXXXXXX"
```

Use o número do WhatsApp em formato internacional, sem `+`, espaços ou traços. Se essa variável não estiver definida, o botão abre o WhatsApp com uma mensagem pronta, mas sem destinatário fixo.

## Painel admin

O painel fica escondido no menu público.

- Acesso direto: `http://localhost:3000/admin/login`
- Atalho escondido no site: pressione `Ctrl + Alt + A`; o link `Admin` aparece no menu.
- Credenciais criadas pelo seed local: `admin@tvwandem.local` / `admin123`

Depois do login, o link `Admin` fica visível. Ao clicar em `Sair`, ele volta a ficar escondido.

## Produção

- **Backend:** `npm run build && npm start` (usa `dist/index.js`).
- **Frontend:** `npm run build && npm start`.

## Funcionalidades principais

- Página inicial com vídeos, transmissões, programação, notícias e parceiros.
- Programas, episódios, notícias, artistas, parceiros e conteúdos do canal oficial da TV Wandam.
- Sincronização do YouTube para importar vídeos, Shorts, podcasts e playlists do canal TV Wandam por categoria.
- Painel admin em `/admin` com JWT para gerir programas, episódios, notícias, lives, parceiros e uploads.
