# Star Wars API

API REST e GraphQL de personagens do universo Star Wars, com autenticação JWT, documentação Swagger e testes automatizados.

## Estrutura do Projeto
- `rest/` - API REST (controllers, services, rotas)
- `graphql/` - API GraphQL (schema, resolvers, app, server)
- `controller/` - Controllers compartilhados
- `service/` - Serviços de negócio
- `model/` - Modelos de dados em memória
- `test/` - Testes automatizados (REST e GraphQL)
- `swagger.json` - Documentação Swagger da API REST

## Tecnologias Utilizadas
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web para REST API
- **Apollo Server Express** - Servidor GraphQL
- **JWT** - Autenticação via tokens
- **Bcrypt** - Hash de senhas
- **Mocha + Chai + Sinon** - Framework de testes
- **Supertest** - Testes de integração
- **Swagger UI** - Documentação interativa

## Como rodar

### Instalação
```sh
npm install
```

### API REST
```sh
node rest/server.js
```
- **Servidor**: http://localhost:3001
- **Endpoints**: http://localhost:3001/api
- **Documentação Swagger**: http://localhost:3001/api-docs

### API GraphQL
```sh
node graphql/server.js
```
- **Servidor**: http://localhost:3002
- **Endpoint GraphQL**: http://localhost:3002/graphql
- **GraphQL Playground**: http://localhost:3002/graphql (desenvolvimento)

## Autenticação
Todas as rotas protegidas exigem autenticação Bearer Token (JWT).

### Obter Token
**REST**: `POST /api/auth/token`
**GraphQL**: `mutation { login(username: "username", password: "password") { token } }`

### Usar Token
```
Authorization: Bearer <seu_token>
```

## API REST - Endpoints

### Autenticação
1 - `POST /api/users/register` — Cadastro de usuário (requer auth)
2 - `POST /api/auth/token` — Login (gera token JWT)
3 - `GET /api/users` — Listar usuários (com token gerado)

### Personagens
- `GET /api/characters` — Listar personagens (requer auth)
- `GET /api/characters/{id}` — Consultar personagem por ID (requer auth)
- `POST /api/characters` — Cadastrar personagem (requer auth)
- `PUT /api/characters/{id}` — Alterar personagem (requer auth)

## API GraphQL - Operações

### Queries
```graphql
# Listar todos os personagens
query {
  characters {
    id
    name
    status
    location
    lastSeen
  }
}

# Buscar personagem por ID
query {
  character(id: "1") {
    id
    name
    status
    location
    lastSeen
  }
}

# Filtrar personagens
query {
  characters(filter: { status: VIVO, name: "Luke" }) {
    id
    name
    status
  }
}

# Informações do usuário atual
query {
  me {
    id
    username
  }
}

# Listar usuários (apenas master)
query {
  users {
    id
    username
  }
}
```

### Mutations
```graphql
# Login
mutation {
  login(username: "Rogerio", password: "123456") {
    token
  }
}

# Registrar usuário
mutation {
  register(username: "novousuario", password: "senha123") {
    id
    username
  }
}

# Criar personagem
mutation {
  createCharacter(input: {
    name: "Novo Jedi"
    status: VIVO
    location: "Coruscant"
    lastSeen: "Episódio IX"
  }) {
    id
    name
    status
  }
}

# Atualizar personagem
mutation {
  updateCharacter(id: "1", input: {
    name: "Darth Vader (Atualizado)"
    status: FALECIDO
  }) {
    id
    name
    status
  }
}
```

### Status dos Personagens
- `VIVO` - Personagem vivo
- `FALECIDO` - Personagem morto
- `DESCONHECIDO` - Status desconhecido

## Testes

### Executar todos os testes
```sh
npm test
```

### Executar testes com cobertura
```sh
npm run test:coverage
```

### Executar testes com relatório HTML
```sh
npm run test:report
```
O relatório será gerado em `test-results/test-report.html`

### Tipos de teste implementados
- **Testes de Integração**: REST e GraphQL end-to-end com Supertest
- **Testes Unitários**: Controllers e Resolvers com mocks (Sinon)
- **Testes de Autenticação**: JWT, permissões e validações
- **Testes de Validação**: Entrada de dados e tratamento de erros

### Estrutura de testes
- `test/rest.test.js` - Testes de integração REST
- `test/graphql.test.js` - Testes de integração GraphQL
- `test/rest-controller.test.js` - Testes unitários REST com Sinon
- `test/graphql-resolvers.test.js` - Testes unitários GraphQL com Sinon
- `test/test-setup.js` - Configuração dos testes
- `test/k6/` - Testes de performance com K6

