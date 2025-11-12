from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.invoice import Invoice
from src.models.client import Client
from src.models.loan import Loan
from src.models.installment import Installment
from datetime import datetime

invoice_bp = Blueprint('invoice', __name__)

@invoice_bp.route('/faturas', methods=['GET'])
def get_faturas():
    """Listar todas as faturas"""
    faturas = Invoice.query.all()
    return jsonify([f.to_dict() for f in faturas]), 200

@invoice_bp.route('/faturas', methods=['POST'])
def create_fatura():
    """Emitir uma nova fatura"""
    data = request.get_json()
    
    # Validação básica
    if not data.get('cliente_id'):
        return jsonify({'error': 'cliente_id é obrigatório'}), 400
    
    # Verificar se cliente existe
    cliente = Client.query.get(data['cliente_id'])
    if not cliente:
        return jsonify({'error': 'Cliente não encontrado'}), 404
    
    # Processar itens da fatura
    itens_fatura = []
    valor_total = 0.0
    
    # Se for uma fatura de empréstimo específico
    if data.get('emprestimo_id'):
        emprestimo = Loan.query.get(data['emprestimo_id'])
        if not emprestimo:
            return jsonify({'error': 'Empréstimo não encontrado'}), 404
        
        # Se parcelas específicas foram fornecidas
        if data.get('parcelas_ids'):
            for parcela_id in data['parcelas_ids']:
                parcela = Installment.query.get(parcela_id)
                if parcela and parcela.emprestimo_id == data['emprestimo_id']:
                    item = {
                        'parcela_id': parcela.id,
                        'numero_parcela': parcela.numero_parcela,
                        'valor': parcela.valor_original,
                        'vencimento': parcela.data_vencimento.isoformat()
                    }
                    itens_fatura.append(item)
                    valor_total += parcela.valor_original
        else:
            # Incluir todas as parcelas pendentes
            parcelas = Installment.query.filter_by(
                emprestimo_id=data['emprestimo_id'],
                status='pendente'
            ).all()
            
            for parcela in parcelas:
                item = {
                    'parcela_id': parcela.id,
                    'numero_parcela': parcela.numero_parcela,
                    'valor': parcela.valor_original,
                    'vencimento': parcela.data_vencimento.isoformat()
                }
                itens_fatura.append(item)
                valor_total += parcela.valor_original
    
    # Se valor_total foi fornecido manualmente
    if data.get('valor_total'):
        valor_total = float(data['valor_total'])
    
    # Criar fatura
    fatura = Invoice(
        cliente_id=data['cliente_id'],
        emprestimo_id=data.get('emprestimo_id'),
        data_emissao=datetime.strptime(data.get('data_emissao', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d').date(),
        data_vencimento=datetime.strptime(data['data_vencimento'], '%Y-%m-%d').date() if data.get('data_vencimento') else datetime.now().date(),
        valor_total=valor_total
    )
    
    fatura.set_itens(itens_fatura)
    
    db.session.add(fatura)
    db.session.commit()
    
    return jsonify(fatura.to_dict()), 201

@invoice_bp.route('/faturas/<id>', methods=['GET'])
def get_fatura(id):
    """Obter detalhes de uma fatura"""
    fatura = Invoice.query.get(id)
    if not fatura:
        return jsonify({'error': 'Fatura não encontrada'}), 404
    
    # Incluir informações do cliente
    cliente = Client.query.get(fatura.cliente_id)
    fatura_dict = fatura.to_dict()
    fatura_dict['cliente'] = cliente.to_dict() if cliente else None
    
    return jsonify(fatura_dict), 200

@invoice_bp.route('/clientes/<cliente_id>/faturas', methods=['GET'])
def get_faturas_cliente(cliente_id):
    """Listar faturas de um cliente específico"""
    cliente = Client.query.get(cliente_id)
    if not cliente:
        return jsonify({'error': 'Cliente não encontrado'}), 404
    
    faturas = Invoice.query.filter_by(cliente_id=cliente_id).all()
    return jsonify([f.to_dict() for f in faturas]), 200

@invoice_bp.route('/faturas/<id>/status', methods=['PUT'])
def update_status_fatura(id):
    """Atualizar status da fatura"""
    fatura = Invoice.query.get(id)
    if not fatura:
        return jsonify({'error': 'Fatura não encontrada'}), 404
    
    data = request.get_json()
    
    if 'status' in data:
        if data['status'] not in ['emitida', 'paga', 'cancelada']:
            return jsonify({'error': 'Status inválido'}), 400
        fatura.status = data['status']
    
    db.session.commit()
    
    return jsonify(fatura.to_dict()), 200

