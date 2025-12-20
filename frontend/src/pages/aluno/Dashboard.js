import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import {
  listarAtribuicoesPorAluno,
  buscarTreinoPorId,
  listarExecucoesPorAluno
} from '../../services/api';

const AlunoDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [atribuicoes, setAtribuicoes] = useState([]);
  const [execucoes, setExecucoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, [user]);

  const carregarDados = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [atribuicoesData, execucoesData] = await Promise.all([
        listarAtribuicoesPorAluno(user.id),
        listarExecucoesPorAluno(user.id)
      ]);
      
      setAtribuicoes(atribuicoesData.filter(a => a.status === 'ativo'));
      setExecucoes(execucoesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTreino = async (idTreino) => {
    try {
      return await buscarTreinoPorId(idTreino);
    } catch (error) {
      console.error('Erro ao buscar treino:', error);
      return null;
    }
  };

  const getDiaHoje = () => {
    const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    return dias[new Date().getDay()];
  };

  const diaHoje = getDiaHoje();

  const treinosHoje = atribuicoes.filter(atr => 
    atr.diasSemana.includes(diaHoje)
  );

  const ultimasExecucoes = execucoes
    .sort((a, b) => new Date(b.dataExecucao) - new Date(a.dataExecucao))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Meus Treinos</h1>
          <p className="text-gray-600 dark:text-gray-400">Bem-vindo, {user?.nome}!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card !bg-gradient-to-br from-blue-400 to-blue-500 !border-0 text-white shadow-lg hover:shadow-xl transition-shadow" data-testid="treinos-ativos-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-opacity-90 text-sm font-medium mb-1">Treinos Ativos</p>
                <p className="text-5xl font-bold">{atribuicoes.length}</p>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card !bg-gradient-to-br from-emerald-400 to-emerald-500 !border-0 text-white shadow-lg hover:shadow-xl transition-shadow" data-testid="treinos-hoje-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-opacity-90 text-sm font-medium mb-1">Para Hoje</p>
                <p className="text-5xl font-bold">{treinosHoje.length}</p>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card !bg-gradient-to-br from-purple-400 to-purple-500 !border-0 text-white shadow-lg hover:shadow-xl transition-shadow" data-testid="treinos-concluidos-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-opacity-90 text-sm font-medium mb-1">Concluídos</p>
                <p className="text-5xl font-bold">{execucoes.length}</p>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Treinos de Hoje</h2>
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{diaHoje}</span>
            </div>

            {treinosHoje.length > 0 ? (
              <div className="space-y-4">
                {treinosHoje.map(atr => {
                  const treino = getTreino(atr.idTreino);
                  if (!treino) return null;
                  
                  return (
                    <div key={atr.id} data-testid={`treino-hoje-${atr.id}`} className="border-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 p-5 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{treino.nome}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{treino.exercicios?.length || 0} exercícios • {treino.duracao} min</p>
                        </div>
                        <span className="badge badge-active">{treino.tipo}</span>
                      </div>
                      {treino.descricao && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{treino.descricao}</p>
                      )}
                      <button
                        onClick={() => navigate(`/aluno/treino/${atr.id}`)}
                        data-testid={`iniciar-treino-${atr.id}-button`}
                        className="btn-primary w-full"
                      >
                        Iniciar Treino
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">Nenhum treino para hoje</p>
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Todos os Treinos</h2>
              <button
                onClick={() => navigate('/aluno/progresso')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Ver Progresso
              </button>
            </div>

            {atribuicoes.length > 0 ? (
              <div className="space-y-3">
                {atribuicoes.map(atr => {
                  const treino = getTreino(atr.idTreino);
                  if (!treino) return null;
                  
                  const ehHoje = atr.diasSemana.includes(diaHoje);
                  
                  return (
                    <div
                      key={atr.id}
                      data-testid={`treino-all-${atr.id}`}
                      className={`p-4 rounded-lg hover:shadow-sm transition-shadow cursor-pointer ${ehHoje ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700' : 'bg-gray-50 dark:bg-gray-800'}`}
                      onClick={() => navigate(`/aluno/treino/${atr.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{treino.nome}</h4>
                        {ehHoje && <span className="badge badge-success text-xs">Hoje</span>}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{atr.diasSemana.join(', ')}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{treino.exercicios?.length || 0} exercícios</span>
                        <span>{treino.duracao} min</span>
                        <span className="badge badge-active text-xs">{treino.nivel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">Nenhum treino atribuído</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Aguarde seu personal atribuir treinos</p>
              </div>
            )}
          </div>
        </div>

        {ultimasExecucoes.length > 0 && (
          <div className="card mt-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Últimos Treinos Realizados</h2>
            <div className="space-y-2">
              {ultimasExecucoes.map(exec => {
                const atr = atribuicoes.find(a => a.id === exec.idAtribuicao);
                const treino = atr ? getTreino(atr.idTreino) : null;
                
                return (
                  <div key={exec.id} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{treino?.nome || 'Treino'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(exec.dataExecucao).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">{exec.duracao} min</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{exec.exercicios?.length || 0} exercícios</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlunoDashboard;