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

### Usuário Master (pré-configurado)
- **Username**: `Rogerio`
- **Password**: `123456`

### Obter Token
**REST**: `POST /api/auth/token`
**GraphQL**: `mutation { login(username: "username", password: "password") { token } }`

### Usar Token
```
Authorization: Bearer <seu_token>
```

## API REST - Endpoints

### Autenticação
- `POST /api/auth/token` — Login (gera token JWT)
- `POST /api/users/register` — Cadastro de usuário (requer auth)
- `GET /api/users` — Listar usuários (apenas master)

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

Desenvolvido com ❤️ para demonstrar APIs REST e GraphQL com Node.js
