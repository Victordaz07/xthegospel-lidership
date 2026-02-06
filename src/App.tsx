import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { I18nProvider } from './context/I18nContext';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './router/AppRouter';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  console.log('📱 Renderizando xTheGospel Leaders...');
  
  return (
    <ErrorBoundary>
      <I18nProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </BrowserRouter>
      </I18nProvider>
    </ErrorBoundary>
  );
}
