from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

# Modelos de Usuários
class HistoricoMedida(BaseModel):
    data: str
    peso: float
    altura: float

class UsuarioBase(BaseModel):
    nome: str
    email: str
    tipo: str  # 'personal' ou 'aluno'
    avatar: Optional[str] = None

class PersonalCreate(BaseModel):
    nome: str
    email: str
    senha: str
    especializacao: Optional[str] = None
    avatar: Optional[str] = None

class AlunoCreate(BaseModel):
    nome: str
    email: str
    senha: str
    codigoPersonal: str
    idade: int
    peso: float
    altura: float
    sexo: str
    objetivo: Optional[str] = None
    restricoes: Optional[str] = None
    avatar: Optional[str] = None

class UsuarioResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    nome: str
    email: str
    tipo: str
    avatar: Optional[str] = None
    dataCriacao: str
    
    # Campos específicos do Personal
    especializacao: Optional[str] = None
    
    # Campos específicos do Aluno
    codigoPersonal: Optional[str] = None
    idade: Optional[int] = None
    peso: Optional[float] = None
    altura: Optional[float] = None
    sexo: Optional[str] = None
    objetivo: Optional[str] = None
    restricoes: Optional[str] = None
    historicoMedidas: Optional[List[HistoricoMedida]] = []

class LoginRequest(BaseModel):
    email: str
    senha: str
    tipo: str

class LoginResponse(BaseModel):
    token: str
    usuario: UsuarioResponse

# Modelos de Exercício
class Exercicio(BaseModel):
    id: str
    nome: str
    series: int
    repeticoes: str
    carga: Optional[float] = None
    descanso: Optional[int] = 60
    observacoes: Optional[str] = None
    videoUrl: Optional[str] = None
    videoLocal: Optional[str] = None

# Modelos de Treino
class TreinoCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None
    tipo: str
    duracao: int
    nivel: str
    observacoes: Optional[str] = None
    exercicios: List[Exercicio]

class TreinoUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    tipo: Optional[str] = None
    duracao: Optional[int] = None
    nivel: Optional[str] = None
    observacoes: Optional[str] = None
    exercicios: Optional[List[Exercicio]] = None

class TreinoResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    idPersonal: str
    nome: str
    descricao: Optional[str] = None
    tipo: str
    duracao: int
    nivel: str
    observacoes: Optional[str] = None
    exercicios: List[Exercicio]
    dataCriacao: str
    dataUltimaEdicao: str

# Modelos de Atribuição
class AtribuicaoCreate(BaseModel):
    idAluno: str
    idTreino: str
    dataInicio: str
    dataFim: Optional[str] = None
    diasSemana: List[str]

class AtribuicaoResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    idAluno: str
    idTreino: str
    idPersonal: str
    dataInicio: str
    dataFim: Optional[str] = None
    diasSemana: List[str]
    status: str
    dataCriacao: str

# Modelos de Execução
class ExercicioExecucao(BaseModel):
    idExercicio: str
    repeticoesFeit: int
    cargaUtilizada: Optional[float] = None
    observacoes: Optional[str] = None
    dataConclusao: str

class ExecucaoCreate(BaseModel):
    idAtribuicao: str
    duracao: int
    exercicios: List[dict]

class ExecucaoResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    idAluno: str
    idAtribuicao: str
    dataExecucao: str
    duracao: int
    exercicios: List[dict]

# Modelo para adicionar medida
class AdicionarMedida(BaseModel):
    peso: float
    altura: float