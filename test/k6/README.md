# Arquitetura dos Testes K6

## 📁 Estrutura de Diretórios

```
test/k6/
├── helpers/                           # Funções auxiliares reutilizáveis
│   ├── baseUrl.js                    # Configuração de URL base
│   └── faker.js                      # Geração de dados aleatórios
├── reports/                          # Relatórios gerados automaticamente
│   ├── starwars-characters-report.html
│   ├── starwars-characters-ci-report.html
│   ├── starwars-characters-summary.json
│   └── starwars-characters-ci-summary.json
├── checkout-complete.test.js         # Teste de checkout (exemplo)
├── starwars-characters.test.js       # Teste principal (desenvolvimento)
├── starwars-characters-ci.test.js    # Teste otimizado (CI/CD)
└── README.md                         # Esta documentação
```

## 🎯 Tipos de Teste

### **1. Teste de Desenvolvimento**
- **Arquivo**: `starwars-characters.test.js`
- **Uso**: Execução local durante desenvolvimento
- **Características**:
  - 10 usuários virtuais (pico)
  - Thresholds rigorosos (95% checks)
  - Timeouts padrão
  - Carga alta para stress testing

### **2. Teste de CI/CD**
- **Arquivo**: `starwars-characters-ci.test.js`
- **Uso**: GitHub Actions e pipelines automatizados
- **Características**:
  - 1-2 usuários virtuais (conservador)
  - Thresholds tolerantes (80% checks)
  - Timeouts maiores (15s)
  - Teste de conectividade primeiro

## 🔧 Helpers

### **baseUrl.js**
```javascript
export function getBaseUrl() {
  return __ENV.BASE_URL || 'http://localhost:3001';
}
```
- **Propósito**: Configuração flexível de URL
- **Variável de ambiente**: `BASE_URL`
- **Padrão**: `http://localhost:3001`

### **faker.js**
```javascript
export function generateFakeUser() { ... }
export function generateStarWarsCharacter() { ... }
```
- **Propósito**: Geração de dados de teste aleatórios
- **Funções**:
  - `generateFakeUser()`: Usuários com email único
  - `generateStarWarsCharacter()`: Personagens Star Wars

## 📊 Conceitos Implementados

### **1. Stages** - Estágios de Carga
```javascript
stages: [
  { duration: '3s', target: 2 },   // Ramp-up
  { duration: '10s', target: 10 }, // Pico
  { duration: '2s', target: 0 },   // Ramp-down
]
```

### **2. Thresholds** - Limites de Performance
```javascript
thresholds: {
  http_req_duration: ['p(95)<3000'],
  checks: ['rate>0.95'],
  character_list_duration: ['p(95)<2000'],
}
```

### **3. Trends** - Métricas Customizadas
```javascript
const characterListDuration = new Trend('character_list_duration');
const characterCreateDuration = new Trend('character_create_duration');
```

### **4. Checks** - Validações
```javascript
check(response, {
  'status é 201': (r) => r.status === 201,
  'tem dados válidos': (r) => { ... }
});
```

### **5. Groups** - Organização
```javascript
group('Registro e Autenticação', function () { ... });
group('Operações de Personagens', function () { ... });
```

### **6. Data-Driven Testing**
```javascript
const testScenarios = [
  { charactersToCreate: 3, listRequests: 2 },
  { charactersToCreate: 2, listRequests: 1 }
];
```

### **7. Reaproveitamento de Resposta**
```javascript
// Extrair token do login
token = JSON.parse(loginResponse.body).token;

// Salvar IDs criados
createdCharacterIds.push(createdCharacter.id);
```

### **8. Uso de Token de Autenticação**
```javascript
const headers = {
  'Authorization': `Bearer ${token}`
};
```

## 🚀 Como Executar

### **Desenvolvimento Local**
```bash
# Teste completo (10 usuários)
k6 run test/k6/starwars-characters.test.js

# Com variável de ambiente
k6 run --env BASE_URL=http://localhost:3001 test/k6/starwars-characters.test.js
```

### **CI/CD**
```bash
# Teste otimizado (1-2 usuários)
k6 run test/k6/starwars-characters-ci.test.js
```

### **Checkout (Exemplo)**
```bash
k6 run test/k6/checkout-complete.test.js
```

## 📈 Relatórios

### **Geração Automática**
- **HTML**: Relatório visual detalhado
- **JSON**: Dados estruturados para análise
- **Console**: Resumo em tempo real

### **Localização**
- `test/k6/reports/starwars-characters-report.html`
- `test/k6/reports/starwars-characters-summary.json`

### **Visualização**
1. Execute o teste
2. Abra o arquivo HTML no navegador
3. Analise métricas, gráficos e thresholds

## 🎯 Fluxo de Teste Completo

### **1. Preparação**
- Teste de conectividade do servidor
- Geração de dados aleatórios (Faker)

### **2. Autenticação**
- Registro de usuário único
- Login e obtenção de token JWT
- Validação de resposta

### **3. Operações CRUD**
- Listagem de personagens
- Criação de novos personagens
- Consulta por ID específico
- Validação de dados

### **4. Métricas**
- Tempo de resposta por operação
- Taxa de sucesso dos checks
- Thresholds de performance

## 🔄 CI/CD Integration

### **GitHub Actions**
- Workflow: `.github/workflows/k6-performance.yml`
- Trigger: Push/PR para main
- Artefatos: Relatórios HTML/JSON
- Comentários automáticos em PRs

### **Configuração**
```yaml
- name: Run K6 Performance Test
  run: k6 run test/k6/starwars-characters-ci.test.js
  env:
    BASE_URL: http://localhost:3001
```

## 📋 Boas Práticas

### **Organização**
- ✅ Separar helpers em arquivos específicos
- ✅ Usar diferentes testes para dev/CI
- ✅ Agrupar operações relacionadas
- ✅ Gerar dados únicos para evitar conflitos

### **Performance**
- ✅ Definir thresholds apropriados
- ✅ Usar métricas customizadas
- ✅ Implementar stages progressivos
- ✅ Validar conectividade primeiro

### **Manutenibilidade**
- ✅ Código limpo e comentado
- ✅ Funções reutilizáveis
- ✅ Configuração via variáveis de ambiente
- ✅ Relatórios automáticos

---

**Arquitetura robusta para testes de performance com K6!** 🚀