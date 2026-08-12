/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppRoute } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { MonitorPage } from './pages/MonitorPage';
import { DataEnginePage } from './pages/DataEnginePage';
import { AnalyzePage } from './pages/AnalyzePage';
import { MapPage } from './pages/MapPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalystPage } from './pages/AnalystPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { AboutPage } from './pages/AboutPage';
import { AppProvider, useApp } from './context/AppContext';

function MainAppContent() {
  const { currentRoute, setCurrentRoute } = useApp();

  const getInitialRoute = (): AppRoute => {
    const path = window.location.pathname as AppRoute;
    const validRoutes: AppRoute[] = [
      '/',
      '/monitor',
      '/data-engine',
      '/analyze',
      '/map',
      '/history',
      '/analyst',
      '/methodology',
      '/about'
    ];
    return validRoutes.includes(path) ? path : '/';
  };

  useEffect(() => {
    setCurrentRoute(getInitialRoute());

    const handlePopState = () => {
      setCurrentRoute(getInitialRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setCurrentRoute]);

  const handleNavigate = (route: AppRoute) => {
    if (route !== currentRoute) {
      window.history.pushState({}, '', route);
      setCurrentRoute(route);
    }
  };

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case '/':
        return <LandingPage onNavigate={handleNavigate} />;
      case '/monitor':
        return <MonitorPage />;
      case '/data-engine':
        return <DataEnginePage />;
      case '/analyze':
        return <AnalyzePage />;
      case '/map':
        return <MapPage />;
      case '/history':
        return <HistoryPage />;
      case '/analyst':
        return <AnalystPage />;
      case '/methodology':
        return <MethodologyPage />;
      case '/about':
        return <AboutPage />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060c18] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar currentRoute={currentRoute} onNavigate={handleNavigate} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderCurrentPage()}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
