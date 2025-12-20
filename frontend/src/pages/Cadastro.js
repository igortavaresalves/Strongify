import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cadastrarPersonal, cadastrarAluno } from '../services/api';
import { fileToBase64 } from '../utils/localStorage';
import { toast } from 'sonner';

const Cadastro = () => {
  const [tipo, setTipo] = useState('personal');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [especializacao, setEspecializacao] = useState('');
  const [codigoPersonal, setCodigoPersonal] = useState('');
  const [idade, setIdade] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [sexo, setSexo] = useState('M');
  const [objetivo, setObjetivo] = useState('');
  const [restricoes, setRestricoes] = useState('');
  const [avatar, setAvatar] = useState(null);
  
  const navigate = useNavigate();
  const { login } = useAuth();

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
        console.log('Avatar definido');
      } catch (error) {
        console.error('Erro ao processar imagem:', error);
        toast.error('Erro ao processar imagem: ' + error.message);
      }
    }
  };

  const [loading, setLoading] = useState(false);
  
  const handleCadastro = async (e) => {
    e.preventDefault();

    if (!nome || !email || !senha) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      let response;

      if (tipo === 'personal') {
        response = await cadastrarPersonal({
          nome,
          email,
          senha,
          especializacao: especializacao || '',
          avatar: avatar || null
        });
      } else {
        if (!codigoPersonal) {
          toast.error('Informe o código do seu personal trainer');
          setLoading(false);
          return;
        }

        if (!idade || !peso || !altura) {
          toast.error('Preencha idade, peso e altura');
          setLoading(false);
          return;
        }

        response = await cadastrarAluno({
          nome,
          email,
          senha,
          codigoPersonal,
          idade: parseInt(idade),
          peso: parseFloat(peso),
          altura: parseFloat(altura),
          sexo,
          objetivo: objetivo || '',
          restricoes: restricoes || '',
          avatar: avatar || null
        });
      }

      login(response.usuario);
      toast.success('Cadastro realizado com sucesso!');

      if (tipo === 'personal') {
        navigate('/personal/dashboard');
      } else {
        navigate('/aluno/dashboard');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      const message = error.response?.data?.detail || 'Erro ao realizar cadastro';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/login')}
            data-testid="back-to-login-button"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar ao login
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Conta</h1>
          <p className="text-gray-600">Cadastre-se no FitnessPro</p>
        </div>

        <div className="card">
          <form onSubmit={handleCadastro} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Conta
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  data-testid="tipo-personal-button"
                  onClick={() => setTipo('personal')}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                    tipo === 'personal'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Personal Trainer
                </button>
                <button
                  type="button"
                  data-testid="tipo-aluno-button"
                  onClick={() => setTipo('aluno')}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                    tipo === 'aluno'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Aluno
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="avatar" className="block text-sm font-semibold text-gray-700 mb-2">
                Foto de Perfil (opcional)
              </label>
              <div className="flex items-center space-x-4">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-blue-200" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <input
                  type="file"
                  id="avatar"
                  data-testid="avatar-input"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="nome"
                  data-testid="nome-input"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  data-testid="email-cadastro-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-semibold text-gray-700 mb-2">
                Senha *
              </label>
              <input
                type="password"
                id="senha"
                data-testid="senha-cadastro-input"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-field"
                required
              />
            </div>

            {tipo === 'personal' ? (
              <div>
                <label htmlFor="especializacao" className="block text-sm font-semibold text-gray-700 mb-2">
                  Especialização (opcional)
                </label>
                <input
                  type="text"
                  id="especializacao"
                  data-testid="especializacao-input"
                  value={especializacao}
                  onChange={(e) => setEspecializacao(e.target.value)}
                  className="input-field"
                  placeholder="Ex: Hipertrofia, Emagrecimento"
                />
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="codigoPersonal" className="block text-sm font-semibold text-gray-700 mb-2">
                    Código do Personal Trainer *
                  </label>
                  <input
                    type="text"
                    id="codigoPersonal"
                    data-testid="codigo-personal-input"
                    value={codigoPersonal}
                    onChange={(e) => setCodigoPersonal(e.target.value)}
                    className="input-field"
                    placeholder="Ex: PT1234567890abc"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="idade" className="block text-sm font-semibold text-gray-700 mb-2">
                      Idade *
                    </label>
                    <input
                      type="number"
                      id="idade"
                      data-testid="idade-input"
                      value={idade}
                      onChange={(e) => setIdade(e.target.value)}
                      className="input-field"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="peso" className="block text-sm font-semibold text-gray-700 mb-2">
                      Peso (kg) *
                    </label>
                    <input
                      type="number"
                      id="peso"
                      data-testid="peso-input"
                      value={peso}
                      onChange={(e) => setPeso(e.target.value)}
                      className="input-field"
                      step="0.1"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="altura" className="block text-sm font-semibold text-gray-700 mb-2">
                      Altura (m) *
                    </label>
                    <input
                      type="number"
                      id="altura"
                      data-testid="altura-input"
                      value={altura}
                      onChange={(e) => setAltura(e.target.value)}
                      className="input-field"
                      step="0.01"
                      min="0.5"
                      max="3"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sexo
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      data-testid="sexo-m-button"
                      onClick={() => setSexo('M')}
                      className={`py-2 px-4 rounded-lg border-2 font-medium transition-all ${
                        sexo === 'M'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Masculino
                    </button>
                    <button
                      type="button"
                      data-testid="sexo-f-button"
                      onClick={() => setSexo('F')}
                      className={`py-2 px-4 rounded-lg border-2 font-medium transition-all ${
                        sexo === 'F'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Feminino
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="objetivo" className="block text-sm font-semibold text-gray-700 mb-2">
                    Objetivo (opcional)
                  </label>
                  <input
                    type="text"
                    id="objetivo"
                    data-testid="objetivo-input"
                    value={objetivo}
                    onChange={(e) => setObjetivo(e.target.value)}
                    className="input-field"
                    placeholder="Ex: Hipertrofia, Perda de peso"
                  />
                </div>

                <div>
                  <label htmlFor="restricoes" className="block text-sm font-semibold text-gray-700 mb-2">
                    Lesões/Restrições (opcional)
                  </label>
                  <textarea
                    id="restricoes"
                    data-testid="restricoes-input"
                    value={restricoes}
                    onChange={(e) => setRestricoes(e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Descreva lesões ou restrições físicas"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              data-testid="cadastro-submit-button"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;