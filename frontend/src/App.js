import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { initializeStorage } from './utils/localStorage';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Cadastro from './pages/Cadastro';

import PersonalDashboard from './pages/personal/Dashboard';
import ListaAlunos from './pages/personal/ListaAlunos';
import FormAluno from './pages/personal/FormAluno';
import DetalhesAluno from './pages/personal/DetalhesAluno';
import ListaTreinos from './pages/personal/ListaTreinos';
import FormTreino from './pages/personal/FormTreino';

import AlunoDashboard from './pages/aluno/Dashboard';
import ExecutarTreino from './pages/aluno/ExecutarTreino';
import MeuProgresso from './pages/aluno/MeuProgresso';
import Configuracoes from './pages/aluno/Configuracoes';

function App() {
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
          
          <Route path="/personal/dashboard" element={
            <ProtectedRoute requiredType="personal">
              <PersonalDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/personal/alunos" element={
            <ProtectedRoute requiredType="personal">
              <ListaAlunos />
            </ProtectedRoute>
          } />
          
          <Route path="/personal/alunos/novo" element={
            <ProtectedRoute requiredType="personal">
              <FormAluno />
            </ProtectedRoute>
          } />
          
          <Route path="/personal/alunos/:id" element={
            <ProtectedRoute requiredType="personal">
              <DetalhesAluno />
            </ProtectedRoute>
          } />
          
          <Route path="/personal/alunos/:id/editar" element={
            <ProtectedRoute requiredType="personal">
              <FormAluno />
            </ProtectedRoute>
          } />
          
          <Route path="/personal/treinos" element={
            <ProtectedRoute requiredType="personal">
              <ListaTreinos />
            </ProtectedRoute>
          } />
          
          <Route path="/personal/treinos/novo" element={
            <ProtectedRoute requiredType="personal">
              <FormTreino />
            </ProtectedRoute>
          } />
          
          <Route path="/personal/treinos/:id/editar" element={
            <ProtectedRoute requiredType="personal">
              <FormTreino />
            </ProtectedRoute>
          } />
          
          <Route path="/aluno/dashboard" element={
            <ProtectedRoute requiredType="aluno">
              <AlunoDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/aluno/treino/:id" element={
            <ProtectedRoute requiredType="aluno">
              <ExecutarTreino />
            </ProtectedRoute>
          } />
          
          <Route path="/aluno/progresso" element={
            <ProtectedRoute requiredType="aluno">
              <MeuProgresso />
            </ProtectedRoute>
          } />
          
          <Route path="/aluno/configuracoes" element={
            <ProtectedRoute requiredType="aluno">
              <Configuracoes />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" richColors />
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
