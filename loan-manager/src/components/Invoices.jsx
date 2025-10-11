import { useEffect, useState } from 'react'
import { Plus, Eye, X, Download, Check } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

export default function Invoices({ apiUrl }) {
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [loans, setLoans] = useState([])
  const [availableInstallments, setAvailableInstallments] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [formData, setFormData] = useState({
    cliente_id: '',
    loan_id: '',
    installment_ids: []
  })

  useEffect(() => {
    fetchInvoices()
    fetchClients()
    fetchLoans()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/faturas`)
      const data = await response.json()
      setInvoices(data)
    } catch (error) {
      console.error('Erro ao buscar faturas:', error)
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

  const fetchLoans = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/emprestimos`)
      const data = await response.json()
      setLoans(data)
    } catch (error) {
      console.error('Erro ao buscar empréstimos:', error)
    }
  }

  const fetchInstallmentsForLoan = async (loanId) => {
    if (!loanId) {
      setAvailableInstallments([])
      return
    }
    try {
      const response = await fetch(`${apiUrl}/api/emprestimos/${loanId}/parcelas`)
      const data = await response.json()
      setAvailableInstallments(data.filter(inst => inst.status === 'pendente'))
    } catch (error) {
      console.error('Erro ao buscar parcelas:', error)
    }
  }

  const fetchInvoiceDetails = async (invoiceId) => {
    try {
      const response = await fetch(`${apiUrl}/api/faturas/${invoiceId}`)
      const data = await response.json()
      setSelectedInvoice(data)
      setShowDetailsModal(true)
    } catch (error) {
      console.error('Erro ao buscar detalhes da fatura:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.installment_ids.length === 0) {
      alert('Selecione ao menos uma parcela.')
      return
    }
    
    try {
      const response = await fetch(`${apiUrl}/api/faturas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cliente_id: formData.cliente_id,
          installment_ids: formData.installment_ids
        })
      })

      if (response.ok) {
        fetchInvoices()
        closeModal()
      }
    } catch (error) {
      console.error('Erro ao criar fatura:', error)
    }
  }

  const handlePayInstallment = async (invoiceId, installmentId) => {
    try {
      const response = await fetch(`${apiUrl}/api/invoices/${invoiceId}/installments/${installmentId}/pay`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchInvoiceDetails(invoiceId) // Re-fetch details to update status
        fetchInvoices() // Re-fetch all invoices to update the main list
      }
    } catch (error) {
      console.error('Erro ao pagar parcela:', error)
    }
  }

  const openModal = () => {
    setFormData({ cliente_id: '', loan_id: '', installment_ids: [] })
    setAvailableInstallments([])
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const handleInstallmentSelection = (installmentId) => {
    setFormData(prev => {
      const newInstallmentIds = prev.installment_ids.includes(installmentId)
        ? prev.installment_ids.filter(id => id !== installmentId)
        : [...prev.installment_ids, installmentId]
      return { ...prev, installment_ids: newInstallmentIds }
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      emitida: { color: 'bg-yellow-100 text-yellow-800', label: 'Emitida' },
      paga: { color: 'bg-green-100 text-green-800', label: 'Paga' },
      cancelada: { color: 'bg-red-100 text-red-800', label: 'Cancelada' }
    }
    const config = statusConfig[status] || statusConfig.emitida
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getInstallmentStatusBadge = (status) => {
    const statusConfig = {
      pendente: { color: 'bg-gray-200 text-gray-800', label: 'Pendente' },
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

  const getClientLoans = (clientId) => {
    return loans.filter(l => l.cliente_id === clientId && l.status === 'ativo')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Faturas</h1>
          <p className="text-gray-600">Gerencie suas faturas</p>
        </div>
        <Button onClick={openModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Fatura
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Fatura #{invoice.id.substring(0, 8).toUpperCase()}
                </h3>
                {getStatusBadge(invoice.status)}
              </div>
              <button
                onClick={() => fetchInvoiceDetails(invoice.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Cliente:</strong> {getClientName(invoice.cliente_id)}</p>
              <p><strong>Valor:</strong> R$ {invoice.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p><strong>Vencimento:</strong> {new Date(invoice.data_vencimento).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Nova Fatura */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Nova Fatura</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                <select required value={formData.cliente_id} onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value, loan_id: '', installment_ids: [] })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Selecione um cliente</option>
                  {clients.map(client => <option key={client.id} value={client.id}>{client.nome}</option>)}
                </select>
              </div>

              {formData.cliente_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empréstimo *</label>
                  <select required value={formData.loan_id} onChange={(e) => { setFormData({ ...formData, loan_id: e.target.value, installment_ids: [] }); fetchInstallmentsForLoan(e.target.value); }} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Selecione um empréstimo</option>
                    {getClientLoans(formData.cliente_id).map(loan => <option key={loan.id} value={loan.id}>R$ {loan.valor_emprestado.toLocaleString('pt-BR')} - {loan.numero_parcelas}x</option>)}
                  </select>
                </div>
              )}

              {availableInstallments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parcelas Pendentes</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                    {availableInstallments.map(inst => (
                      <div key={inst.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <label htmlFor={`inst-${inst.id}`} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" id={`inst-${inst.id}`} checked={formData.installment_ids.includes(inst.id)} onChange={() => handleInstallmentSelection(inst.id)} className="h-4 w-4 rounded" />
                          <span>Parcela {inst.numero_parcela} - R$ {inst.valor_original.toLocaleString('pt-BR')}</span>
                        </label>
                        <span className="text-sm text-gray-500">Vence em: {new Date(inst.data_vencimento).toLocaleDateString('pt-BR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Emitir Fatura</Button>
                <Button type="button" onClick={closeModal} variant="outline" className="flex-1">Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Fatura */}
      {showDetailsModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">Fatura #{selectedInvoice.id.substring(0, 8).toUpperCase()}</h2>
                <p className="text-sm text-gray-600">{selectedInvoice.cliente?.nome || getClientName(selectedInvoice.cliente_id)}</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Data de Emissão</p>
                  <p className="text-lg font-semibold">{new Date(selectedInvoice.data_emissao).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data de Vencimento</p>
                  <p className="text-lg font-semibold">{new Date(selectedInvoice.data_vencimento).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-lg font-semibold text-blue-600">R$ {selectedInvoice.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Parcelas da Fatura</h3>
                <div className="space-y-2">
                  {selectedInvoice.installments.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Parcela {item.numero_parcela}</p>
                        <p className="text-sm text-gray-600">Vencimento: {new Date(item.data_vencimento).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {getInstallmentStatusBadge(item.status)}
                        <p className="font-semibold w-32 text-right">R$ {item.valor_original.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        {item.status === 'pendente' && (
                          <Button onClick={() => handlePayInstallment(selectedInvoice.id, item.id)} size="sm" className="flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            Pagar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={() => alert('Gerar PDF...')} className="flex-1 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Baixar Fatura
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

