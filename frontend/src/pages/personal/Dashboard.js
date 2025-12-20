import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import {
  listarAlunosPorPersonal,
  listarTreinosPorPersonal,
  listarAtribuicoesPorPersonal
} from '../../services/api';

const PersonalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAlunos: 0,
    totalTreinos: 0,
    alunosAtivos: 0
  });
  const [alunos, setAlunos] = useState([]);

  useEffect(() => {
    carregarStats();
  }, [user]);

  useEffect(() => {
    const handleDataChanged = () => {
      carregarStats();
    };

    window.addEventListener('dataChanged', handleDataChanged);
    window.addEventListener('storage', handleDataChanged);

    return () => {
      window.removeEventListener('dataChanged', handleDataChanged);
      window.removeEventListener('storage', handleDataChanged);
    };
  }, [user]);

  const carregarStats = async () => {
    if (!user) return;

    try {
      const [alunosData, treinosData, atribuicoesData] = await Promise.all([
        listarAlunosPorPersonal(user.id),
        listarTreinosPorPersonal(user.id),
        listarAtribuicoesPorPersonal(user.id)
      ]);

      const alunosAtivosSet = new Set(
        atribuicoesData
          .filter(a => a.status === 'ativo')
          .map(a => a.idAluno)
      );

      setStats({
        totalAlunos: alunosData.length,
        totalTreinos: treinosData.length,
        alunosAtivos: alunosAtivosSet.size
      });

      setAlunos(alunosData.slice(0, 4));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const calcularIMC = (peso, altura) => {
    if (!peso || !altura) return 0;
    return (peso / (altura * altura)).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Bem-vindo de volta, {user?.nome}!</p>
          <div className="mt-4 inline-block px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Seu código:</span>{' '}
              <span className="font-mono text-blue-600">{user?.id}</span>
              <span className="ml-2 text-gray-500">(Compartilhe com seus alunos)</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card !bg-gradient-to-br from-blue-400 to-blue-500 !border-0 text-white shadow-lg hover:shadow-xl transition-shadow" data-testid="total-alunos-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-opacity-90 text-sm font-medium mb-1">Total de Alunos</p>
                <p className="text-5xl font-bold">{stats.totalAlunos}</p>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card !bg-gradient-to-br from-purple-400 to-purple-500 !border-0 text-white shadow-lg hover:shadow-xl transition-shadow" data-testid="total-treinos-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-opacity-90 text-sm font-medium mb-1">Treinos Criados</p>
                <p className="text-5xl font-bold">{stats.totalTreinos}</p>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card !bg-gradient-to-br from-emerald-400 to-emerald-500 !border-0 text-white shadow-lg hover:shadow-xl transition-shadow" data-testid="alunos-ativos-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-opacity-90 text-sm font-medium mb-1">Alunos Ativos</p>
                <p className="text-5xl font-bold">{stats.alunosAtivos}</p>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Ações Rápidas</h2>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/personal/alunos/novo')}
                data-testid="quick-add-aluno-button"
                className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Adicionar Aluno</p>
                    <p className="text-sm text-gray-600">Cadastrar novo aluno</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => navigate('/personal/treinos/novo')}
                data-testid="quick-create-treino-button"
                className="w-full flex items-center justify-between p-4 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Criar Treino</p>
                    <p className="text-sm text-gray-600">Montar novo treino</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => navigate('/personal/alunos')}
                data-testid="quick-view-alunos-button"
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Ver Todos Alunos</p>
                    <p className="text-sm text-gray-600">Gerenciar alunos</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Alunos Recentes</h2>
              <button
                onClick={() => navigate('/personal/alunos')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todos
              </button>
            </div>
            {alunos.length > 0 ? (
              <div className="space-y-4">
                {alunos.map((aluno) => (
                  <div
                    key={aluno.id}
                    data-testid={`recent-aluno-${aluno.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/personal/alunos/${aluno.id}`)}
                  >
                    <div className="flex items-center space-x-3">
                      {aluno.avatar ? (
                        <img
                          src={aluno.avatar}
                          alt={aluno.nome}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {aluno.nome?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{aluno.nome}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{aluno.peso}kg</span>
                          <span>•</span>
                          <span>{aluno.altura}m</span>
                          <span>•</span>
                          <span>IMC: {calcularIMC(aluno.peso, aluno.altura)}</span>
                        </div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-gray-500 mb-4">Nenhum aluno cadastrado ainda</p>
                <button
                  onClick={() => navigate('/personal/alunos/novo')}
                  className="btn-primary"
                >
                  Adicionar Primeiro Aluno
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDashboard;