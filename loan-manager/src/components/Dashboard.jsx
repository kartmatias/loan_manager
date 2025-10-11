import { useEffect, useState } from 'react'
import { DollarSign, Users, TrendingUp, AlertCircle } from 'lucide-react'

export default function Dashboard({ apiUrl }) {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalEmprestimos: 0,
    valorEmprestado: 0,
    valorReceber: 0,
    emprestimosAtivos: 0,
    emprestimosAtrasados: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [clientsRes, loansRes] = await Promise.all([
        fetch(`${apiUrl}/api/clientes`),
        fetch(`${apiUrl}/api/emprestimos`)
      ])

      const clients = await clientsRes.json()
      const loans = await loansRes.json()

      const totalEmprestado = loans.reduce((sum, loan) => sum + loan.valor_emprestado, 0)
      const totalReceber = loans.reduce((sum, loan) => {
        if (loan.status === 'ativo') {
          return sum + (loan.valor_parcela * loan.numero_parcelas)
        }
        return sum
      }, 0)

      const ativos = loans.filter(l => l.status === 'ativo').length
      const atrasados = loans.filter(l => l.status === 'atrasado').length

      setStats({
        totalClientes: clients.length,
        totalEmprestimos: loans.length,
        valorEmprestado: totalEmprestado,
        valorReceber: totalReceber,
        emprestimosAtivos: ativos,
        emprestimosAtrasados: atrasados
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    }
  }

  const StatCard = ({ icon: Icon, label, value, color = 'blue', isCurrency = false }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">
            {isCurrency ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : value}
          </p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral da gestão de empréstimos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Total de Clientes"
          value={stats.totalClientes}
          color="#3B82F6"
        />
        <StatCard
          icon={DollarSign}
          label="Total Empréstimos"
          value={stats.totalEmprestimos}
          color="#10B981"
        />
        <StatCard
          icon={TrendingUp}
          label="Valor Emprestado"
          value={stats.valorEmprestado}
          color="#8B5CF6"
          isCurrency
        />
        <StatCard
          icon={DollarSign}
          label="Valor a Receber"
          value={stats.valorReceber}
          color="#F59E0B"
          isCurrency
        />
        <StatCard
          icon={TrendingUp}
          label="Empréstimos Ativos"
          value={stats.emprestimosAtivos}
          color="#06B6D4"
        />
        <StatCard
          icon={AlertCircle}
          label="Empréstimos Atrasados"
          value={stats.emprestimosAtrasados}
          color="#EF4444"
        />
      </div>
    </div>
  )
}

