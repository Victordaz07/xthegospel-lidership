import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { I18nProvider } from './context/I18nContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './router/AppRouter';
import ErrorBoundary from './components/ErrorBoundary';
import { ScrollToTop } from './components/ScrollToTop';

export default function App() {
  console.log('📱 Renderizando xTheGospel Leaders...');
  
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <I18nProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AuthProvider>
              <AppRouter />
            </AuthProvider>
          </BrowserRouter>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