## Testes de Performance K6

### Executar testes de performance
```sh
k6 run test/k6/starwars-characters.test.js
```

### Conceitos Aplicados nos Testes K6

O arquivo `test/k6/starwars-characters.test.js` implementa **11 conceitos fundamentais** de testes de performance:

#### 1. **Stages** - Estágios de Carga
O código abaixo demonstra o uso de stages para simular diferentes níveis de carga durante o teste:

```javascript
export const options = {
  stages: [
    { duration: '3s', target: 2 },   // Um Ramp-up para 2 usuários
    { duration: '5s', target: 5 },   // Aumenta para 5 usuários
    { duration: '10s', target: 10 }, // Atinge um pico de 10 usuários
    { duration: '5s', target: 5 },   // Vai reduzindo para 5 usuários
    { duration: '2s', target: 0 },   // Ramp-down para 0 usuários
  ],
};
```

#### 2. **Thresholds** - Limites de Performance
Definição de critérios de sucesso para diferentes métricas:

```javascript
thresholds: {
  http_req_duration: ['p(95)<3000'],        // 95% das requests < 3s
  checks: ['rate>0.95'],                    // 95% dos checks devem passar
  character_list_duration: ['p(95)<2000'],  // Lista de personagens < 2s
  character_create_duration: ['p(95)<1500'], // Criação < 1.5s
  character_get_duration: ['p(95)<1000'],   // Consulta < 1s
},
```

#### 3. **Trends** - Métricas Customizadas
Criação de métricas específicas para monitorar operações:

```javascript
const characterListDuration = new Trend('character_list_duration');
const characterCreateDuration = new Trend('character_create_duration');
const characterGetDuration = new Trend('character_get_duration');
const loginDuration = new Trend('login_duration');

// Uso das métricas
const createStart = Date.now();
const createResponse = http.post(`${baseUrl}/api/characters`, JSON.stringify(characterData), { headers });
characterCreateDuration.add(Date.now() - createStart);
```

#### 4. **Checks** - Validações de Resposta
Validação de status codes e conteúdo das respostas:

```javascript
check(registerResponse, {
  'status do registro é 201': (r) => r.status === 201,
  'o novo registro de usuário tem nome': (r) => {
    try {
      const body = JSON.parse(r.body);
      return body.username && body.username.length > 0;
    } catch (e) {
      return false;
    }
  },
  'o novo registro de usuário tem e-mail': (r) => {
    try {
      const body = JSON.parse(r.body);
      return body.email && body.email.includes('@');
    } catch (e) {
      return false;
    }
  }
});
```

#### 5. **Groups** - Organização Lógica
Agrupamento de operações relacionadas para melhor organização:

```javascript
group('Realizar o registro e a autenticação', function () {
  const userData = generateFakeUser();
  // ... operações de registro e login
});

group('Operações para consulta e cadastro de personagens de Star Wars', function () {
  // ... operações com personagens
});
```

#### 6. **Helpers** - Funções Auxiliares
Importação e uso de funções auxiliares de outros arquivos:

```javascript
import { generateFakeUser, generateStarWarsCharacter } from './helpers/faker.js';
import { getBaseUrl } from './helpers/baseUrl.js';

// Uso dos helpers
const baseUrl = getBaseUrl();
const userData = generateFakeUser();
const characterData = generateStarWarsCharacter();
```

#### 7. **Faker** - Geração de Dados Aleatórios
O arquivo `helpers/faker.js` contém funções para gerar dados fictícios:

```javascript
// Em helpers/faker.js
export function generateStarWarsCharacter() {
  const names = ['Jedi Master', 'Sith Lord', 'Rebel Pilot'];
  const locations = ['Tatooine', 'Coruscant', 'Naboo'];
  const statuses = ['VIVO', 'FALECIDO', 'DESCONHECIDO'];
  
  return {
    name: `${title} ${firstName} ${lastName}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    lastSeen: episodes[Math.floor(Math.random() * episodes.length)]
  };
}
```

#### 8. **Variável de Ambiente** - Configuração Externa
Uso de variáveis de ambiente para configuração flexível:

```javascript
// Em helpers/baseUrl.js
export function getBaseUrl() {
  return __ENV.BASE_URL || 'http://localhost:3001';
}

