import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${API_URL}/api`;

// Configurar interceptor para adicionar token
const getToken = () => localStorage.getItem('fitness_token');

const apiClient = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== AUTENTICAÇÃO ====================

export const cadastrarPersonal = async (dados) => {
  const response = await apiClient.post('/auth/cadastro/personal', dados);
  if (response.data.token) {
    localStorage.setItem('fitness_token', response.data.token);
  }
  return response.data;
};

export const cadastrarAluno = async (dados) => {
  const response = await apiClient.post('/auth/cadastro/aluno', dados);
  if (response.data.token) {
    localStorage.setItem('fitness_token', response.data.token);
  }
  return response.data;
};

export const login = async (email, senha, tipo) => {
  const response = await apiClient.post('/auth/login', { email, senha, tipo });
  if (response.data.token) {
    localStorage.setItem('fitness_token', response.data.token);
  }
  return response.data;
};

export const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    localStorage.removeItem('fitness_token');
  }
};

export const getMe = async () => {
  const response = await apiClient.get('/usuarios/me');
  return response.data;
};

// ==================== USUÁRIOS ====================

export const buscarUsuarioPorId = async (id) => {
  const response = await apiClient.get(`/usuarios/${id}`);
  return response.data;
};

export const listarAlunosPorPersonal = async (idPersonal) => {
  const response = await apiClient.get(`/personal/${idPersonal}/alunos`);
  return response.data;
};

export const criarAlunoPeloPersonal = async (dados) => {
  const response = await apiClient.post('/alunos', dados);
  return response.data;
};

export const atualizarUsuario = async (id, dados) => {
  const response = await apiClient.put(`/usuarios/${id}`, dados);
  return response.data;
};

export const deletarUsuario = async (id) => {
  const response = await apiClient.delete(`/usuarios/${id}`);
  return response.data;
};

export const adicionarMedida = async (id, dados) => {
  const response = await apiClient.post(`/usuarios/${id}/medidas`, dados);
  return response.data;
};

// ==================== TREINOS ====================

export const criarTreino = async (dados) => {
  const response = await apiClient.post('/treinos', dados);
  return response.data;
};

export const buscarTreinoPorId = async (id) => {
  const response = await apiClient.get(`/treinos/${id}`);
  return response.data;
};

export const listarTreinosPorPersonal = async (idPersonal) => {
  const response = await apiClient.get(`/personal/${idPersonal}/treinos`);
  return response.data;
};

export const atualizarTreino = async (id, dados) => {
  const response = await apiClient.put(`/treinos/${id}`, dados);
  return response.data;
};

export const deletarTreino = async (id) => {
  const response = await apiClient.delete(`/treinos/${id}`);
  return response.data;
};

// ==================== ATRIBUIÇÕES ====================

export const criarAtribuicao = async (dados) => {
  const response = await apiClient.post('/atribuicoes', dados);
  return response.data;
};

export const listarAtribuicoesPorAluno = async (idAluno) => {
  const response = await apiClient.get(`/alunos/${idAluno}/atribuicoes`);
  return response.data;
};

export const listarAtribuicoesPorPersonal = async (idPersonal) => {
  const response = await apiClient.get(`/personal/${idPersonal}/atribuicoes`);
  return response.data;
};

export const atualizarAtribuicao = async (id, dados) => {
  const response = await apiClient.put(`/atribuicoes/${id}`, dados);
  return response.data;
};

// ==================== EXECUÇÕES ====================

export const criarExecucao = async (dados) => {
  const response = await apiClient.post('/execucoes', dados);
  return response.data;
};

export const listarExecucoesPorAluno = async (idAluno) => {
  const response = await apiClient.get(`/alunos/${idAluno}/execucoes`);
  return response.data;
};

export const listarExecucoesPorAtribuicao = async (idAtribuicao) => {
  const response = await apiClient.get(`/atribuicoes/${idAtribuicao}/execucoes`);
  return response.data;
};

export default apiClient;
