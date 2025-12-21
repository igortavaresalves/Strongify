from fastapi import FastAPI, APIRouter, HTTPException, Header
from starlette.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from typing import List, Optional
import uuid
import secrets

from .models import (
    HistoricoMedida,
    UsuarioBase,
    PersonalCreate,
    AlunoCreate,
    UsuarioResponse,
    LoginRequest,
    LoginResponse,
    Exercicio,
    TreinoCreate,
    TreinoUpdate,
    TreinoResponse,
    AtribuicaoCreate,
    AtribuicaoResponse,
    ExercicioExecucao,
    ExecucaoCreate,
    ExecucaoResponse,
    AdicionarMedida,
)

from .database import (
    usuarios_collection,
    treinos_collection,
    atribuicoes_collection,
    execucoes_collection,
    close_db_connection,
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Dicionário simples para tokens (em produção, use JWT ou Redis)
active_tokens = {}

def generate_id(prefix='ID'):
    return f"{prefix}{int(datetime.now().timestamp())}{secrets.token_hex(4)}"

def generate_token():
    return secrets.token_urlsafe(32)

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Não autorizado")
    
    token = authorization.replace('Bearer ', '')
    user_id = active_tokens.get(token)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    user = await usuarios_collection.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    
    return user

# ==================== AUTENTICAÇÃO ====================

@api_router.post("/auth/cadastro/personal", response_model=LoginResponse)
async def cadastro_personal(dados: PersonalCreate):
    # Verificar se email já existe
    existe = await usuarios_collection.find_one({"email": dados.email})
    if existe:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    usuario = {
        "id": generate_id('PT'),
        "tipo": "personal",
        "nome": dados.nome,
        "email": dados.email,
        "senha": dados.senha,  # Em produção: hash com bcrypt
        "especializacao": dados.especializacao or "",
        "avatar": dados.avatar,
        "dataCriacao": datetime.now(timezone.utc).isoformat()
    }
    
    await usuarios_collection.insert_one(usuario)
    
    token = generate_token()
    active_tokens[token] = usuario['id']
    
    usuario_response = {k: v for k, v in usuario.items() if k != 'senha'}
    
    return LoginResponse(token=token, usuario=UsuarioResponse(**usuario_response))

@api_router.post("/auth/cadastro/aluno", response_model=LoginResponse)
async def cadastro_aluno(dados: AlunoCreate):
    # Verificar se email já existe
    existe = await usuarios_collection.find_one({"email": dados.email})
    if existe:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Verificar se código do personal existe
    personal = await usuarios_collection.find_one({"id": dados.codigoPersonal, "tipo": "personal"})
    if not personal:
        raise HTTPException(status_code=400, detail="Código de personal inválido")
    
    usuario = {
        "id": generate_id('ALN'),
        "tipo": "aluno",
        "nome": dados.nome,
        "email": dados.email,
        "senha": dados.senha,
        "codigoPersonal": dados.codigoPersonal,
        "idade": dados.idade,
        "peso": dados.peso,
        "altura": dados.altura,
        "sexo": dados.sexo,
        "objetivo": dados.objetivo or "",
        "restricoes": dados.restricoes or "",
        "avatar": dados.avatar,
        "historicoMedidas": [
            {
                "data": datetime.now(timezone.utc).isoformat(),
                "peso": dados.peso,
                "altura": dados.altura
            }
        ],
        "dataCriacao": datetime.now(timezone.utc).isoformat()
    }
    
    await usuarios_collection.insert_one(usuario)
    
    token = generate_token()
    active_tokens[token] = usuario['id']
    
    usuario_response = {k: v for k, v in usuario.items() if k != 'senha'}
    
    return LoginResponse(token=token, usuario=UsuarioResponse(**usuario_response))

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(dados: LoginRequest):
    usuario = await usuarios_collection.find_one(
        {"email": dados.email, "tipo": dados.tipo},
        {"_id": 0}
    )
    
    if not usuario or usuario['senha'] != dados.senha:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    token = generate_token()
    active_tokens[token] = usuario['id']
    
    usuario_response = {k: v for k, v in usuario.items() if k != 'senha'}
    
    return LoginResponse(token=token, usuario=UsuarioResponse(**usuario_response))

@api_router.post("/auth/logout")
async def logout(authorization: str = Header(None)):
    if authorization and authorization.startswith('Bearer '):
        token = authorization.replace('Bearer ', '')
        active_tokens.pop(token, None)
    
    return {"message": "Logout realizado"}

# ==================== USUÁRIOS ====================

@api_router.get("/usuarios/me", response_model=UsuarioResponse)
async def get_me(authorization: str = Header(None)):
    user = await get_current_user(authorization)
    return UsuarioResponse(**{k: v for k, v in user.items() if k != 'senha'})

@api_router.get("/usuarios/{id}", response_model=UsuarioResponse)
async def get_usuario(id: str, authorization: str = Header(None)):
    await get_current_user(authorization)
    
    usuario = await usuarios_collection.find_one({"id": id}, {"_id": 0, "senha": 0})
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return UsuarioResponse(**usuario)

@api_router.get("/personal/{id_personal}/alunos", response_model=List[UsuarioResponse])
async def listar_alunos_personal(id_personal: str, authorization: str = Header(None)):
    await get_current_user(authorization)
    
    alunos = await usuarios_collection.find(
        {"tipo": "aluno", "codigoPersonal": id_personal},
        {"_id": 0, "senha": 0}
    ).to_list(1000)
    
    return [UsuarioResponse(**aluno) for aluno in alunos]

@api_router.post("/alunos", response_model=UsuarioResponse)
async def criar_aluno_pelo_personal(dados: dict, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    if user['tipo'] != 'personal':
        raise HTTPException(status_code=403, detail="Apenas personal trainers podem criar alunos")
    
    # Verificar se email já existe
    existe = await usuarios_collection.find_one({"email": dados['email']})
    if existe:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    aluno = {
        "id": generate_id('ALN'),
        "tipo": "aluno",
        "nome": dados['nome'],
        "email": dados['email'],
        "senha": dados.get('senha', 'senha123'),  # Senha padrão
        "codigoPersonal": user['id'],
        "idade": dados['idade'],
        "peso": dados['peso'],
        "altura": dados['altura'],
        "sexo": dados['sexo'],
        "objetivo": dados.get('objetivo', ''),
        "restricoes": dados.get('restricoes', ''),
        "avatar": dados.get('avatar'),
        "historicoMedidas": [
            {
                "data": datetime.now(timezone.utc).isoformat(),
                "peso": dados['peso'],
                "altura": dados['altura']
            }
        ],
        "dataCriacao": datetime.now(timezone.utc).isoformat()
    }
    
    await usuarios_collection.insert_one(aluno)
    
    return UsuarioResponse(**{k: v for k, v in aluno.items() if k != 'senha'})

@api_router.put("/usuarios/{id}", response_model=UsuarioResponse)
async def atualizar_usuario(id: str, dados: dict, authorization: str = Header(None)):
    await get_current_user(authorization)
    
    # Remover campos que não devem ser atualizados
    dados.pop('id', None)
    dados.pop('_id', None)
    dados.pop('senha', None)
    dados.pop('tipo', None)
    dados.pop('dataCriacao', None)
    
    result = await usuarios_collection.update_one(
        {"id": id},
        {"$set": dados}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    usuario = await usuarios_collection.find_one({"id": id}, {"_id": 0, "senha": 0})
    return UsuarioResponse(**usuario)

@api_router.delete("/usuarios/{id}")
async def deletar_usuario(id: str, authorization: str = Header(None)):
    await get_current_user(authorization)
    
    result = await usuarios_collection.delete_one({"id": id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return {"message": "Usuário deletado com sucesso"}

@api_router.post("/usuarios/{id}/medidas")
async def adicionar_medida(id: str, dados: AdicionarMedida, authorization: str = Header(None)):
    await get_current_user(authorization)
    
    medida = {
        "data": datetime.now(timezone.utc).isoformat(),
        "peso": dados.peso,
        "altura": dados.altura
    }
    
    result = await usuarios_collection.update_one(
        {"id": id},
        {"$push": {"historicoMedidas": medida}, "$set": {"peso": dados.peso, "altura": dados.altura}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return {"message": "Medida adicionada com sucesso"}

# ==================== TREINOS ====================

@api_router.post("/treinos", response_model=TreinoResponse)
async def criar_treino(dados: TreinoCreate, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    if user['tipo'] != 'personal':
        raise HTTPException(status_code=403, detail="Apenas personal trainers podem criar treinos")
    
    treino = {
        "id": generate_id('TREN'),
        "idPersonal": user['id'],
        "nome": dados.nome,
        "descricao": dados.descricao,
        "tipo": dados.tipo,
        "duracao": dados.duracao,
        "nivel": dados.nivel,
        "observacoes": dados.observacoes,
        "exercicios": [ex.model_dump() for ex in dados.exercicios],
        "dataCriacao": datetime.now(timezone.utc).isoformat(),
        "dataUltimaEdicao": datetime.now(timezone.utc).isoformat()
    }
    
    await treinos_collection.insert_one(treino)
    
    return TreinoResponse(**treino)

@api_router.get("/treinos/{id}", response_model=TreinoResponse)
async def get_treino(id: str, authorization: str = Header(None)):
    await get_current_user(authorization)
    
    treino = await treinos_collection.find_one({"id": id}, {"_id": 0})
    if not treino:
        raise HTTPException(status_code=404, detail="Treino não encontrado")
    
    return TreinoResponse(**treino)

@api_router.get("/personal/{id_personal}/treinos", response_model=List[TreinoResponse])
async def listar_treinos_personal(id_personal: str, authorization: str = Header(None)):
    await get_current_user(authorization)
    
    treinos = await treinos_collection.find(
        {"idPersonal": id_personal},
        {"_id": 0}
    ).to_list(1000)
    
    return [TreinoResponse(**treino) for treino in treinos]

@api_router.put("/treinos/{id}", response_model=TreinoResponse)
async def atualizar_treino(id: str, dados: TreinoUpdate, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    # Verificar se o treino pertence ao personal
    treino = await treinos_collection.find_one({"id": id, "idPersonal": user['id']})
    if not treino:
        raise HTTPException(status_code=404, detail="Treino não encontrado")
    
    update_data = dados.model_dump(exclude_unset=True)
    if 'exercicios' in update_data and update_data['exercicios']:
        update_data['exercicios'] = [ex if isinstance(ex, dict) else ex.model_dump() for ex in update_data['exercicios']]
    
    update_data['dataUltimaEdicao'] = datetime.now(timezone.utc).isoformat()
    
    await treinos_collection.update_one(
        {"id": id},
        {"$set": update_data}
    )
    
    treino_atualizado = await treinos_collection.find_one({"id": id}, {"_id": 0})
    return TreinoResponse(**treino_atualizado)

@api_router.delete("/treinos/{id}")
async def deletar_treino(id: str, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    result = await treinos_collection.delete_one({"id": id, "idPersonal": user['id']})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Treino não encontrado")
    
    return {"message": "Treino deletado com sucesso"}

# ==================== ATRIBUIÇÕES ====================

@api_router.post("/atribuicoes", response_model=AtribuicaoResponse)
async def criar_atribuicao(dados: AtribuicaoCreate, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    if user['tipo'] != 'personal':
        raise HTTPException(status_code=403, detail="Apenas personal trainers podem atribuir treinos")
    
    atribuicao = {
        "id": generate_id('ATRB'),
        "idAluno": dados.idAluno,
        "idTreino": dados.idTreino,
        "idPersonal": user['id'],
        "dataInicio": dados.dataInicio,
        "dataFim": dados.dataFim,
        "diasSemana": dados.diasSemana,
        "status": "ativo",
        "dataCriacao": datetime.now(timezone.utc).isoformat()
    }
    
    await atribuicoes_collection.insert_one(atribuicao)
    
    return AtribuicaoResponse(**atribuicao)

@api_router.get("/alunos/{id_aluno}/atribuicoes", response_model=List[AtribuicaoResponse])
async def listar_atribuicoes_aluno(id_aluno: str, authorization: str = Header(None)):
    await get_current_user(authorization)
    
    atribuicoes = await atribuicoes_collection.find(
        {"idAluno": id_aluno},
        {"_id": 0}
    ).to_list(1000)
    
    return [AtribuicaoResponse(**atr) for atr in atribuicoes]

@api_router.get("/personal/{id_personal}/atribuicoes", response_model=List[AtribuicaoResponse])
async def listar_atribuicoes_personal(id_personal: str, authorization: str = Header(None)):
    await get_current_user(authorization)
    
    atribuicoes = await atribuicoes_collection.find(
        {"idPersonal": id_personal},
        {"_id": 0}
    ).to_list(1000)
    
    return [AtribuicaoResponse(**atr) for atr in atribuicoes]

@api_router.put("/atribuicoes/{id}")
async def atualizar_atribuicao(id: str, dados: dict, authorization: str = Header(None)):
    await get_current_user(authorization)
    
    dados.pop('id', None)
    dados.pop('_id', None)
    
    result = await atribuicoes_collection.update_one(
        {"id": id},
        {"$set": dados}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Atribuição não encontrada")
    
    return {"message": "Atribuição atualizada"}

# ==================== EXECUÇÕES ====================

@api_router.post("/execucoes", response_model=ExecucaoResponse)
async def criar_execucao(dados: ExecucaoCreate, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    if user['tipo'] != 'aluno':
        raise HTTPException(status_code=403, detail="Apenas alunos podem registrar execuções")
    
    execucao = {
        "id": generate_id('EXEC'),
        "idAluno": user['id'],
        "idAtribuicao": dados.idAtribuicao,
        "dataExecucao": datetime.now(timezone.utc).isoformat(),
        "duracao": dados.duracao,
        "exercicios": dados.exercicios
    }
    
    await execucoes_collection.insert_one(execucao)
    
    return ExecucaoResponse(**execucao)

@api_router.get("/alunos/{id_aluno}/execucoes", response_model=List[ExecucaoResponse])
async def listar_execucoes_aluno(id_aluno: str, authorization: str = Header(None)):
    await get_current_user(authorization)
    
    execucoes = await execucoes_collection.find(
        {"idAluno": id_aluno},
        {"_id": 0}
    ).to_list(1000)
    
    return [ExecucaoResponse(**exec) for exec in execucoes]

@api_router.get("/atribuicoes/{id_atribuicao}/execucoes", response_model=List[ExecucaoResponse])
async def listar_execucoes_atribuicao(id_atribuicao: str, authorization: str = Header(None)):
    await get_current_user(authorization)
    
    execucoes = await execucoes_collection.find(
        {"idAtribuicao": id_atribuicao},
        {"_id": 0}
    ).to_list(1000)
    
    return [ExecucaoResponse(**exec) for exec in execucoes]

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "FitnessPro API - v1.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_db_connection()
