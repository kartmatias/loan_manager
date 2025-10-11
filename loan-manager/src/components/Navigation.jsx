import { Home, Users, DollarSign, FileText } from 'lucide-react'

export default function Navigation({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'loans', label: 'Empréstimos', icon: DollarSign },
    { id: 'invoices', label: 'Faturas', icon: FileText },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:relative md:border-0 md:bg-transparent">
      <div className="flex justify-around md:flex-col md:space-y-2 md:p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-3 px-4 transition-all md:flex-row md:justify-start md:rounded-lg ${
                isActive
                  ? 'text-blue-600 bg-blue-50 md:bg-blue-100'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'mb-1 md:mb-0 md:mr-3' : 'mb-1 md:mb-0 md:mr-3'}`} />
              <span className="text-xs md:text-sm font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

