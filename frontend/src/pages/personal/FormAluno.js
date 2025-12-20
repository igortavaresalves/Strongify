import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import { criarAlunoPeloPersonal, buscarUsuarioPorId, atualizarUsuario } from '../../services/api';
import { fileToBase64 } from '../../utils/localStorage';
import { toast } from 'sonner';

const FormAluno = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [idade, setIdade] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [sexo, setSexo] = useState('M');
  const [objetivo, setObjetivo] = useState('');
  const [restricoes, setRestricoes] = useState('');
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (id) {
      carregarAluno();
    }
  }, [id]);

  const carregarAluno = async () => {
    try {
      const aluno = await buscarUsuarioPorId(id);
      setNome(aluno.nome);
      setEmail(aluno.email);
      setIdade(aluno.idade?.toString() || '');
      setPeso(aluno.peso?.toString() || '');
      setAltura(aluno.altura?.toString() || '');
      setSexo(aluno.sexo || 'M');
      setObjetivo(aluno.objetivo || '');
      setRestricoes(aluno.restricoes || '');
      setAvatar(aluno.avatar);
    } catch (error) {
      console.error('Erro ao carregar aluno:', error);
      toast.error('Erro ao carregar dados do aluno');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Arquivo selecionado:', file.name, file.size, 'bytes');
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem deve ter no máximo 5MB');
        return;
      }
      
      try {
        toast.info('Processando imagem...');
        const base64 = await fileToBase64(file);
        setAvatar(base64);
        toast.success('Imagem carregada com sucesso!');
        console.log('Avatar definido, tamanho base64:', base64.length);
      } catch (error) {
        console.error('Erro ao processar imagem:', error);
        toast.error('Erro ao processar imagem: ' + error.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!nome || !email || !idade || !peso || !altura) {
      toast.error('Preencha todos os campos obrigatórios');
      setLoading(false);
      return;
    }

    const dadosAluno = {
      nome,
      email,
      idade: parseInt(idade),
      peso: parseFloat(peso),
      altura: parseFloat(altura),
      sexo,
      objetivo,
      restricoes,
      avatar
    };

    try {
      if (id) {
        await atualizarUsuario(id, dadosAluno);
        toast.success('Aluno atualizado com sucesso!');
      } else {
        await criarAlunoPeloPersonal({
          ...dadosAluno,
          senha: 'senha123'
        });
        toast.success('Aluno criado com sucesso! Senha padrão: senha123');
      }
      navigate('/personal/alunos');
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      const message = error.response?.data?.detail || 'Erro ao salvar aluno';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/personal/alunos')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{id ? 'Editar Aluno' : 'Adicionar Aluno'}</h1>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Foto de Perfil</label>
              <div className="flex items-center space-x-6">
                {avatar ? (
                  <div className="relative">
                    <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow-md" />
                    <button
                      type="button"
                      onClick={() => setAvatar(null)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"
                      title="Remover foto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-dashed border-gray-300">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-md hover:shadow-lg">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Escolher Foto
                    </div>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo *</label>
                <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required disabled={!!id} />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="idade" className="block text-sm font-semibold text-gray-700 mb-2">Idade *</label>
                <input type="number" id="idade" value={idade} onChange={(e) => setIdade(e.target.value)} className="input-field" min="1" required />
              </div>
              <div>
                <label htmlFor="peso" className="block text-sm font-semibold text-gray-700 mb-2">Peso (kg) *</label>
                <input type="number" id="peso" value={peso} onChange={(e) => setPeso(e.target.value)} className="input-field" step="0.1" min="1" required />
              </div>
              <div>
                <label htmlFor="altura" className="block text-sm font-semibold text-gray-700 mb-2">Altura (m) *</label>
                <input type="number" id="altura" value={altura} onChange={(e) => setAltura(e.target.value)} className="input-field" step="0.01" min="0.5" max="3" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sexo</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setSexo('M')} className={`py-2 px-4 rounded-lg border-2 font-medium transition-all ${sexo === 'M' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700'}`}>Masculino</button>
                <button type="button" onClick={() => setSexo('F')} className={`py-2 px-4 rounded-lg border-2 font-medium transition-all ${sexo === 'F' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700'}`}>Feminino</button>
              </div>
            </div>

            <div>
              <label htmlFor="objetivo" className="block text-sm font-semibold text-gray-700 mb-2">Objetivo</label>
              <input type="text" id="objetivo" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} className="input-field" placeholder="Ex: Hipertrofia, Perda de peso" />
            </div>

            <div>
              <label htmlFor="restricoes" className="block text-sm font-semibold text-gray-700 mb-2">Lesões/Restrições</label>
              <textarea id="restricoes" value={restricoes} onChange={(e) => setRestricoes(e.target.value)} className="input-field" rows={3} placeholder="Descreva lesões ou restrições físicas" />
            </div>

            <div className="flex space-x-3">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Salvando...' : (id ? 'Salvar Alterações' : 'Criar Aluno')}
              </button>
              <button type="button" onClick={() => navigate('/personal/alunos')} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormAluno;