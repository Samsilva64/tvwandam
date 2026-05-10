# TV WANDAM - Frontend

Frontend em **Next.js (App Router)** para a plataforma TV WANDAM. Consome a API Express do diretório `backend`.

## Pré-requisitos

- Node.js 20+
- Backend rodando em `http://localhost:4000`

## Configuração

Copie o exemplo de ambiente:

```bash
cp .env.example .env.local
```

Variáveis usadas:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_WHATSAPP_NUMBER="245XXXXXXXXX"
```

`NEXT_PUBLIC_WHATSAPP_NUMBER` é opcional. Use o número em formato internacional, sem `+`, espaços ou traços, para o botão de contacto abrir diretamente no WhatsApp da equipa TV Wandam.

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra `http://localhost:3000` no navegador.

## Scripts

- `npm run dev`: inicia o ambiente de desenvolvimento.
- `npm run build`: gera a versão de produção.
- `npm run start`: inicia a versão de produção.
- `npm run lint`: executa o ESLint.

## Páginas principais

- `/`: página inicial com destaque, programação, notícias e parceiros.
- `/ao-vivo`: transmissões ao vivo.
- `/programas`: vídeos, Shorts, podcasts e playlists organizados por categoria.
- `/noticias`: área editorial.
- `/artistas`: perfis de artistas e talentos.
- `/parceiros`: marcas e planos de publicidade.
- `/admin`: painel administrativo protegido por JWT.

## Painel admin

O painel não aparece no menu público por padrão.

- Acesso direto: `http://localhost:3000/admin/login`
- Atalho escondido: pressione `Ctrl + Alt + A` em qualquer página do site.
- Credenciais locais do seed: `admin@tvwandem.local` / `admin123`

## Observações

O site depende de `NEXT_PUBLIC_API_URL` para buscar dados. Se a API estiver desligada ou sem seed, algumas seções podem aparecer vazias.
