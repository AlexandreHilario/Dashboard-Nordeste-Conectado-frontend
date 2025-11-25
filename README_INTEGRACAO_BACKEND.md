# 📘 Guia de Integração Backend

Este documento explica como conectar o frontend React ao backend Node.js.

## 🔗 Pontos de Integração

### 1️⃣ Configuração da API Base

Arquivo: `src/services/api.ts`

```typescript
// Configure a baseURL para sua API no Render
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  // ...
});
```

**Como configurar:**
1. Crie um arquivo `.env` na raiz do projeto
2. Adicione: `VITE_API_URL=https://seu-app-backend.onrender.com/api`
3. Para desenvolvimento local: `VITE_API_URL=http://localhost:3000/api`

---

### 2️⃣ Autenticação (JWT)

Arquivo: `src/services/authService.ts`

#### Endpoint de Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Response Esperado:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-do-usuario",
    "name": "Nome do Usuário",
    "email": "usuario@email.com"
  }
}
```

**Observações:**
- O token JWT é automaticamente salvo no `localStorage` com a chave `auth_token`
- Em todas as requisições subsequentes, o token é enviado no header `Authorization: Bearer {token}`
- Se a API retornar status 401, o usuário é automaticamente deslogado

---

### 3️⃣ Endpoints do Dashboard

Arquivo: `src/services/dashboardService.ts`

Todos os endpoints devem estar protegidos por autenticação JWT.

#### 📊 CONSULTA 01 - Escolas com Lab e Internet
```
GET /dashboard/escolas-lab-internet
```

**Response:**
```json
{
  "escolas_rurais_com_lab_e_internet": 1247
}
```

**SQL correspondente:**
```sql
SELECT COUNT(*) AS escolas_rurais_com_lab_e_internet
FROM escola e
JOIN infraestrutura_geral ig ON e.id_infraestrutura_geral = ig.id
JOIN infraestrutura_rede ir ON e.id_infraestrutura_rede = ir.id
WHERE e.tp_localizacao = 2
  AND ig.in_laboratorio_informatica = TRUE
  AND ir.in_internet_alunos = TRUE;
```

---

#### 📊 CONSULTA 02 - Média de Computadores por Aluno
```
GET /dashboard/media-computadores
```

**Response:**
```json
{
  "media_computadores_por_aluno": 0.12
}
```

**SQL correspondente:**
```sql
SELECT ROUND(AVG(eq.qt_desktop_aluno::numeric / NULLIF(cd.qt_mat_fund_af + cd.qt_mat_med, 0)), 2)
  AS media_computadores_por_aluno
FROM escola e
JOIN equipamentos eq ON e.id_equipamentos = eq.id
JOIN corpo_discente cd ON e.id_corpo_discente = cd.id
JOIN infraestrutura_geral ig ON e.id_infraestrutura_geral = ig.id
WHERE e.tp_localizacao = 2
  AND ig.in_laboratorio_informatica = TRUE;
```

---

#### 📊 CONSULTA 03 - Escolas com LAN sem Banda Larga
```
GET /dashboard/escolas-lan-sem-banda-larga
```

**Response (array com 871 itens):**
```json
[
  {
    "nome_escola": "ESCOLA MUNICIPAL RURAL EXEMPLO",
    "possui_banda_larga": false,
    "possui_rede_local": true
  },
  // ... mais 870 escolas
]
```

**SQL correspondente:**
```sql
SELECT e.no_entidade AS nome_escola,
       ir.in_banda_larga AS possui_banda_larga,
       ir.tp_rede_local AS possui_rede_local
FROM escola e
JOIN infraestrutura_rede ir ON e.id_infraestrutura_rede = ir.id
WHERE e.tp_localizacao = 2
  AND ir.tp_rede_local = TRUE
  AND ir.in_banda_larga = FALSE;
```

**⚠️ IMPORTANTE:** Esta consulta deve retornar exatamente **871 resultados**.

---

#### 📊 CONSULTA 04 - Escolas com Tablets sem Laboratório
```
GET /dashboard/escolas-tablet-sem-lab
```

**Response (array com 2005 itens):**
```json
[
  {
    "nome_escola": "ESCOLA ESTADUAL RURAL EXEMPLO",
    "quantidade_tablets": 35
  },
  // ... mais 2004 escolas
]
```

**SQL correspondente:**
```sql
SELECT e.no_entidade AS nome_escola,
       eq.qt_tablet_aluno AS quantidade_tablets
FROM escola e
JOIN equipamentos eq ON e.id_equipamentos = eq.id
JOIN infraestrutura_geral ig ON e.id_infraestrutura_geral = ig.id
WHERE e.tp_localizacao = 2
  AND eq.in_tablet_aluno = TRUE
  AND ig.in_laboratorio_informatica = FALSE
