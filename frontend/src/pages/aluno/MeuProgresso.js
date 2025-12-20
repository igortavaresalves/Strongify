import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import {
  buscarUsuarioPorId,
  listarExecucoesPorAluno,
  listarAtribuicoesPorAluno,
  buscarTreinoPorId
} from '../../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MeuProgresso = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [aluno, setAluno] = useState(null);
  const [execucoes, setExecucoes] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);
  const [treinos, setTreinos] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, [user]);

  const carregarDados = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [alunoData, execucoesData, atribuicoesData] = await Promise.all([
        buscarUsuarioPorId(user.id),
        listarExecucoesPorAluno(user.id),
        listarAtribuicoesPorAluno(user.id)
      ]);
      
      setAluno(alunoData);
      setExecucoes(execucoesData);
      setAtribuicoes(atribuicoesData);
      
      // Carregar treinos para cada atribuição
      const treinosMap = {};
      for (const atr of atribuicoesData) {
        try {
          const treino = await buscarTreinoPorId(atr.idTreino);
          treinosMap[atr.idTreino] = treino;
        } catch (error) {
          console.error('Erro ao buscar treino:', error);
        }
      }
      setTreinos(treinosMap);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !aluno) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const calcularIMC = (peso, altura) => {
    if (!peso || !altura) return 0;
    return (peso / (altura * altura)).toFixed(1);
  };

  const dadosGraficoPeso = aluno.historicoMedidas?.map(m => ({
    data: new Date(m.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    peso: m.peso,
    imc: calcularIMC(m.peso, m.altura)
  })) || [];

  const ultimas4Semanas = () => {
    const hoje = new Date();
    const semanas = [];
    
    for (let i = 3; i >= 0; i--) {
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - (i * 7) - hoje.getDay());
      
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6);
      
      const treinosDaSemana = execucoes.filter(exec => {
        const dataExec = new Date(exec.dataExecucao);
        return dataExec >= inicioSemana && dataExec <= fimSemana;
      });
      
      semanas.push({
        semana: `Sem ${4 - i}`,
        treinos: treinosDaSemana.length,
        tempoTotal: treinosDaSemana.reduce((acc, t) => acc + (t.duracao || 0), 0)
      });
    }
    
    return semanas;
  };

  const dadosGraficoSemanal = ultimas4Semanas();

  const estatisticas = {
    totalTreinos: execucoes.length,
    tempoTotal: execucoes.reduce((acc, exec) => acc + (exec.duracao || 0), 0),
    mediaTempoTreino: execucoes.length > 0 
      ? Math.round(execucoes.reduce((acc, exec) => acc + (exec.duracao || 0), 0) / execucoes.length) 
      : 0,
    ultimaSemana: execucoes.filter(exec => {
      const hoje = new Date();
      const umaSemanaAtras = new Date(hoje.setDate(hoje.getDate() - 7));
      return new Date(exec.dataExecucao) >= umaSemanaAtras;
    }).length
  };

  const ultimosTreinos = execucoes
    .sort((a, b) => new Date(b.dataExecucao) - new Date(a.dataExecucao))
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Meu Progresso</h1>
            <p className="text-gray-600 dark:text-gray-400">Acompanhe sua evolução</p>
          </div>
          <button onClick={() => navigate('/aluno/dashboard')} className="btn-secondary">
            ← Voltar ao Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card !bg-gradient-to-br from-blue-400 to-blue-500 !border-0 text-white shadow-lg hover:shadow-xl transition-shadow" data-testid="total-treinos-stat">
            <p className="text-white text-opacity-90 text-sm font-medium mb-1">Total de Treinos</p>
            <p className="text-5xl font-bold">{estatisticas.totalTreinos}</p>
          </div>

          <div className="card !bg-gradient-to-br from-emerald-400 to-emerald-500 !border-0 text-white shadow-lg hover:shadow-xl transition-shadow" data-testid="ultima-semana-stat">
            <p className="text-white text-opacity-90 text-sm font-medium mb-1">Última Semana</p>
            <p className="text-5xl font-bold">{estatisticas.ultimaSemana}</p>
          </div>

          <div className="card !bg-gradient-to-br from-purple-400 to-purple-500 !border-0 text-white shadow-lg hover:shadow-xl transition-shadow" data-testid="tempo-total-stat">
            <p className="text-white text-opacity-90 text-sm font-medium mb-1">Tempo Total</p>
            <p className="text-5xl font-bold">{estatisticas.tempoTotal}</p>
            <p className="text-white text-opacity-90 text-xs mt-1">minutos</p>
          </div>

          <div className="card !bg-gradient-to-br from-orange-400 to-orange-500 !border-0 text-white shadow-lg hover:shadow-xl transition-shadow" data-testid="media-tempo-stat">
            <p className="text-white text-opacity-90 text-sm font-medium mb-1">Média por Treino</p>
            <p className="text-5xl font-bold">{estatisticas.mediaTempoTreino}</p>
            <p className="text-white text-opacity-90 text-xs mt-1">minutos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Evolução de Peso</h2>
            {dadosGraficoPeso.length > 1 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosGraficoPeso}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="peso" stroke="#0066FF" strokeWidth={2} name="Peso (kg)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>Dados insuficientes para gráfico</p>
                <p className="text-sm mt-2">Solicite ao seu personal para adicionar mais medidas</p>
              </div>
            )}

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Peso Atual</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{aluno.peso}kg</p>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Altura</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{aluno.altura}m</p>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">IMC</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{calcularIMC(aluno.peso, aluno.altura)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Frequência Semanal</h2>
            {dadosGraficoSemanal.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosGraficoSemanal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="treinos" fill="#0066FF" name="Treinos" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>Nenhum treino realizado ainda</p>
              </div>
            )}

            <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Meta semanal:</strong> Mantenha a consistência! Tente treinar pelo menos 3x por semana.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Histórico Detalhado</h2>
          
          {ultimosTreinos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Treino</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Exercícios</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Duração</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {ultimosTreinos.map(exec => {
                    const atr = atribuicoes.find(a => a.id === exec.idAtribuicao);
                    const treino = atr ? treinos[atr.idTreino] : null;
                    
                    return (
                      <tr key={exec.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(exec.dataExecucao).toLocaleString('pt-BR', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                          {treino?.nome || 'Treino'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {exec.exercicios?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {exec.duracao} min
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">Nenhum treino realizado ainda</p>
              <button onClick={() => navigate('/aluno/dashboard')} className="btn-primary mt-4">
                Iniciar Primeiro Treino
              </button>
            </div>
          )}
        </div>

        {aluno.objetivo && (
          <div className="card mt-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-2 border-blue-200 dark:border-blue-700">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Seu Objetivo</h3>
                <p className="text-gray-700 dark:text-gray-300">{aluno.objetivo}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Continue firme no treino! Consistência é a chave para alcançar seus objetivos.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeuProgresso;
