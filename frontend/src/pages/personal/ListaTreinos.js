import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { listarTreinosPorPersonal, deletarTreino } from '../../services/api';
import { toast } from 'sonner';

const ListaTreinos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [treinos, setTreinos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarTreinos();
  }, [user]);

  const carregarTreinos = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const dados = await listarTreinosPorPersonal(user.id);
      setTreinos(dados);
    } catch (error) {
      console.error('Erro ao carregar treinos:', error);
      toast.error('Erro ao carregar treinos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja deletar o treino "${nome}"?`)) {
      try {
        await deletarTreino(id);
        toast.success('Treino deletado com sucesso');
        carregarTreinos();
      } catch (error) {
        console.error('Erro ao deletar treino:', error);
        toast.error('Erro ao deletar treino');
      }
    }
  };

  const treinosFiltrados = treinos.filter(treino =>
    treino.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  const getTipoBadge = (tipo) => {
    const badges = {
      'Hipertrofia': 'badge-active',
      'Força': 'badge-success',
      'Resistência': 'badge-warning',
      'Flexibilidade': 'badge-error'
    };
    return badges[tipo] || 'badge-active';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Treinos</h1>
            <p className="text-gray-600">{treinos.length} treino(s) criado(s)</p>
          </div>
          <button
            onClick={() => navigate('/personal/treinos/novo')}
            data-testid="create-new-treino-button"
            className="btn-primary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Criar Treino</span>
          </button>
        </div>

        <div className="card mb-6">
          <input
            type="text"
            placeholder="Buscar treino por nome..."
            data-testid="search-treino-input"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="input-field"
          />
        </div>

        {treinosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {treinosFiltrados.map((treino) => (
              <div key={treino.id} data-testid={`treino-card-${treino.id}`} className="card hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{treino.nome}</h3>
                    <span className={`badge ${getTipoBadge(treino.tipo)}`}>{treino.tipo}</span>
                  </div>
                  {treino.descricao && (
                    <p className="text-sm text-gray-600 line-clamp-2">{treino.descricao}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-y border-gray-200">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Exercícios</p>
                    <p className="font-semibold text-gray-900">{treino.exercicios?.length || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Duração</p>
                    <p className="font-semibold text-gray-900">{treino.duracao}min</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Nível</p>
                    <p className="font-semibold text-gray-900 text-xs">{treino.nivel}</p>
                  </div>
                </div>

                {treino.observacoes && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Observações</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{treino.observacoes}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/personal/treinos/${treino.id}/editar`)}
                    data-testid={`edit-treino-${treino.id}-button`}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeletar(treino.id, treino.nome)}
                    data-testid={`delete-treino-${treino.id}-button`}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-16">
            <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filtro ? 'Nenhum treino encontrado' : 'Nenhum treino criado'}
            </h3>
            <p className="text-gray-500 mb-6">
              {filtro ? 'Tente buscar por outro nome' : 'Comece criando seu primeiro treino'}
            </p>
            {!filtro && (
              <button
                onClick={() => navigate('/personal/treinos/novo')}
                className="btn-primary"
              >
                Criar Primeiro Treino
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaTreinos;