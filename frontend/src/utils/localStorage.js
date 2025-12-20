// LocalStorage Manager - Gerenciamento completo de dados

const KEYS = {
  USUARIOS: 'fitness_usuarios',
  TREINOS: 'fitness_treinos',
  ATRIBUICOES: 'fitness_atribuicoes',
  EXECUCOES: 'fitness_execucoes',
  CURRENT_USER: 'fitness_current_user'
};

// Inicializar localStorage
export const initializeStorage = () => {
  if (!localStorage.getItem(KEYS.USUARIOS)) {
    localStorage.setItem(KEYS.USUARIOS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.TREINOS)) {
    localStorage.setItem(KEYS.TREINOS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.ATRIBUICOES)) {
    localStorage.setItem(KEYS.ATRIBUICOES, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.EXECUCOES)) {
    localStorage.setItem(KEYS.EXECUCOES, JSON.stringify([]));
  }
};

// Gerar ID único
export const generateId = (prefix = 'ID') => {
  return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
};

// Carregar dados
export const carregarDados = (chave) => {
  try {
    const dados = localStorage.getItem(KEYS[chave]);
    return dados ? JSON.parse(dados) : [];
  } catch (error) {
    console.error(`Erro ao carregar ${chave}:`, error);
    return [];
  }
};

// Salvar dados
export const salvarDados = (chave, dados) => {
  try {
    localStorage.setItem(KEYS[chave], JSON.stringify(dados));
    window.dispatchEvent(new Event('dataChanged'));
    return true;
  } catch (error) {
    console.error(`Erro ao salvar ${chave}:`, error);
    return false;
  }
};

// USUARIOS
export const criarUsuario = (usuario) => {
  const usuarios = carregarDados('USUARIOS');
  const novoUsuario = {
    ...usuario,
    id: generateId(usuario.tipo === 'personal' ? 'PT' : 'ALN'),
    dataCriacao: new Date().toISOString()
  };
  usuarios.push(novoUsuario);
  salvarDados('USUARIOS', usuarios);
  return novoUsuario;
};

export const buscarUsuarioPorEmail = (email) => {
  const usuarios = carregarDados('USUARIOS');
  return usuarios.find(u => u.email === email);
};

export const buscarUsuarioPorId = (id) => {
  const usuarios = carregarDados('USUARIOS');
  return usuarios.find(u => u.id === id);
};

export const atualizarUsuario = (id, dadosAtualizados) => {
  const usuarios = carregarDados('USUARIOS');
  const indice = usuarios.findIndex(u => u.id === id);
  if (indice !== -1) {
    usuarios[indice] = { ...usuarios[indice], ...dadosAtualizados };
    salvarDados('USUARIOS', usuarios);
    return usuarios[indice];
  }
  return null;
};

export const deletarUsuario = (id) => {
  const usuarios = carregarDados('USUARIOS');
  const filtrados = usuarios.filter(u => u.id !== id);
  salvarDados('USUARIOS', filtrados);
};

export const buscarAlunosPorPersonal = (idPersonal) => {
  const usuarios = carregarDados('USUARIOS');
  return usuarios.filter(u => u.tipo === 'aluno' && u.codigoPersonal === idPersonal);
};

export const buscarPersonalPorCodigo = (codigo) => {
  const usuarios = carregarDados('USUARIOS');
  return usuarios.find(u => u.tipo === 'personal' && u.id === codigo);
};

export const adicionarMedida = (idAluno, medida) => {
  const usuarios = carregarDados('USUARIOS');
  const indice = usuarios.findIndex(u => u.id === idAluno);
  if (indice !== -1) {
    if (!usuarios[indice].historicoMedidas) {
      usuarios[indice].historicoMedidas = [];
    }
    usuarios[indice].historicoMedidas.push({
      ...medida,
      data: new Date().toISOString()
    });
    salvarDados('USUARIOS', usuarios);
    return true;
  }
  return false;
};

// TREINOS
export const criarTreino = (treino) => {
  const treinos = carregarDados('TREINOS');
  const novoTreino = {
    ...treino,
    id: generateId('TREN'),
    dataCriacao: new Date().toISOString(),
    dataUltimaEdicao: new Date().toISOString()
  };
  treinos.push(novoTreino);
  salvarDados('TREINOS', treinos);
  return novoTreino;
};

export const buscarTreinosPorPersonal = (idPersonal) => {
  const treinos = carregarDados('TREINOS');
  return treinos.filter(t => t.idPersonal === idPersonal);
};

export const buscarTreinoPorId = (id) => {
  const treinos = carregarDados('TREINOS');
  return treinos.find(t => t.id === id);
};

export const atualizarTreino = (id, dadosAtualizados) => {
  const treinos = carregarDados('TREINOS');
  const indice = treinos.findIndex(t => t.id === id);
  if (indice !== -1) {
    treinos[indice] = {
      ...treinos[indice],
      ...dadosAtualizados,
      dataUltimaEdicao: new Date().toISOString()
    };
    salvarDados('TREINOS', treinos);
    return treinos[indice];
  }
  return null;
};

export const deletarTreino = (id) => {
  const treinos = carregarDados('TREINOS');
  const filtrados = treinos.filter(t => t.id !== id);
  salvarDados('TREINOS', filtrados);
};

// ATRIBUIÇÕES
export const criarAtribuicao = (atribuicao) => {
  const atribuicoes = carregarDados('ATRIBUICOES');
  const novaAtribuicao = {
    ...atribuicao,
    id: generateId('ATRB'),
    dataCriacao: new Date().toISOString(),
    status: 'ativo'
  };
  atribuicoes.push(novaAtribuicao);
  salvarDados('ATRIBUICOES', atribuicoes);
  return novaAtribuicao;
};

export const buscarAtribuicoesPorAluno = (idAluno) => {
  const atribuicoes = carregarDados('ATRIBUICOES');
  return atribuicoes.filter(a => a.idAluno === idAluno);
};

export const buscarAtribuicoesPorPersonal = (idPersonal) => {
  const atribuicoes = carregarDados('ATRIBUICOES');
  return atribuicoes.filter(a => a.idPersonal === idPersonal);
};

export const atualizarAtribuicao = (id, dadosAtualizados) => {
  const atribuicoes = carregarDados('ATRIBUICOES');
  const indice = atribuicoes.findIndex(a => a.id === id);
  if (indice !== -1) {
    atribuicoes[indice] = { ...atribuicoes[indice], ...dadosAtualizados };
    salvarDados('ATRIBUICOES', atribuicoes);
    return atribuicoes[indice];
  }
  return null;
};

// EXECUÇÕES
export const criarExecucao = (execucao) => {
  const execucoes = carregarDados('EXECUCOES');
  const novaExecucao = {
    ...execucao,
    id: generateId('EXEC'),
    dataExecucao: new Date().toISOString()
  };
  execucoes.push(novaExecucao);
  salvarDados('EXECUCOES', execucoes);
  return novaExecucao;
};

export const buscarExecucoesPorAluno = (idAluno) => {
  const execucoes = carregarDados('EXECUCOES');
  return execucoes.filter(e => e.idAluno === idAluno);
};

export const buscarExecucoesPorAtribuicao = (idAtribuicao) => {
  const execucoes = carregarDados('EXECUCOES');
  return execucoes.filter(e => e.idAtribuicao === idAtribuicao);
};

// CURRENT USER
export const setCurrentUser = (usuario) => {
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(usuario));
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem(KEYS.CURRENT_USER);
};

// Converter arquivo para base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};