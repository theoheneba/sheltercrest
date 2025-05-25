import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { supabase } from './services/db.ts';

const queryClient = new QueryClient();

// Initialize Supabase session from localStorage if available
const savedSession = localStorage.getItem('supabase.auth.token');
if (savedSession) {
  try {
    const { access_token, refresh_token } = JSON.parse(savedSession);
    if (access_token && refresh_token) {
      supabase.auth.setSession({
        access_token,
        refresh_token
      });
    }
  } catch (error) {
    console.error('Error restoring auth session:', error);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);