ORDER BY eq.qt_tablet_aluno DESC;
```

**⚠️ IMPORTANTE:** Esta consulta deve retornar exatamente **2.005 resultados**.

---

## 🚀 Como Ativar a Integração Real

### Passo 1: Remover Dados Mockados
No arquivo `src/pages/Dashboard.tsx`, localize a função `loadDashboardData()` e:

1. **Remova** o código mockado:
```typescript
// REMOVER ISSO:
await new Promise(resolve => setTimeout(resolve, 1000));
setStats({
  escolasComLab: 1247,
  mediaComputadores: 0.12,
  // ...
});
```

2. **Descomente** as chamadas reais à API:
```typescript
// DESCOMENTAR ISSO:
const [labInternet, mediaComp, lanSemBanda, tabletSemLab] = await Promise.all([
  dashboardService.getEscolasComLabEInternet(),
  dashboardService.getMediaComputadores(),
  dashboardService.getEscolasLanSemBandaLarga(),
  dashboardService.getEscolasTabletSemLab(),
]);

setStats({
  escolasComLab: labInternet.escolas_rurais_com_lab_e_internet,
  mediaComputadores: mediaComp.media_computadores_por_aluno,
  escolasLanSemBanda: lanSemBanda.slice(0, 10),
  escolasTabletSemLab: tabletSemLab.slice(0, 10),
});
```

### Passo 2: Configurar Variável de Ambiente
Crie o arquivo `.env` na raiz do projeto:
```env
VITE_API_URL=https://seu-app-backend.onrender.com/api
```

### Passo 3: Testar a Integração
1. Execute o frontend: `npm run dev`
2. Tente fazer login
3. Verifique o console do navegador para ver as requisições sendo feitas
4. Use as DevTools (aba Network) para inspecionar as chamadas HTTP

---

## 🔧 Tratamento de Erros

O frontend já possui tratamento de erros implementado:

- **Erro 401 (Não autorizado)**: Redireciona para o login automaticamente
- **Erros de rede**: Exibe toast de erro com mensagem amigável
- **Token expirado**: Remove credenciais e redireciona para login

---

## 📋 Checklist de Validação

Antes de integrar, verifique se o backend possui:

- [ ] Endpoint `POST /auth/login` funcionando
- [ ] Autenticação JWT implementada
- [ ] Middleware de autenticação protegendo rotas do dashboard
- [ ] Os 4 endpoints do dashboard implementados:
  - [ ] `GET /dashboard/escolas-lab-internet`
  - [ ] `GET /dashboard/media-computadores`
  - [ ] `GET /dashboard/escolas-lan-sem-banda-larga` (871 resultados)
  - [ ] `GET /dashboard/escolas-tablet-sem-lab` (2005 resultados)
- [ ] CORS configurado para aceitar requisições do frontend
- [ ] Swagger/OpenAPI documentado em `/docs`
- [ ] Backend publicado no Render

---

## 🐛 Troubleshooting

### Erro: "Network Error" ou "Failed to fetch"
- **Causa:** CORS não configurado ou URL da API incorreta
- **Solução:** Verifique `VITE_API_URL` e configure CORS no backend

### Erro: 401 Unauthorized
- **Causa:** Token inválido ou não enviado
- **Solução:** Verifique se o token está sendo salvo no localStorage após login

### Erro: 404 Not Found
- **Causa:** Endpoint não existe no backend
- **Solução:** Verifique se todos os endpoints estão implementados

### Dados não aparecem no dashboard
- **Causa:** Estrutura de resposta diferente do esperado
- **Solução:** Verifique se o backend retorna os dados no formato esperado

---

## 📚 Documentação Swagger

O backend deve documentar todos os endpoints no Swagger.
Acesse: `https://seu-app-backend.onrender.com/docs`

---

## 👨‍💻 Desenvolvimento

**Arquivos importantes para integração:**
- `src/services/api.ts` - Configuração base do Axios
- `src/services/authService.ts` - Serviço de autenticação
- `src/services/dashboardService.ts` - Serviços do dashboard
- `src/contexts/AuthContext.tsx` - Context de autenticação
- `src/pages/Dashboard.tsx` - Página principal do dashboard

**Variáveis de ambiente:**
- `VITE_API_URL` - URL base da API

---

## ✅ Pronto para Produção

Quando o backend estiver pronto:
1. Configure a variável de ambiente com URL do Render
2. Remova os dados mockados do Dashboard.tsx
3. Remova o banner de "Pontos de Integração" do dashboard
4. Teste todas as funcionalidades
5. Deploy do frontend no Render

---

**Dúvidas?** Consulte os comentários nos arquivos de serviço.
