# ARCHITECTURE — Normas Atualizadas (Parte 1)

Documento de referência do projeto. **Toda task (TASK-01 a TASK-12) parte deste arquivo.** Em caso de conflito entre uma task e este documento, este documento prevalece; mudanças de arquitetura são feitas aqui primeiro.

## 1. Visão geral e escopo

- **Projeto:** Plataforma Normas Atualizadas
- **Domínio final:** www.normasatualizadas.hogrefe.com.br
- **Etapa:** Parte 1 — Plataforma sem Painel Administrativo (R$ 1.200,00)
- **Entrega:** segunda-feira, 26/10/2026

**Dentro do escopo:** banco de dados, registro e autenticação, páginas de login/cadastro, página principal interna com prévias das tabelas, páginas individuais das tabelas, as duas tabelas fornecidas pelo cliente, proteção das páginas internas.

**Fora do escopo (Parte 2, será organizada depois):** dashboard administrativo, cadastro/edição/exclusão de tabelas, gerenciamento de usuários, editor de conteúdo. Nada disso deve ser implementado agora, mas as decisões abaixo já deixam o caminho preparado.

## 2. Regras gerais

- Next.js **16+**: a convenção `middleware.ts` foi renomeada para **`proxy.ts`** (na raiz ou em `src/`). Nunca criar `middleware.ts`.
- Tudo que usa `bcrypt` ou `mysql2` roda em **runtime Node.js** (nunca Edge). O `proxy.ts` só valida o JWT, não toca no banco.
- Sessão do next-auth: `strategy: "jwt"` (obrigatório com Credentials Provider).
- Sem ORM. Acesso ao banco só via `lib/db.ts` com **queries parametrizadas** (`pool.execute(sql, [params])`); nunca concatenar input do usuário.
- Nenhuma credencial hardcoded. Tudo via variáveis de ambiente (§5).
- Credenciais MySQL de produção **ainda não existem** → todo desenvolvimento usa o ambiente de teste local ([TASK-02](./TASK-02.md)).
- O modelo de dados das tabelas é **genérico (JSON)** para que a Parte 2 só acrescente o CRUD, sem migração (§6).
- **Designs:** as telas `/` (login + cadastro) e a tabela seguem os designs que o cliente vai fornecer. Enquanto não chegarem, implementar estrutura e lógica com estilo neutro e marcar `// TODO: aplicar design`.
- Toda página interna (`/dashboard/**`) renderiza seu conteúdo dentro de `<ProtectedContent>` ([TASK-10](./TASK-10.md)).
- **Responsividade obrigatória em todas as telas** (mobile first). Ao aplicar os designs do cliente, adaptar para todos os tamanhos mesmo que o design venha só em desktop:
  - Larguras de referência para testar: **360 px** (celular), **768 px** (tablet), **1024 px** e **1440 px** (desktop).
  - Unidades relativas (`rem`, `%`, `clamp()`), layout com flexbox/grid, imagens com `max-width: 100%`.
  - A página nunca pode ter scroll horizontal; conteúdo largo (tabelas) rola dentro do próprio container com `overflow-x: auto`.
  - Áreas de toque com no mínimo 44 × 44 px; inputs com `font-size` ≥ 16 px (evita zoom automático no iOS).
  - `<meta name="viewport">` padrão do Next (já vem no App Router; não remover).

## 3. Stack e dependências

| Camada         | Escolha                                          |
| -------------- | ------------------------------------------------ |
| Framework      | Next.js 16+ (App Router, TypeScript)             |
| Autenticação   | `next-auth@4` — Credentials Provider, sessão JWT |
| Hash de senha  | `bcrypt` (cost 12) + `@types/bcrypt` (dev)       |
| Banco          | MySQL 8 via `mysql2/promise` (pool)              |
| Banco de teste | Docker Compose com `mysql:8.4`                   |

> Observação: no next-auth v4 o helper de proteção de rotas continua sendo importado de `next-auth/middleware` (nome do módulo da lib). Só o **arquivo** do Next é que se chama `proxy.ts`.

## 4. Estrutura de pastas

```
├── docker-compose.yml          # MySQL de teste
├── .env                        # variáveis de ambiente (NÃO versionado)
├── db/
│   ├── schema.sql              # criação das tabelas (§6)
│   └── seed/                   # JSON das duas tabelas do cliente
├── scripts/
│   └── seed.mjs                # popula o banco
├── proxy.ts                    # proteção das rotas internas (Next 16+)
├── types/
│   └── next-auth.d.ts          # Session com user.id
├── lib/
│   ├── db.ts                   # pool mysql2 (singleton em globalThis) + helpers
│   ├── auth.ts                 # authOptions do next-auth
│   └── crypto.mjs              # AES-256-GCM + HMAC (CPF/CRP)
├── components/
│   └── ProtectedContent.tsx    # anti-cópia + tela branca no Print
└── app/
    ├── page.tsx                # "/" login + cadastro
    ├── api/auth/[...nextauth]/route.ts
    ├── api/register/route.ts
    └── tabelas/
        ├── page.tsx            # página principal interna (prévias)
        └── [slug]/page.tsx     # visualização individual
```

