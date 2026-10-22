# Normas Atualizadas (Hogrefe) — Parte 1

Plataforma com cadastro/login e consulta protegida de tabelas de normas. Next.js 16 (App Router), next-auth v4 (Credentials, sessão JWT), MySQL 8 via `mysql2`, sem ORM.

Documentação do projeto: [`docs/parte-1/ARCHITECTURE.md`](docs/parte-1/ARCHITECTURE.md) e as tasks em `docs/parte-1/`.

## Rodando localmente

Pré-requisitos: Node 20+ e Docker Desktop (ou um MySQL 8 local, veja abaixo).

```bash
npm install
# crie o .env (veja "Variáveis de ambiente")
npm run db:up      # sobe o MySQL 8.4 e cria as tabelas (db/schema.sql) na primeira subida
npm run db:seed    # usuário de teste + tabelas de db/seed/*.json (pode rodar várias vezes)
npm run dev        # http://localhost:3000
```

Na primeira subida o MySQL leva 1–2 minutos para ficar pronto; se o `db:seed` falhar com "Connection lost", espere um pouco e rode de novo.

Usuário de teste: `teste@normas.local` / `Teste@123`.

Outros scripts de banco: `npm run db:down` (para o container) e `npm run db:reset` (apaga o volume e recria do zero; rode `db:seed` depois).

**Sem Docker:** funciona com qualquer MySQL 8 local (XAMPP/Laragon/instalação nativa). Crie o banco e o usuário, rode `db/schema.sql` e aponte as variáveis `DB_*` do `.env` para ele.

## Variáveis de ambiente

O `.env` não é versionado. Valores de desenvolvimento (os mesmos do `docker-compose.yml`):

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=normas
DB_PASSWORD=normas_dev
DB_NAME=normas_atualizadas
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl rand -base64 32>
ENCRYPTION_KEY=<openssl rand -base64 32>
```

- `NEXTAUTH_SECRET`: assina o JWT da sessão.
- `ENCRYPTION_KEY`: chave de 32 bytes (base64) que criptografa CPF e CRP (AES-256-GCM). **Se for perdida, esses dados não podem ser recuperados; não troque depois de haver usuários.**

## Produção / deploy

1. No ambiente de deploy, configure:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` com as credenciais do MySQL real;
   - `NEXTAUTH_URL=https://www.normasatualizadas.hogrefe.com.br`;
   - um `NEXTAUTH_SECRET` e uma `ENCRYPTION_KEY` **novos** (não reutilize os de desenvolvimento).
2. Rode `db/schema.sql` no banco real e depois `npm run db:seed` (carrega as tabelas de `db/seed/`).
   O seed também cria o usuário de teste: **remova `teste@normas.local` em produção**.
3. `npm run build` e `npm start`.
4. HTTPS é obrigatório: com `NEXTAUTH_URL` em `https://`, o next-auth marca os cookies de sessão como seguros automaticamente.

## Dados das tabelas

Cada tabela é um JSON em `db/seed/<slug>.json` (formato em ARCHITECTURE.md §6): `slug`, `titulo`, `descricao`, `colunas`, `linhas`, `ordem` e, opcionalmente, `capa`, `download_url` e `variantes` (filtros da página individual). Valores das células são sempre texto. O seed valida o formato antes de gravar e é idempotente (`ON DUPLICATE KEY UPDATE`).

- Capas dos cards: coloque as imagens em `public/capas/` e use o caminho em `capa` (ex.: `/capas/bfp.png`).
- Arquivo do botão "Estudos normativos atualizados": coloque em `public/downloads/` e use o caminho em `download_url`.

## Proteção de conteúdo (limitações)

As páginas de tabela bloqueiam seleção, cópia, clique direito, atalhos (Ctrl+C/V/X/A/S/P/U) e impressão, e exibem tela branca por 2 s ao pressionar Print Screen.

Na página individual, só a linha sob o cursor (ou tocada) fica nítida; as demais ficam desfocadas por CSS. Os valores continuam no HTML da página (para quem está logado), então isso é uma barreira visual, não criptográfica.

Tudo isso **dificulta**, mas não impede a captura: o sistema operacional costuma capturar a tela antes do navegador receber o evento, e Win+Shift+S, gravadores de tela, DevTools (que mostra as linhas desfocadas) e foto pelo celular não podem ser bloqueados por um site.

## Limites de tentativas

Em memória, por IP (zerados a cada 3 horas e a cada reinício do servidor): login — 5 falhas por hora bloqueiam o IP por 15 minutos; cadastro — 3 por hora. Com várias instâncias do servidor use um store compartilhado (Redis). O IP vem de `x-real-ip` ou da última entrada do `X-Forwarded-For`: em produção o proxy/host precisa preencher esses cabeçalhos.

## Estrutura

Veja ARCHITECTURE.md §4. Resumo: `app/` (rotas), `components/`, `lib/` (`db.ts`, `auth.ts`, `crypto.mjs`, `session.ts`, `validators.ts`), `db/` (schema e seeds), `scripts/seed.mjs`, `proxy.ts` (proteção das rotas internas; no Next 16 substitui `middleware.ts`).
