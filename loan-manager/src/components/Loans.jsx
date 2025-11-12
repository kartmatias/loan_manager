import { useEffect, useState } from 'react'
import { Plus, Eye, Trash2, X, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

export default function Loans({ apiUrl }) {
  const [loans, setLoans] = useState([])
  const [clients, setClients] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [formData, setFormData] = useState({
    cliente_id: '',
    valor_emprestado: '',
    numero_parcelas: '',
    taxa_juros: '0',
    data_emprestimo: new Date().toISOString().split('T')[0],
    data_primeira_parcela: '',
    observacoes: ''
  })

  useEffect(() => {
    fetchLoans()
    fetchClients()
  }, [])

  const fetchLoans = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/emprestimos`)
      const data = await response.json()
      setLoans(data)
    } catch (error) {
      console.error('Erro ao buscar empréstimos:', error)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/clientes`)
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
    }
  }

  const fetchLoanDetails = async (loanId) => {
    try {
      const response = await fetch(`${apiUrl}/api/emprestimos/${loanId}`)
      const data = await response.json()
      setSelectedLoan(data)
      setShowDetailsModal(true)
    } catch (error) {
      console.error('Erro ao buscar detalhes do empréstimo:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`${apiUrl}/api/emprestimos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchLoans()
        closeModal()
      }
    } catch (error) {
      console.error('Erro ao criar empréstimo:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Deseja realmente excluir este empréstimo?')) return

    try {
      await fetch(`${apiUrl}/api/emprestimos/${id}`, { method: 'DELETE' })
      fetchLoans()
    } catch (error) {
      console.error('Erro ao excluir empréstimo:', error)
    }
  }

  const handlePayInstallment = async (installmentId) => {
    try {
      const response = await fetch(`${apiUrl}/api/parcelas/${installmentId}/pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_pagamento: new Date().toISOString().split('T')[0]
        })
      })

      if (response.ok) {
        fetchLoanDetails(selectedLoan.id)
        fetchLoans()
      }
    } catch (error) {
      console.error('Erro ao pagar parcela:', error)
    }
  }

  const handleAdvanceInstallments = async () => {
    const quantidade = prompt('Quantas parcelas deseja adiantar?', '1')
    if (!quantidade) return

    try {
      const response = await fetch(`${apiUrl}/api/emprestimos/${selectedLoan.id}/adiantar_parcelas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantidade_parcelas: parseInt(quantidade),
          data_pagamento: new Date().toISOString().split('T')[0]
        })
      })

      if (response.ok) {
        fetchLoanDetails(selectedLoan.id)
        fetchLoans()
      }
    } catch (error) {
      console.error('Erro ao adiantar parcelas:', error)
    }
  }

  const handleGenerateInstallmentInvoice = async (installmentId) => {
    try {
      const response = await fetch(`${apiUrl}/api/parcelas/${installmentId}/gerar_fatura`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      if (response.ok) {
        const fatura = await response.json()
        alert(`Fatura gerada com sucesso! ID: ${fatura.id.substring(0, 8).toUpperCase()}`)
        fetchLoanDetails(selectedLoan.id)
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao gerar fatura da parcela:', error)
      alert('Erro ao gerar fatura da parcela')
    }
  }

  const openModal = () => {
    setFormData({
      cliente_id: '',
      valor_emprestado: '',
      numero_parcelas: '',
      taxa_juros: '0',
      data_emprestimo: new Date().toISOString().split('T')[0],
      data_primeira_parcela: '',
      observacoes: ''
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      ativo: { color: 'bg-green-100 text-green-800', label: 'Ativo' },
      quitado: { color: 'bg-blue-100 text-blue-800', label: 'Quitado' },
      atrasado: { color: 'bg-red-100 text-red-800', label: 'Atrasado' }
    }
    const config = statusConfig[status] || statusConfig.ativo
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getInstallmentStatusBadge = (status) => {
    const statusConfig = {
      pendente: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
      pago: { color: 'bg-green-100 text-green-800', label: 'Pago' },
      atrasado: { color: 'bg-red-100 text-red-800', label: 'Atrasado' },
      adiantado: { color: 'bg-blue-100 text-blue-800', label: 'Adiantado' }
    }
    const config = statusConfig[status] || statusConfig.pendente
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId)
    return client ? client.nome : 'Cliente não encontrado'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Empréstimos</h1>
          <p className="text-gray-600">Gerencie seus empréstimos</p>
        </div>
        <Button onClick={openModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Empréstimo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loans.map((loan) => (
          <div key={loan.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {getClientName(loan.cliente_id)}
                </h3>
                {getStatusBadge(loan.status)}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchLoanDetails(loan.id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(loan.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Valor:</strong> R$ {loan.valor_emprestado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p><strong>Parcelas:</strong> {loan.numero_parcelas}x de R$ {loan.valor_parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p><strong>Taxa de Juros:</strong> {(loan.taxa_juros * 100).toFixed(2)}%</p>
              <p><strong>Data:</strong> {new Date(loan.data_emprestimo).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Novo Empréstimo */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Novo Empréstimo</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <select
                  required
                  value={formData.cliente_id}
                  onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Emprestado *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.valor_emprestado}
                  onChange={(e) => setFormData({ ...formData, valor_emprestado: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Parcelas *
                </label>
                <input
                  type="number"
                  required
                  value={formData.numero_parcelas}
                  onChange={(e) => setFormData({ ...formData, numero_parcelas: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taxa de Juros (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.taxa_juros}
                  onChange={(e) => setFormData({ ...formData, taxa_juros: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data do Empréstimo *
                </label>
                <input
                  type="date"
                  required
                  value={formData.data_emprestimo}
                  onChange={(e) => setFormData({ ...formData, data_emprestimo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data da Primeira Parcela *
                </label>
                <input
                  type="date"
                  required
                  value={formData.data_primeira_parcela}
                  onChange={(e) => setFormData({ ...formData, data_primeira_parcela: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Criar Empréstimo
                </Button>
                <Button type="button" onClick={closeModal} variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Empréstimo */}
      {showDetailsModal && selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">Detalhes do Empréstimo</h2>
                <p className="text-sm text-gray-600">{getClientName(selectedLoan.cliente_id)}</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Valor Emprestado</p>
                  <p className="text-lg font-semibold">R$ {selectedLoan.valor_emprestado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedLoan.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Parcelas</p>
                  <p className="text-lg font-semibold">{selectedLoan.numero_parcelas}x</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor da Parcela</p>
                  <p className="text-lg font-semibold">R$ {selectedLoan.valor_parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Parcelas</h3>
                  <Button onClick={handleAdvanceInstallments} size="sm">
                    Adiantar Parcelas
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {selectedLoan.parcelas?.map((installment) => (
                    <div key={installment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">Parcela {installment.numero_parcela}</span>
                          {getInstallmentStatusBadge(installment.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          Vencimento: {new Date(installment.data_vencimento).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm font-semibold">
                          R$ {installment.valor_original.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        {installment.data_pagamento && (
                          <p className="text-xs text-green-600">
                            Pago em: {new Date(installment.data_pagamento).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {installment.status === 'pendente' && (
                          <>
                            <Button
                              onClick={() => handlePayInstallment(installment.id)}
                              size="sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Pagar
                            </Button>
                            <Button
                              onClick={() => handleGenerateInstallmentInvoice(installment.id)}
                              size="sm"
                              variant="outline"
                            >
                              Gerar Fatura
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

