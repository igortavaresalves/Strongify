import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { listarAlunosPorPersonal, deletarUsuario } from '../../services/api';
import { toast } from 'sonner';

const ListaAlunos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarAlunos();
  }, [user]);

  const carregarAlunos = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const dados = await listarAlunosPorPersonal(user.id);
      setAlunos(dados);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      toast.error('Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja deletar o aluno ${nome}?`)) {
      try {
        await deletarUsuario(id);
        toast.success('Aluno deletado com sucesso');
        carregarAlunos();
      } catch (error) {
        console.error('Erro ao deletar aluno:', error);
        toast.error('Erro ao deletar aluno');
      }
    }
  };

  const calcularIMC = (peso, altura) => {
    if (!peso || !altura) return 0;
    return (peso / (altura * altura)).toFixed(1);
  };

  const alunosFiltrados = alunos.filter(aluno =>
    aluno.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Alunos</h1>
            <p className="text-gray-600">{alunos.length} aluno(s) cadastrado(s)</p>
          </div>
          <button
            onClick={() => navigate('/personal/alunos/novo')}
            data-testid="add-new-aluno-button"
            className="btn-primary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Adicionar Aluno</span>
          </button>
        </div>

        <div className="card mb-6">
          <input
            type="text"
            placeholder="Buscar aluno por nome..."
            data-testid="search-aluno-input"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="input-field"
          />
        </div>

        {alunosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alunosFiltrados.map((aluno) => (
              <div key={aluno.id} data-testid={`aluno-card-${aluno.id}`} className="card hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center mb-4">
                  {aluno.avatar ? (
                    <img
                      src={aluno.avatar}
                      alt={aluno.nome}
                      className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-blue-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                      <span className="text-blue-600 font-bold text-2xl">
                        {aluno.nome?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-gray-900 text-center">{aluno.nome}</h3>
                  <p className="text-sm text-gray-500">{aluno.email}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-y border-gray-200">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Peso</p>
                    <p className="font-semibold text-gray-900">{aluno.peso}kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Altura</p>
                    <p className="font-semibold text-gray-900">{aluno.altura}m</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">IMC</p>
                    <p className="font-semibold text-gray-900">{calcularIMC(aluno.peso, aluno.altura)}</p>
                  </div>
                </div>

                {aluno.objetivo && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Objetivo</p>
                    <p className="text-sm text-gray-700">{aluno.objetivo}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/personal/alunos/${aluno.id}`)}
                    data-testid={`view-aluno-${aluno.id}-button`}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Ver Detalhes
                  </button>
                  <button
                    onClick={() => handleDeletar(aluno.id, aluno.nome)}
                    data-testid={`delete-aluno-${aluno.id}-button`}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filtro ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
            </h3>
            <p className="text-gray-500 mb-6">
              {filtro ? 'Tente buscar por outro nome' : 'Comece adicionando seus alunos'}
            </p>
            {!filtro && (
              <button
                onClick={() => navigate('/personal/alunos/novo')}
                className="btn-primary"
              >
                Adicionar Primeiro Aluno
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaAlunos;
