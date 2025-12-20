import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import VideoPlayer from '../../components/VideoPlayer';
import {
  listarAtribuicoesPorAluno,
  buscarTreinoPorId,
  criarExecucao
} from '../../services/api';
import { toast } from 'sonner';

const ExecutarTreino = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [atribuicao, setAtribuicao] = useState(null);
  const [treino, setTreino] = useState(null);
  const [exercicioAtual, setExercicioAtual] = useState(0);
  const [serieAtual, setSerieAtual] = useState(1);
  const [emDescanso, setEmDescanso] = useState(false);
  const [tempoDescanso, setTempoDescanso] = useState(0);
  const [registros, setRegistros] = useState([]);
  const [repeticoesFeitas, setRepeticoesFeitas] = useState('');
  const [cargaUtilizada, setCargaUtilizada] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [inicioTreino, setInicioTreino] = useState(null);

  useEffect(() => {
    carregarDados();
  }, [id, user]);

  useEffect(() => {
    let interval;
    if (emDescanso && tempoDescanso > 0) {
      interval = setInterval(() => {
        setTempoDescanso(prev => {
          if (prev <= 1) {
            setEmDescanso(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emDescanso, tempoDescanso]);

  const carregarDados = async () => {
    if (!user) return;
    
    try {
      const atribuicoes = await listarAtribuicoesPorAluno(user.id);
      const atr = atribuicoes.find(a => a.id === id);
      
      if (atr) {
        setAtribuicao(atr);
        const treinoData = await buscarTreinoPorId(atr.idTreino);
        setTreino(treinoData);
        setInicioTreino(new Date());
        
        if (treinoData?.exercicios) {
          const cargaPadrao = treinoData.exercicios[0]?.carga?.toString() || '';
          setCargaUtilizada(cargaPadrao);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar treino:', error);
      toast.error('Erro ao carregar treino');
    }
  };

  const exercicio = treino?.exercicios?.[exercicioAtual];
  const totalExercicios = treino?.exercicios?.length || 0;

  const handleProximaSerie = () => {
    if (!repeticoesFeitas) {
      toast.error('Registre as repetições realizadas');
      return;
    }

    const registro = {
      idExercicio: exercicio.id,
      serie: serieAtual,
      repeticoesFeit: parseInt(repeticoesFeitas) || 0,
      cargaUtilizada: parseFloat(cargaUtilizada) || null,
      observacoes,
      dataConclusao: new Date().toISOString()
    };

    setRegistros([...registros, registro]);

    if (serieAtual < exercicio.series) {
      setSerieAtual(serieAtual + 1);
      setEmDescanso(true);
      setTempoDescanso(exercicio.descanso || 60);
      setRepeticoesFeitas('');
      setObservacoes('');
      toast.success(`Série ${serieAtual} concluída! Descanse ${exercicio.descanso || 60}s`);
    } else {
      proximoExercicio();
    }
  };

  const proximoExercicio = () => {
    if (exercicioAtual < totalExercicios - 1) {
      setExercicioAtual(exercicioAtual + 1);
      setSerieAtual(1);
      setRepeticoesFeitas('');
      setCargaUtilizada(treino.exercicios[exercicioAtual + 1]?.carga?.toString() || '');
      setObservacoes('');
      setEmDescanso(false);
      toast.success('Exercício concluído!');
    } else {
      finalizarTreino();
    }
  };

  const pularDescanso = () => {
    setEmDescanso(false);
    setTempoDescanso(0);
  };

  const finalizarTreino = async () => {
    const duracaoMinutos = Math.round((new Date() - inicioTreino) / 60000);
    
    const exerciciosAgrupados = registros.reduce((acc, reg) => {
      const existe = acc.find(e => e.idExercicio === reg.idExercicio);
      if (existe) {
        existe.series.push({
          serie: reg.serie,
          repeticoesFeit: reg.repeticoesFeit,
          cargaUtilizada: reg.cargaUtilizada,
          observacoes: reg.observacoes
        });
      } else {
        acc.push({
          idExercicio: reg.idExercicio,
          series: [{
            serie: reg.serie,
            repeticoesFeit: reg.repeticoesFeit,
            cargaUtilizada: reg.cargaUtilizada,
            observacoes: reg.observacoes
          }]
        });
      }
      return acc;
    }, []);

    try {
      await criarExecucao({
        idAtribuicao: id,
        duracao: duracaoMinutos,
        exercicios: exerciciosAgrupados
      });

      toast.success('🎉 Treino finalizado com sucesso!');
      navigate('/aluno/dashboard');
    } catch (error) {
      console.error('Erro ao finalizar treino:', error);
      toast.error('Erro ao salvar treino');
    }
  };

  const voltarExercicio = () => {
    if (exercicioAtual > 0) {
      setExercicioAtual(exercicioAtual - 1);
      setSerieAtual(1);
      setRepeticoesFeitas('');
      setCargaUtilizada(treino.exercicios[exercicioAtual - 1]?.carga?.toString() || '');
      setObservacoes('');
      setEmDescanso(false);
    }
  };

  if (!treino || !exercicio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando treino...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => {
              if (window.confirm('Tem certeza que deseja sair? O progresso será perdido.')) {
                navigate('/aluno/dashboard');
              }
            }} className="text-red-600 hover:text-red-700 font-medium">
              ← Sair do Treino
            </button>
            <div className="text-sm text-gray-600">
              Exercício {exercicioAtual + 1} de {totalExercicios}
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((exercicioAtual + (serieAtual / exercicio.series)) / totalExercicios) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 text-center">{Math.round(((exercicioAtual + (serieAtual / exercicio.series)) / totalExercicios) * 100)}% concluído</p>
        </div>

        {emDescanso ? (
          <div className="card text-center py-16" data-testid="descanso-screen">
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mb-4">
                <span className="text-5xl font-bold text-white">{tempoDescanso}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tempo de Descanso</h2>
              <p className="text-gray-600">Prepare-se para a próxima série</p>
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              <button onClick={pularDescanso} data-testid="skip-descanso-button" className="btn-secondary w-full">
                Pular Descanso
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{exercicio.nome}</h1>
                  <p className="text-gray-600">Série {serieAtual} de {exercicio.series}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Repetições</p>
                  <p className="text-2xl font-bold text-blue-600">{exercicio.repeticoes}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Séries</p>
                  <p className="font-semibold text-gray-900">{exercicio.series}</p>
                </div>
                {exercicio.carga && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Carga Sugerida</p>
                    <p className="font-semibold text-gray-900">{exercicio.carga}kg</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Descanso</p>
                  <p className="font-semibold text-gray-900">{exercicio.descanso || 60}s</p>
                </div>
              </div>

              {exercicio.observacoes && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-1">💡 Técnica:</p>
                  <p className="text-sm text-gray-700">{exercicio.observacoes}</p>
                </div>
              )}

              {(exercicio.videoUrl || exercicio.videoLocal) && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">📹 Vídeo de Referência:</h3>
                  <VideoPlayer 
                    videoUrl={exercicio.videoUrl} 
                    videoLocal={exercicio.videoLocal}
                    className="rounded-lg overflow-hidden"
                  />
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Registrar Série {serieAtual}</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Repetições Realizadas *</label>
                  <input 
                    type="number" 
                    data-testid="repeticoes-input"
                    value={repeticoesFeitas} 
                    onChange={(e) => setRepeticoesFeitas(e.target.value)}
                    className="input-field text-2xl font-bold text-center"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Carga Utilizada (kg)</label>
                  <input 
                    type="number" 
                    data-testid="carga-input"
                    value={cargaUtilizada} 
                    onChange={(e) => setCargaUtilizada(e.target.value)}
                    className="input-field text-center"
                    placeholder="Ex: 80"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Observações (opcional)</label>
                  <textarea 
                    data-testid="observacoes-input"
                    value={observacoes} 
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="input-field"
                    rows={2}
                    placeholder="Ex: Senti dor, foi fácil, preciso aumentar carga..."
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                {exercicioAtual > 0 && (
                  <button 
                    onClick={voltarExercicio}
                    className="btn-secondary"
                  >
                    ← Anterior
                  </button>
                )}
                <button 
                  onClick={handleProximaSerie}
                  data-testid="proxima-serie-button"
                  className="btn-primary flex-1"
                >
                  {serieAtual < exercicio.series ? 'Próxima Série' : (exercicioAtual < totalExercicios - 1 ? 'Próximo Exercício' : 'Finalizar Treino')}
                </button>
              </div>
            </div>

            {registros.length > 0 && (
              <div className="card mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Registro do Treino</h3>
                <div className="space-y-2">
                  {registros.map((reg, idx) => {
                    const ex = treino.exercicios.find(e => e.id === reg.idExercicio);
                    return (
                      <div key={idx} className="text-sm p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold">{ex?.nome}</span> - Série {reg.serie}: {reg.repeticoesFeit} reps
                        {reg.cargaUtilizada && ` @ ${reg.cargaUtilizada}kg`}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExecutarTreino;
