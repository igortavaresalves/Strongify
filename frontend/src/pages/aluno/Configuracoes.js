import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { atualizarUsuario } from '../../services/api';
import { fileToBase64 } from '../../utils/localStorage';
import { toast } from 'sonner';

const Configuracoes = () => {
  const { user, updateUser } = useAuth();
  const { theme, setThemeMode } = useTheme();
  const navigate = useNavigate();
  
  const [nome, setNome] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setAvatar(user.avatar);
    }
  }, [user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem deve ter no máximo 5MB');
        return;
      }
      
      try {
        toast.info('Processando imagem...');
        const base64 = await fileToBase64(file);
        setAvatar(base64);
        toast.success('Imagem carregada!');
      } catch (error) {
        console.error('Erro ao processar imagem:', error);
        toast.error('Erro ao processar imagem');
      }
    }
  };

  const handleSalvar = async () => {
    if (!nome) {
      toast.error('Preencha o nome');
      return;
    }

    setLoading(true);

    try {
      await atualizarUsuario(user.id, { nome, avatar });
      updateUser({ nome, avatar });
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setThemeMode(newTheme);
    toast.success(`Tema ${newTheme === 'dark' ? 'escuro' : 'claro'} ativado!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/aluno/dashboard')}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar ao Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Personalize seu perfil e preferências</p>
        </div>

        <div className="space-y-6">
          {/* Perfil */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Informações do Perfil</h2>
            
            <div className="space-y-6">
              {/* Foto de Perfil */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Foto de Perfil</label>
                <div className="flex items-center space-x-6">
                  {avatar ? (
                    <div className="relative">
                      <img 
                        src={avatar} 
                        alt="Avatar" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 dark:border-blue-700 shadow-lg" 
                      />
                      <button
                        type="button"
                        onClick={() => setAvatar(null)}
                        className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-colors"
                        title="Remover foto"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center border-4 border-dashed border-gray-300 dark:border-gray-600">
                      <svg className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-md hover:shadow-lg">
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      JPG, PNG ou GIF (máx. 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Nome */}
              <div>
                <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="input-field"
                  placeholder="Seu nome completo"
                />
              </div>

              {/* Botão Salvar */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSalvar}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>

          {/* Aparência */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Aparência</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Tema da Aplicação
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Tema Claro */}
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`relative p-6 rounded-xl border-2 transition-all ${
                    theme === 'light'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 dark:text-white">Claro</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Tema padrão</p>
                    </div>
                    {theme === 'light' && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>

                {/* Tema Escuro */}
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`relative p-6 rounded-xl border-2 transition-all ${
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 dark:text-white">Escuro</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Reduz cansaço visual</p>
                    </div>
                    {theme === 'dark' && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Informações da Conta */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Informações da Conta</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Tipo de Conta</span>
                <span className="badge badge-active capitalize">{user?.tipo}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Membro desde</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.dataCriacao ? new Date(user.dataCriacao).toLocaleDateString('pt-BR') : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
