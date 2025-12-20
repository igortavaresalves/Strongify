# 📚 FitnessPro - Documentação da API

## 🔐 Autenticação

Todas as rotas (exceto login e cadastro) requerem autenticação via token Bearer.

**Header necessário:**
```
Authorization: Bearer {token}
```

---

## 🚀 Endpoints

### **Autenticação**

#### **POST /api/auth/cadastro/personal**
Cadastra um novo Personal Trainer

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "especializacao": "Hipertrofia",
  "avatar": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "token": "eyJhbGci...",
  "usuario": {
    "id": "PT1234567890abc",
    "nome": "João Silva",
    "email": "joao@email.com",
    "tipo": "personal",
    ...
  }
}
```

---

#### **POST /api/auth/cadastro/aluno**
Cadastra um novo Aluno

**Body:**
```json
{
  "nome": "Maria Costa",
  "email": "maria@email.com",
  "senha": "senha123",
  "codigoPersonal": "PT1234567890abc",
  "idade": 28,
  "peso": 65.5,
  "altura": 1.65,
  "sexo": "F",
  "objetivo": "Perda de peso",
  "restricoes": "Lesão no ombro",
  "avatar": null
}
```

---

#### **POST /api/auth/login**
Realiza login

**Body:**
```json
{
  "email": "joao@email.com",
  "senha": "senha123",
  "tipo": "personal"  // ou "aluno"
}
```

---

#### **POST /api/auth/logout**
Realiza logout (invalida token)

---

### **Usuários**

#### **GET /api/usuarios/me**
Retorna dados do usuário logado

#### **GET /api/usuarios/{id}**
Busca usuário por ID

#### **GET /api/personal/{id_personal}/alunos**
Lista todos os alunos de um personal trainer

#### **POST /api/alunos**
Cria um novo aluno (apenas Personal Trainer)

**Body:**
```json
{
  "nome": "Carlos Santos",
  "email": "carlos@email.com",
  "senha": "senha_opcional",  // Se não informado, usa "senha123"
  "idade": 35,
  "peso": 80,
  "altura": 1.75,
  "sexo": "M",
  "objetivo": "Hipertrofia",
  "restricoes": "",
  "avatar": null
}
```

**⚠️ IMPORTANTE - SENHA DO ALUNO:**
- Se o Personal Trainer criar o aluno, a **senha padrão é "senha123"**
- O Personal deve **informar essa senha ao aluno**
- **Recomendação**: Adicionar funcionalidade de "primeiro acesso" onde o aluno define sua própria senha

---

#### **PUT /api/usuarios/{id}**
Atualiza dados do usuário

**Body:**
```json
{
  "nome": "Novo Nome",
  "peso": 75.5,
  "objetivo": "Novo objetivo"
}
```

---

#### **DELETE /api/usuarios/{id}**
Deleta usuário

---

#### **POST /api/usuarios/{id}/medidas**
Adiciona nova medida ao histórico

**Body:**
```json
{
  "peso": 75.5,
  "altura": 1.75
}
```

---

### **Treinos**

#### **POST /api/treinos**
Cria novo treino (apenas Personal)

**Body:**
```json
{
  "nome": "Treino A - Peito e Tríceps",
  "descricao": "Treino focado em hipertrofia",
  "tipo": "Hipertrofia",
  "duracao": 45,
  "nivel": "Intermediário",
  "observacoes": "Descanso 2-3min entre séries",
  "exercicios": [
    {
      "id": "EX001",
      "nome": "Supino com Barra",
      "series": 4,
      "repeticoes": "8",
      "carga": 80,
      "descanso": 180,
      "observacoes": "Descida controlada",
      "videoUrl": "https://www.youtube.com/watch?v=abc123",
      "videoLocal": null
    }
  ]
}
```

---

#### **GET /api/treinos/{id}**
Busca treino por ID

#### **GET /api/personal/{id_personal}/treinos**
Lista todos os treinos de um personal

#### **PUT /api/treinos/{id}**
Atualiza treino

#### **DELETE /api/treinos/{id}**
Deleta treino

---

### **Atribuições**

#### **POST /api/atribuicoes**
Atribui um treino a um aluno (apenas Personal)

**Body:**
```json
{
  "idAluno": "ALN1234567890abc",
  "idTreino": "TREN1234567890abc",
  "dataInicio": "2025-01-15",
  "dataFim": "2025-02-15",
  "diasSemana": ["segunda", "quarta", "sexta"]
}
```

---

#### **GET /api/alunos/{id_aluno}/atribuicoes**
Lista atribuições de um aluno

#### **GET /api/personal/{id_personal}/atribuicoes**
Lista todas as atribuições de um personal

#### **PUT /api/atribuicoes/{id}**
Atualiza atribuição

---

### **Execuções**

#### **POST /api/execucoes**
Registra execução de treino (apenas Aluno)

**Body:**
```json
{
  "idAtribuicao": "ATRB1234567890abc",
  "duracao": 45,
  "exercicios": [
    {
      "idExercicio": "EX001",
      "repeticoesFeit": 8,
      "cargaUtilizada": 80,
      "observacoes": "Senti forte",
      "dataConclusao": "2025-01-15T19:10:00Z"
    }
  ]
}
```

---

#### **GET /api/alunos/{id_aluno}/execucoes**
Lista execuções de um aluno

#### **GET /api/atribuicoes/{id_atribuicao}/execucoes**
Lista execuções de uma atribuição específica

---

## 🔒 Segurança

### **Senha do Aluno - Fluxo Recomendado:**

**Cenário 1: Personal cria o aluno**
```
1. Personal cria aluno → senha padrão "senha123"
2. Personal informa ao aluno: 
   "Seu login: carlos@email.com"
   "Senha temporária: senha123"