// Uso no teste
const baseUrl = getBaseUrl();
```

#### 9. **Reaproveitamento de Resposta** - Extração de Dados
Extração e reutilização de dados de respostas anteriores:

```javascript
// Extrair token do login
if (loginSuccess) {
  token = JSON.parse(loginResponse.body).token;
}

// Salvar IDs de personagens criados
if (createSuccess) {
  const createdCharacter = JSON.parse(createResponse.body);
  createdCharacterIds.push(createdCharacter.id);
}
```

#### 10. **Uso de Token de Autenticação** - Bearer JWT
Implementação de autenticação Bearer Token:

```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

const listResponse = http.get(`${baseUrl}/api/characters`, { headers });
```

#### 11. **Data-Driven Testing** - Cenários de Teste
Uso de diferentes cenários de dados para variar os testes:

```javascript
const testScenarios = [
  { charactersToCreate: 3, listRequests: 2 },
  { charactersToCreate: 3, listRequests: 3 },
  { charactersToCreate: 3, listRequests: 1 }
];

// Seleção aleatória de cenário
const scenario = testScenarios[Math.floor(Math.random() * testScenarios.length)];

// Uso do cenário
for (let i = 0; i < scenario.charactersToCreate; i++) {
  // ... criar personagens
}
```

### Relatórios HTML
O teste gera automaticamente relatórios HTML detalhados:

```javascript
export function handleSummary(data) {
  return {
    "reports/starwars-characters-report.html": htmlReport(data),
    "reports/starwars-characters-summary.json": JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
```

### Estrutura dos Testes K6
- `test/k6/starwars-characters.test.js` - Teste principal com todos os conceitos
- `test/k6/helpers/faker.js` - Geração de dados aleatórios
- `test/k6/helpers/baseUrl.js` - Configuração de URL base
- `test/k6/reports/` - Relatórios HTML e JSON gerados

### CI/CD - GitHub Actions

O projeto inclui um workflow automatizado que executa os testes de performance K6 em cada push ou pull request:

**Arquivo**: `.github/workflows/k6-performance.yml`

**O que o workflow faz:**
1. ⚙️ **Setup do ambiente** - Node.js 18 + dependências
2. 🚀 **Inicia o servidor** REST API na porta 3001
3. ⏱️ **Aguarda servidor** estar pronto para receber requests
4. 📈 **Executa teste K6** `starwars-characters.test.js`
5. 📁 **Gera relatórios** HTML e JSON automaticamente
6. 📎 **Upload de artifacts** - Relatórios disponíveis por 30 dias
7. 💬 **Comenta no PR** com métricas de performance

**Triggers do workflow:**
- Push para `main` ou `develop`
- Pull Requests para `main`
- Execução manual via GitHub UI

**Métricas reportadas automaticamente:**
- P95 Response Time
- Taxa de sucesso dos Checks
- Total de requests executadas
- Métricas customizadas (Character List, Create, Get)
- Status dos Thresholds

**Como visualizar resultados:**
1. Acesse a aba "Actions" no GitHub
2. Clique no workflow "K6 Performance Tests"
3. Baixe o artifact "k6-performance-report"
4. Abra o arquivo `starwars-characters-report.html`

**Exemplo de execução manual:**
```bash
# No GitHub, vá para Actions > K6 Performance Tests > Run workflow
```

## Desenvolvimento

### Scripts disponíveis
```sh
npm start              # Inicia servidor REST
npm run start:graphql  # Inicia servidor GraphQL
npm test               # Executa testes
npm run test:report    # Executa testes com relatório HTML
npm run test:coverage  # Testes com cobertura
```

### Variáveis de ambiente
```env
JWT_SECRET=starwars_secret    # Chave secreta JWT
REST_PORT=3001               # Porta da API REST
GRAPHQL_PORT=3002            # Porta da API GraphQL
NODE_ENV=development         # Ambiente de execução
```

## Ambiente recomendado
- **Node.js**: v18+ LTS
- **npm**: v8+

## Arquitetura

### Camadas da aplicação
1. **Presentation Layer**: REST Controllers / GraphQL Resolvers
2. **Business Layer**: Services (characterService, userService, authService)
3. **Data Layer**: Models (in-memory storage)

### Padrões utilizados
- **Repository Pattern**: Modelos de dados
- **Service Layer**: Lógica de negócio
- **Dependency Injection**: Injeção de dependências
- **Error Handling**: Tratamento centralizado de erros

---

**May the Force be with you!** ✨

---

