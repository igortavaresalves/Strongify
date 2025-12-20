import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import {
  buscarUsuarioPorId,
  adicionarMedida,
  listarTreinosPorPersonal,
  listarAtribuicoesPorAluno,
  criarAtribuicao,
  buscarTreinoPorId,
  listarExecucoesPorAluno
} from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const DetalhesAluno = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aluno, setAluno] = useState(null);
  const [treinos, setTreinos] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);
  const [execucoes, setExecucoes] = useState([]);
  const [mostrarAdicionarMedida, setMostrarAdicionarMedida] = useState(false);
  const [novoPeso, setNovoPeso] = useState('');
  const [novaAltura, setNovaAltura] = useState('');
  const [mostrarAtribuir, setMostrarAtribuir] = useState(false);
  const [treinoSelecionado, setTreinoSelecionado] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [diasSemana, setDiasSemana] = useState([]);

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      const alunoData = await buscarUsuarioPorId(id);
      setAluno(alunoData);
      
      if (alunoData) {
        const [treinosData, atribuicoesData, execucoesData] = await Promise.all([
          listarTreinosPorPersonal(user.id),
          listarAtribuicoesPorAluno(id),
          listarExecucoesPorAluno(id)
        ]);
        
        setTreinos(treinosData);
        setAtribuicoes(atribuicoesData);
        setExecucoes(execucoesData);
        
        setNovoPeso(alunoData.peso?.toString() || '');
        setNovaAltura(alunoData.altura?.toString() || '');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const handleAdicionarMedida = async () => {
    if (!novoPeso || !novaAltura) {
      toast.error('Preencha peso e altura');
      return;
    }

    try {
      await adicionarMedida(id, {
        peso: parseFloat(novoPeso),
        altura: parseFloat(novaAltura)
      });

      toast.success('Medida adicionada!');
      setMostrarAdicionarMedida(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao adicionar medida:', error);
      toast.error('Erro ao adicionar medida');
    }
  };

  const handleAtribuirTreino = async () => {
    if (!treinoSelecionado || !dataInicio || diasSemana.length === 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await criarAtribuicao({
        idAluno: id,
        idTreino: treinoSelecionado,
        dataInicio,
        dataFim: dataFim || null,
        diasSemana
      });

      toast.success('Treino atribuído com sucesso!');
      setMostrarAtribuir(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao atribuir treino:', error);
      toast.error('Erro ao atribuir treino');
    }
  };

  const toggleDia = (dia) => {
    if (diasSemana.includes(dia)) {
      setDiasSemana(diasSemana.filter(d => d !== dia));
    } else {
      setDiasSemana([...diasSemana, dia]);
    }
  };

  if (!aluno) {
    return <div>Carregando...</div>;
  }

  const dadosGrafico = aluno.historicoMedidas?.map(m => ({
    data: new Date(m.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    peso: m.peso
  })) || [];

  const calcularIMC = (peso, altura) => {
    if (!peso || !altura) return 0;
    return (peso / (altura * altura)).toFixed(1);
  };

  const dias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/personal/alunos')} className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar aos alunos
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card lg:col-span-1">
            <div className="text-center mb-6">
              {aluno.avatar ? (
                <img src={aluno.avatar} alt={aluno.nome} className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-blue-200" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-4xl">{aluno.nome?.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{aluno.nome}</h2>
              <p className="text-gray-500">{aluno.email}</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Idade</span>
                <span className="font-semibold">{aluno.idade} anos</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Peso</span>
                <span className="font-semibold">{aluno.peso} kg</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Altura</span>
                <span className="font-semibold">{aluno.altura} m</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">IMC</span>
                <span className="font-semibold">{calcularIMC(aluno.peso, aluno.altura)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Sexo</span>
                <span className="font-semibold">{aluno.sexo === 'M' ? 'Masculino' : 'Feminino'}</span>
              </div>
              {aluno.objetivo && (
                <div className="py-2">
                  <span className="text-gray-600">Objetivo</span>
                  <p className="font-semibold mt-1">{aluno.objetivo}</p>
                </div>
              )}
              {aluno.restricoes && (
                <div className="py-2">
                  <span className="text-gray-600">Restrições</span>
                  <p className="font-semibold mt-1">{aluno.restricoes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-2">
              <button onClick={() => navigate(`/personal/alunos/${id}/editar`)} className="btn-primary w-full">Editar Aluno</button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Evolução de Peso</h3>
                <button onClick={() => setMostrarAdicionarMedida(!mostrarAdicionarMedida)} className="btn-secondary text-sm">
                  + Nova Medida
                </button>
              </div>

              {mostrarAdicionarMedida && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Peso (kg)</label>
                      <input type="number" value={novoPeso} onChange={(e) => setNovoPeso(e.target.value)} className="input-field" step="0.1" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Altura (m)</label>
                      <input type="number" value={novaAltura} onChange={(e) => setNovaAltura(e.target.value)} className="input-field" step="0.01" />
                    </div>
                  </div>
                  <button onClick={handleAdicionarMedida} className="btn-primary w-full">Salvar Medida</button>
                </div>
              )}

              {dadosGrafico.length > 0 && (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dadosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="peso" stroke="#0066FF" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Treinos Atribuídos</h3>
                <button onClick={() => setMostrarAtribuir(!mostrarAtribuir)} className="btn-primary text-sm">+ Atribuir Treino</button>
              </div>

              {mostrarAtribuir && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Treino *</label>
                      <select value={treinoSelecionado} onChange={(e) => setTreinoSelecionado(e.target.value)} className="input-field">
                        <option value="">Selecione um treino</option>
                        {treinos.map(t => (
                          <option key={t.id} value={t.id}>{t.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Data Início *</label>
                        <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Data Fim</label>
                        <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="input-field" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Dias da Semana *</label>
                      <div className="grid grid-cols-4 gap-2">
                        {dias.map(dia => (
                          <button key={dia} type="button" onClick={() => toggleDia(dia)} className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${diasSemana.includes(dia) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700'}`}>
                            {dia.charAt(0).toUpperCase() + dia.slice(1, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={handleAtribuirTreino} className="btn-primary w-full">Atribuir Treino</button>
                  </div>
                </div>
              )}

              {atribuicoes.length > 0 ? (
                <div className="space-y-3">
                  {atribuicoes.map(atr => {
                    const treino = buscarTreinoPorId(atr.idTreino);
                    return (
                      <div key={atr.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{treino?.nome || 'Treino'}</h4>
                            <p className="text-sm text-gray-600">{atr.diasSemana.join(', ')}</p>
                          </div>
                          <span className={`badge ${atr.status === 'ativo' ? 'badge-active' : 'badge-error'}`}>{atr.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Nenhum treino atribuído</p>
              )}
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Histórico de Treinos</h3>
              {execucoes.length > 0 ? (
                <div className="space-y-2">
                  {execucoes.slice(0, 10).map(exec => (
                    <div key={exec.id} className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm text-gray-700">{new Date(exec.dataExecucao).toLocaleString('pt-BR')}</span>
                      <span className="text-sm font-semibold text-gray-900">{exec.duracao} min</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Nenhum treino executado ainda</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalhesAluno;
