import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredType }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredType && user.tipo !== requiredType) {
    return <Navigate to={user.tipo === 'personal' ? '/personal/dashboard' : '/aluno/dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;