## 5. Variáveis de ambiente

Fonte única de verdade para o `.env` (não versionado):

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=normas
DB_PASSWORD=normas_dev
DB_NAME=normas_atualizadas
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gere-com-openssl-rand-base64-32
ENCRYPTION_KEY=gere-com-openssl-rand-base64-32
```

- Os valores `DB_*` acima são os do **ambiente de teste** (Docker). O `docker-compose.yml` usa os mesmos.
- `ENCRYPTION_KEY`: chave de 32 bytes em base64 (`openssl rand -base64 32`) usada para criptografar CPF e CRP (AES-256-GCM). **Se for perdida, esses dados não podem ser recuperados; não troque depois de haver usuários.**
- **Produção:** trocar `DB_*` pelas credenciais reais, gerar um `NEXTAUTH_SECRET` novo, gerar uma `ENCRYPTION_KEY` própria e usar `NEXTAUTH_URL=https://www.normasatualizadas.hogrefe.com.br`.

## 6. Modelo de dados

```sql
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,      -- sempre salvo em trim().toLowerCase()
  cpf_enc VARCHAR(255) NOT NULL,           -- CPF (11 dígitos) criptografado com AES-256-GCM
  cpf_hash CHAR(64) NOT NULL UNIQUE,       -- HMAC-SHA256 do CPF: garante unicidade sem expor o valor
  crp_enc VARCHAR(255) NOT NULL,           -- CRP (ex.: 06/123456) criptografado com AES-256-GCM
  password_hash VARCHAR(255) NOT NULL,     -- bcrypt, nunca a senha
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tabelas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NULL,
  colunas JSON NOT NULL,     -- ex.: ["Idade","Percentil","Escore"]
  linhas JSON NOT NULL,      -- ex.: [["18-24","50","32"], ...]
  ordem INT NOT NULL DEFAULT 0,
  capa VARCHAR(255) NULL,    -- imagem de capa em /public (ex.: /capas/bfp.png); opcional
  variantes JSON NULL,       -- filtros + variações da tabela (ver ARCHITECTURE.md §6); NULL = tabela única (colunas/linhas)
  download_url VARCHAR(255) NULL, -- link do botão "Estudos normativos atualizados"; opcional
  download_rotulo VARCHAR(120) NULL, -- texto do botão; NULL = "Estudos normativos atualizados"
  nota TEXT NULL, -- texto abaixo da tabela; NULL = não exibe
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

- `users.cpf_enc`/`crp_enc` guardam CPF (só os 11 dígitos; a máscara é apenas visual) e CRP (`UF/número`, ex.: `06/123456`) **criptografados** (`lib/crypto.mjs`, chave em `ENCRYPTION_KEY`); `cpf_hash` é o índice cego usado para o `UNIQUE`. A senha é só o hash bcrypt. Campos vêm do design de cadastro do cliente.
- Valores das células são **strings** (preserva vírgula decimal e formatação original).
- Se o design da tabela exigir células mescladas, cabeçalho em dois níveis ou notas de rodapé, o formato de `colunas`/`linhas` é ajustado **aqui** (continua JSON) antes do seed ([TASK-11](./TASK-11.md)).
- Formato dos arquivos de seed (`db/seed/<slug>.json`): `{ slug, titulo, descricao, colunas, linhas, ordem, capa?, download_url?, download_rotulo?, nota?, variantes? }`.
- `capa` (opcional): imagem exibida no card de `/dashboard` (design do cliente); sem ela o card mostra a prévia das primeiras linhas da tabela.
- `download_url` (opcional): destino do botão "Estudos normativos atualizados" no topo da página individual; sem ele o botão não aparece.
- `download_rotulo` (opcional): texto do botão de download; sem ele usa "Estudos normativos atualizados".
- `nota` (opcional): texto exibido abaixo da tabela na página individual; sem ele nada é exibido.
- `variantes` (opcional): habilita os filtros da página individual (design do cliente: Tabela normativa, Faixa etária, Sexo). Cada filtro tem `tipo` `"select"` ou `"radio"`; a primeira opção é a padrão. Cada item de `tabelas` traz a `selecao` (valor escolhido em cada filtro) e o seu próprio `colunas`/`linhas`; filtro ausente em `selecao` vale para qualquer valor. Combinação sem tabela mostra "Sem dados para esta combinação". Quando `variantes` é usado, `colunas`/`linhas` da raiz continuam obrigatórios (prévia do card).
  ```json
  "variantes": {
    "filtros": [
      { "id": "norma", "rotulo": "Tabela normativa", "tipo": "select", "opcoes": [{ "valor": "idade", "rotulo": "Amostra por idade" }] },
      { "id": "sexo", "rotulo": "Sexo", "tipo": "radio", "opcoes": [{ "valor": "m", "rotulo": "Masculino" }, { "valor": "f", "rotulo": "Feminino" }, { "valor": "todos", "rotulo": "Todos" }] }
    ],
    "tabelas": [
      { "selecao": { "norma": "idade", "sexo": "m" }, "colunas": ["Percentil", "E"], "linhas": [["0-14", "3-5,5"]] }
    ]
  }
  ```

## 7. Rotas e acesso

| Rota                      | Tipo       | Acesso                                          | Task                    |
| ------------------------- | ---------- | ----------------------------------------------- | ----------------------- |
| `/`                       | Página     | Pública; se logado, redireciona para `/dashboard` | [TASK-06](./TASK-06.md) |
| `/api/auth/[...nextauth]` | API        | Pública (next-auth)                             | [TASK-04](./TASK-04.md) |
| `/api/register`           | API (POST) | Pública                                         | [TASK-05](./TASK-05.md) |
| `/dashboard`                | Página     | Autenticado + `<ProtectedContent>`              | [TASK-08](./TASK-08.md) |
| `/dashboard/[slug]`         | Página     | Autenticado + `<ProtectedContent>`              | [TASK-09](./TASK-09.md) |

Proteção em duas camadas: `proxy.ts` com `matcher: ["/dashboard/:path*"]` **e** `getServerSession` + `redirect("/")` em cada página interna ([TASK-07](./TASK-07.md)).

## 8. Fluxo de autenticação

1. **Cadastro:** formulário em `/` → `POST /api/register` → valida → `bcrypt.hash(senha, 12)` → `INSERT users` → front chama `signIn("credentials")` automaticamente → `/dashboard`.
2. **Login:** formulário em `/` → `signIn("credentials", { redirect: false })` → `authorize` busca por e-mail e faz `bcrypt.compare` → JWT com `user.id` → `/dashboard`.
3. **Acesso interno:** `proxy.ts` valida o JWT; página confere a sessão no servidor.
4. **Logout:** `signOut({ callbackUrl: "/" })`.

Erros de login são sempre genéricos (não revelam se o e-mail existe). Sessão expira em 8 h.

## 9. Índice de tasks

| Task                    | Descrição                                               |
| ----------------------- | ------------------------------------------------------- |
| [TASK-01](./TASK-01.md) | Setup do projeto                                        |
| [TASK-02](./TASK-02.md) | Ambiente de teste MySQL (sem credenciais de produção)   |
| [TASK-03](./TASK-03.md) | Banco de dados (schema + conexão)                       |
| [TASK-04](./TASK-04.md) | Autenticação (next-auth + bcrypt)                       |
| [TASK-05](./TASK-05.md) | Registro de usuários (API)                              |
| [TASK-06](./TASK-06.md) | Página `/` (login + cadastro) — aguardando design       |
| [TASK-07](./TASK-07.md) | Proteção das rotas internas                             |
| [TASK-08](./TASK-08.md) | Página principal interna `/dashboard` (prévias)           |
| [TASK-09](./TASK-09.md) | Página individual `/dashboard/[slug]` — aguardando design |
| [TASK-10](./TASK-10.md) | Proteção de conteúdo (anti-cópia + Print Screen)        |
| [TASK-11](./TASK-11.md) | Seed das duas tabelas do cliente — aguardando dados     |
| [TASK-12](./TASK-12.md) | Testes finais e preparação para entrega                 |

## 10. Pendências do cliente

| Pendência                               | Bloqueia                                                              |
| --------------------------------------- | --------------------------------------------------------------------- |
| Design da página `/` (login + cadastro) | [TASK-06](./TASK-06.md) (visual)                                      |
| Design da tabela                        | [TASK-09](./TASK-09.md) (visual) e possivelmente o formato JSON de §6 |
| Dados das duas tabelas                  | [TASK-11](./TASK-11.md)                                               |
| Credenciais MySQL + hospedagem          | Deploy em [TASK-12](./TASK-12.md)                                     |

## 11. Cronograma sugerido (até 26/10/2026)

| Dia       | Tasks                                              |
| --------- | -------------------------------------------------- |
| Qui 22/10 | TASK-01, TASK-02, TASK-03                          |
| Sex 23/10 | TASK-04, TASK-05, TASK-07                          |
| Sáb 24/10 | TASK-06, TASK-08, TASK-10                          |
| Dom 25/10 | TASK-09, TASK-11 (aplicar designs/dados recebidos) |
| Seg 26/10 | TASK-12 — testes, ajustes e entrega                |
