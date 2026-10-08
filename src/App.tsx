import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { ProjectsProvider } from './contexts/ProjectsContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { EditorPage } from './pages/EditorPage';
import { ProjectsPage } from './pages/ProjectsPage';

import { AuthProvider } from './contexts/AuthContext';
import { AuthModal } from './components/auth/AuthModal';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MotionConfig reducedMotion="user">
          <ProjectsProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<ProjectsPage />} />
                <Route path="/plan/:projectId" element={<EditorPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
            <AuthModal />
            <ThemedToaster />
          </ProjectsProvider>
        </MotionConfig>
      </AuthProvider>
    </ThemeProvider>);
}

function ThemedToaster() {
  const { theme } = useTheme();
  return <Toaster theme={theme} position="top-center" toastOptions={{ style: { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' } }} />;
}