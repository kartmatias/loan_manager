from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.invoice import Invoice
from src.models.client import Client
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
    """Emitir uma nova fatura a partir de uma lista de IDs de parcelas."""
    data = request.get_json()
    
    if not data.get('cliente_id') or not data.get('installment_ids'):
        return jsonify({'error': 'cliente_id e installment_ids são obrigatórios'}), 400

    cliente = Client.query.get(data['cliente_id'])
    if not cliente:
        return jsonify({'error': 'Cliente não encontrado'}), 404

    installments = Installment.query.filter(Installment.id.in_(data['installment_ids'])).all()
    if len(installments) != len(data['installment_ids']):
        return jsonify({'error': 'Uma ou mais parcelas não foram encontradas'}), 404

    valor_total = sum(p.valor_original for p in installments)
    
    # Use a data de vencimento da primeira parcela como a data de vencimento da fatura
    data_vencimento = installments[0].data_vencimento if installments else datetime.now().date()

    fatura = Invoice(
        cliente_id=data['cliente_id'],
        emprestimo_id=installments[0].emprestimo_id if installments else None,
        data_emissao=datetime.now().date(),
        data_vencimento=data_vencimento,
        valor_total=valor_total,
        installments=installments
    )
    
    db.session.add(fatura)
    db.session.commit()
    
    return jsonify(fatura.to_dict()), 201

@invoice_bp.route('/faturas/<id>', methods=['GET'])
def get_fatura(id):
    """Obter detalhes de uma fatura"""
    fatura = Invoice.query.get(id)
    if not fatura:
        return jsonify({'error': 'Fatura não encontrada'}), 404
    
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

@invoice_bp.route('/invoices/<invoice_id>/installments/<installment_id>/pay', methods=['POST'])
def pay_installment(invoice_id, installment_id):
    """Registrar o pagamento de uma parcela específica dentro de uma fatura."""
    invoice = Invoice.query.get(invoice_id)
    if not invoice:
        return jsonify({'error': 'Fatura não encontrada'}), 404

    installment = Installment.query.get(installment_id)
    if not installment or installment not in invoice.installments:
        return jsonify({'error': 'Parcela não encontrada nesta fatura'}), 404

    if installment.status == 'pago':
        return jsonify({'message': 'Esta parcela já foi paga'}), 200

    installment.status = 'pago'
    installment.data_pagamento = datetime.now().date()
    installment.valor_pago = installment.valor_original

    # Verificar se todas as parcelas da fatura estão pagas
    todas_pagas = all(p.status == 'pago' for p in invoice.installments)
    if todas_pagas:
        invoice.status = 'paga'

    db.session.commit()

    return jsonify(installment.to_dict()), 200

