import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import VideoPlayer from '../../components/VideoPlayer';
import { criarTreino, buscarTreinoPorId, atualizarTreino } from '../../services/api';
import { fileToBase64 } from '../../utils/localStorage';
import { toast } from 'sonner';

const generateId = (prefix = 'EX') => {
  return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
};

const FormTreino = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState('Hipertrofia');
  const [duracao, setDuracao] = useState('');
  const [nivel, setNivel] = useState('Intermediário');
  const [observacoes, setObservacoes] = useState('');
  const [exercicios, setExercicios] = useState([]);
  
  const [mostrarFormExercicio, setMostrarFormExercicio] = useState(false);
  const [exercicioEditando, setExercicioEditando] = useState(null);
  const [nomeExercicio, setNomeExercicio] = useState('');
  const [series, setSeries] = useState('');
  const [repeticoes, setRepeticoes] = useState('');
  const [carga, setCarga] = useState('');
  const [descanso, setDescanso] = useState('');
  const [observacoesExercicio, setObservacoesExercicio] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoLocal, setVideoLocal] = useState(null);
  const [tipoVideo, setTipoVideo] = useState('youtube');

  useEffect(() => {
    if (id) {
      carregarTreino();
    }
  }, [id]);

  const carregarTreino = async () => {
    try {
      const treino = await buscarTreinoPorId(id);
      setNome(treino.nome);
      setDescricao(treino.descricao || '');
      setTipo(treino.tipo);
      setDuracao(treino.duracao?.toString() || '');
      setNivel(treino.nivel);
      setObservacoes(treino.observacoes || '');
      setExercicios(treino.exercicios || []);
    } catch (error) {
      console.error('Erro ao carregar treino:', error);
      toast.error('Erro ao carregar treino');
    }
  };

  const handleVideoLocalChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error('Vídeo deve ter no máximo 3MB');
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        setVideoLocal(base64);
      } catch (error) {
        toast.error('Erro ao processar vídeo');
      }
    }
  };

  const limparFormExercicio = () => {
    setNomeExercicio('');
    setSeries('');
    setRepeticoes('');
    setCarga('');
    setDescanso('');
    setObservacoesExercicio('');
    setVideoUrl('');
    setVideoLocal(null);
    setTipoVideo('youtube');
    setExercicioEditando(null);
  };

  const handleAdicionarExercicio = () => {
    if (!nomeExercicio || !series || !repeticoes) {
      toast.error('Preencha nome, séries e repetições');
      return;
    }

    const exercicio = {
      id: exercicioEditando?.id || generateId('EX'),
      nome: nomeExercicio,
      series: parseInt(series),
      repeticoes,
      carga: carga ? parseFloat(carga) : null,
      descanso: descanso ? parseInt(descanso) : 60,
      observacoes: observacoesExercicio,
      videoUrl: tipoVideo === 'youtube' ? videoUrl : null,
      videoLocal: tipoVideo === 'local' ? videoLocal : null
    };

    if (exercicioEditando) {
      setExercicios(exercicios.map(ex => ex.id === exercicio.id ? exercicio : ex));
      toast.success('Exercício atualizado!');
    } else {
      setExercicios([...exercicios, exercicio]);
      toast.success('Exercício adicionado!');
    }

    limparFormExercicio();
    setMostrarFormExercicio(false);
  };

  const handleEditarExercicio = (exercicio) => {
    setNomeExercicio(exercicio.nome);
    setSeries(exercicio.series?.toString() || '');
    setRepeticoes(exercicio.repeticoes?.toString() || '');
    setCarga(exercicio.carga?.toString() || '');
    setDescanso(exercicio.descanso?.toString() || '');
    setObservacoesExercicio(exercicio.observacoes || '');
    setVideoUrl(exercicio.videoUrl || '');
    setVideoLocal(exercicio.videoLocal || null);
    setTipoVideo(exercicio.videoUrl ? 'youtube' : 'local');
    setExercicioEditando(exercicio);
    setMostrarFormExercicio(true);
  };

  const handleDeletarExercicio = (id) => {
    setExercicios(exercicios.filter(ex => ex.id !== id));
    toast.success('Exercício removido');
  };

  const handleMoverExercicio = (index, direcao) => {
    const novaLista = [...exercicios];
    const novoIndex = direcao === 'cima' ? index - 1 : index + 1;
    
    if (novoIndex >= 0 && novoIndex < novaLista.length) {
      [novaLista[index], novaLista[novoIndex]] = [novaLista[novoIndex], novaLista[index]];
      setExercicios(novaLista);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!nome || !duracao || exercicios.length === 0) {
      toast.error('Preencha nome, duração e adicione ao menos 1 exercício');
      setLoading(false);
      return;
    }

    const dadosTreino = {
      nome,
      descricao,
      tipo,
      duracao: parseInt(duracao),
      nivel,
      observacoes,
      exercicios
    };

    console.log('Enviando treino:', dadosTreino);

    try {
      if (id) {
        const result = await atualizarTreino(id, dadosTreino);
        console.log('Treino atualizado:', result);
        toast.success('Treino atualizado com sucesso!');
      } else {
        const result = await criarTreino(dadosTreino);
        console.log('Treino criado:', result);
        toast.success('Treino criado com sucesso!');
      }
      navigate('/personal/treinos');
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
      console.error('Detalhes do erro:', error.response);
      const message = error.response?.data?.detail || error.message || 'Erro ao salvar treino';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <button onClick={() => navigate('/personal/treinos')} className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar aos treinos
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{id ? 'Editar Treino' : 'Criar Novo Treino'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Informações do Treino</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-2">Nome do Treino *</label>
                <input type="text" id="nome" data-testid="treino-nome-input" value={nome} onChange={(e) => setNome(e.target.value)} className="input-field" placeholder="Ex: Treino A - Peito e Tríceps" required />
              </div>

              <div>
                <label htmlFor="descricao" className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                <textarea id="descricao" data-testid="treino-descricao-input" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="input-field" rows={2} placeholder="Breve descrição do treino" />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="tipo" className="block text-sm font-semibold text-gray-700 mb-2">Tipo *</label>
                  <select id="tipo" data-testid="treino-tipo-select" value={tipo} onChange={(e) => setTipo(e.target.value)} className="input-field">
                    <option>Hipertrofia</option>
                    <option>Força</option>
                    <option>Resistência</option>
                    <option>Flexibilidade</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="duracao" className="block text-sm font-semibold text-gray-700 mb-2">Duração (min) *</label>
                  <input type="number" id="duracao" data-testid="treino-duracao-input" value={duracao} onChange={(e) => setDuracao(e.target.value)} className="input-field" min="1" required />
                </div>

                <div>
                  <label htmlFor="nivel" className="block text-sm font-semibold text-gray-700 mb-2">Nível *</label>
                  <select id="nivel" data-testid="treino-nivel-select" value={nivel} onChange={(e) => setNivel(e.target.value)} className="input-field">
                    <option>Iniciante</option>
                    <option>Intermediário</option>
                    <option>Avançado</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="observacoes" className="block text-sm font-semibold text-gray-700 mb-2">Observações Gerais</label>
                <textarea id="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="input-field" rows={2} placeholder="Dicas gerais para este treino" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Exercícios</h2>
                <p className="text-sm text-gray-600 mt-1">{exercicios.length} exercício(s) adicionado(s)</p>
              </div>
              <button type="button" onClick={() => setMostrarFormExercicio(!mostrarFormExercicio)} data-testid="toggle-add-exercicio-button" className="btn-primary text-sm">
                {mostrarFormExercicio ? 'Cancelar' : '+ Adicionar Exercício'}
              </button>
            </div>

            {mostrarFormExercicio && (
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h3 className="font-bold text-gray-900 mb-4">{exercicioEditando ? 'Editar' : 'Novo'} Exercício</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Exercício *</label>
                    <input type="text" data-testid="exercicio-nome-input" value={nomeExercicio} onChange={(e) => setNomeExercicio(e.target.value)} className="input-field" placeholder="Ex: Supino com Barra" />
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Séries *</label>
                      <input type="number" data-testid="exercicio-series-input" value={series} onChange={(e) => setSeries(e.target.value)} className="input-field" min="1" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Repetições *</label>
                      <input type="text" data-testid="exercicio-repeticoes-input" value={repeticoes} onChange={(e) => setRepeticoes(e.target.value)} className="input-field" placeholder="Ex: 8-12" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Carga (kg)</label>
                      <input type="number" data-testid="exercicio-carga-input" value={carga} onChange={(e) => setCarga(e.target.value)} className="input-field" step="0.5" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Descanso (s)</label>
                      <input type="number" data-testid="exercicio-descanso-input" value={descanso} onChange={(e) => setDescanso(e.target.value)} className="input-field" placeholder="60" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Observações/Técnica</label>
                    <textarea data-testid="exercicio-observacoes-input" value={observacoesExercicio} onChange={(e) => setObservacoesExercicio(e.target.value)} className="input-field" rows={2} placeholder="Dicas de execução" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Vídeo de Referência</label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button type="button" onClick={() => setTipoVideo('youtube')} className={`py-2 px-4 rounded-lg border-2 font-medium transition-all ${tipoVideo === 'youtube' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700'}`}>
                        YouTube
                      </button>
                      <button type="button" onClick={() => setTipoVideo('local')} className={`py-2 px-4 rounded-lg border-2 font-medium transition-all ${tipoVideo === 'local' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700'}`}>
                        Upload Local
                      </button>
                    </div>

                    {tipoVideo === 'youtube' ? (
                      <div>
                        <input type="url" data-testid="exercicio-video-url-input" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="input-field" placeholder="https://www.youtube.com/watch?v=..." />
                        {videoUrl && (
                          <div className="mt-4">
                            <VideoPlayer videoUrl={videoUrl} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <input type="file" data-testid="exercicio-video-file-input" accept="video/*" onChange={handleVideoLocalChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        <p className="text-xs text-gray-500 mt-1">Máximo 3MB</p>
                        {videoLocal && (
                          <div className="mt-4">
                            <VideoPlayer videoLocal={videoLocal} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button type="button" onClick={handleAdicionarExercicio} data-testid="save-exercicio-button" className="btn-primary w-full">
                    {exercicioEditando ? 'Salvar Alterações' : 'Adicionar Exercício'}
                  </button>
                </div>
              </div>
            )}

            {exercicios.length > 0 ? (
              <div className="space-y-3">
                {exercicios.map((exercicio, index) => (
                  <div key={exercicio.id} data-testid={`exercicio-item-${exercicio.id}`} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">{index + 1}</span>
                          <h4 className="font-bold text-gray-900">{exercicio.nome}</h4>
                        </div>
                        <div className="ml-11 space-y-1 text-sm text-gray-600">
                          <p><strong>Séries:</strong> {exercicio.series} | <strong>Repetições:</strong> {exercicio.repeticoes}</p>
                          {exercicio.carga && <p><strong>Carga:</strong> {exercicio.carga}kg</p>}
                          <p><strong>Descanso:</strong> {exercicio.descanso || 60}s</p>
                          {exercicio.observacoes && <p className="text-gray-500 italic">{exercicio.observacoes}</p>}
                          {(exercicio.videoUrl || exercicio.videoLocal) && (
                            <span className="inline-flex items-center text-blue-600 text-xs">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Vídeo disponível
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <div className="flex flex-col space-y-1">
                          <button type="button" onClick={() => handleMoverExercicio(index, 'cima')} disabled={index === 0} className="p-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button type="button" onClick={() => handleMoverExercicio(index, 'baixo')} disabled={index === exercicios.length - 1} className="p-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        <button type="button" onClick={() => handleEditarExercicio(exercicio)} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button type="button" onClick={() => handleDeletarExercicio(exercicio.id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p>Nenhum exercício adicionado ainda</p>
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex space-x-3">
              <button type="submit" disabled={loading || exercicios.length === 0} data-testid="submit-treino-button" className="btn-primary flex-1">
                {loading ? 'Salvando...' : (id ? 'Salvar Alterações' : 'Criar Treino')}
              </button>
              <button type="button" onClick={() => navigate('/personal/treinos')} className="btn-secondary">Cancelar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormTreino;
