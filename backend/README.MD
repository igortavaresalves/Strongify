## 🚀 Como Executar o Backend Localmente

### **Pré-requisitos**
1. **Python 3.10+** instalado
2. **MongoDB** instalado e rodando localmente (ou uma instância remota)

---

### **Passo a Passo**

#### 1️⃣ Instalar MongoDB
Se ainda não tem o MongoDB instalado:

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt install mongodb
sudo systemctl start mongodb
```

**Windows:**
Baixe e instale do site oficial: https://www.mongodb.com/try/download/community

---

#### 2️⃣ Clonar/Copiar os arquivos do backend
Copie a pasta `/app/backend` para sua máquina local.

---

#### 3️⃣ Criar ambiente virtual (recomendado)
```bash
cd backend
python -m venv venv

# Ativar o ambiente virtual:
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

---

#### 4️⃣ Instalar dependências
```bash
pip install -r requirements.txt
```

---

#### 5️⃣ Configurar o arquivo `.env`
Crie ou edite o arquivo `.env` na pasta `backend/`:

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="fitnesspro"
CORS_ORIGINS="http://localhost:3000"
```

> **Nota:** Se seu MongoDB estiver em outro endereço ou porta, ajuste o `MONGO_URL`.

---

#### 6️⃣ Executar o servidor
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

O servidor estará rodando em: **http://localhost:8001**

---

### **Verificar se está funcionando**
Acesse no navegador ou via curl:
```bash
curl http://localhost:8001/api/health
# Resposta esperada: {"status": "healthy"}
```

---

### **Estrutura do Backend**
```
backend/
├── .env              # Configurações de ambiente
├── server.py         # Aplicação FastAPI principal
├── models.py         # Modelos Pydantic
├── database.py       # Conexão com MongoDB
└── requirements.txt  # Dependências Python
```

---

### **Endpoints Principais**
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/cadastro/personal` | Cadastro de Personal |
| POST | `/api/auth/cadastro/aluno` | Cadastro de Aluno |
| POST | `/api/auth/login` | Login |
| GET | `/api/usuarios/me` | Dados do usuário logado |
| POST | `/api/treinos` | Criar treino |
| GET | `/api/personal/{id}/treinos` | Listar treinos |
| POST | `/api/atribuicoes` | Atribuir treino a aluno |