3. Aluno faz primeiro login
4. Sistema detecta senha temporária → força troca de senha
5. Aluno define nova senha personalizada
```

**Cenário 2: Aluno se cadastra sozinho**
```
1. Aluno acessa /cadastro
2. Aluno preenche dados + código do personal
3. Aluno define sua própria senha
4. Cadastro completo
```

---

## 📊 Status Codes

- **200 OK**: Sucesso
- **201 Created**: Recurso criado
- **400 Bad Request**: Dados inválidos
- **401 Unauthorized**: Não autenticado
- **403 Forbidden**: Sem permissão
- **404 Not Found**: Recurso não encontrado
- **500 Internal Server Error**: Erro no servidor

---

## 🧪 Exemplos de Uso

### **Exemplo completo: Criar aluno e atribuir treino**

```javascript
// 1. Login do Personal
const loginResponse = await fetch('https://your-domain.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'personal@email.com',
    senha: 'senha123',
    tipo: 'personal'
  })
});
const { token } = await loginResponse.json();

// 2. Criar aluno
const alunoResponse = await fetch('https://your-domain.com/api/alunos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    nome: 'Carlos',
    email: 'carlos@email.com',
    idade: 30,
    peso: 85,
    altura: 1.80,
    sexo: 'M'
  })
});
const aluno = await alunoResponse.json();

// 3. Criar treino
const treinoResponse = await fetch('https://your-domain.com/api/treinos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    nome: 'Treino A',
    tipo: 'Hipertrofia',
    duracao: 45,
    nivel: 'Intermediário',
    exercicios: [/* ... */]
  })
});
const treino = await treinoResponse.json();

// 4. Atribuir treino ao aluno
await fetch('https://your-domain.com/api/atribuicoes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    idAluno: aluno.id,
    idTreino: treino.id,
    dataInicio: '2025-01-15',
    diasSemana: ['segunda', 'quarta', 'sexta']
  })
});
```

---

## 📝 Notas

- Tokens são armazenados em memória no servidor (MVP)
- Em produção: usar JWT com refresh tokens
- Senhas devem ser hasheadas com bcrypt em produção
- Implementar rate limiting
- Adicionar validação de CSRF
- Logs de auditoria para ações críticas
