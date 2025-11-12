import { useState } from 'react'
import './App.css'
import Navigation from './components/Navigation'
import Dashboard from './components/Dashboard'
import Clients from './components/Clients'
import Loans from './components/Loans'
import Invoices from './components/Invoices'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // URL da API - em produção, usar variável de ambiente
  const apiUrl = import.meta.env.VITE_API_URL || 'http://192.168.1.14:5000'

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard apiUrl={apiUrl} />
      case 'clients':
        return <Clients apiUrl={apiUrl} />
      case 'loans':
        return <Loans apiUrl={apiUrl} />
      case 'invoices':
        return <Invoices apiUrl={apiUrl} />
      default:
        return <Dashboard apiUrl={apiUrl} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">$</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gestão de Empréstimos</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Sistema de controle financeiro</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden md:block md:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 pb-20 md:pb-6">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className="md:hidden">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  )
}

export default App

