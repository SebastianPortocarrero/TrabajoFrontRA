import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MyClassesPage from './pages/MyClassesPage';
import ClassEditorPage from './pages/ClassEditorPage';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route 
          path="dashboard" 
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="my-classes" 
          element={
            <PrivateRoute>
              <MyClassesPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="editor" 
          element={
            <PrivateRoute>
              <ClassEditorPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="editor/:classId" 
          element={
            <PrivateRoute>
              <ClassEditorPage />
            </PrivateRoute>
          } 
        />
      </Route>
    </Routes>
  );
}

export default App;