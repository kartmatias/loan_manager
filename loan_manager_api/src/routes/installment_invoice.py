from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.installment import Installment
from src.models.invoice import Invoice
from src.models.loan import Loan
from src.models.client import Client
from datetime import datetime

installment_invoice_bp = Blueprint('installment_invoice', __name__)

@installment_invoice_bp.route('/parcelas/<parcela_id>/gerar_fatura', methods=['POST'])
def gerar_fatura_parcela(parcela_id):
    """Gerar fatura para uma parcela específica"""
    parcela = Installment.query.get(parcela_id)
    if not parcela:
        return jsonify({'error': 'Parcela não encontrada'}), 404
    
    # Verificar se já existe uma fatura para esta parcela
    fatura_existente = Invoice.query.filter_by(parcela_id=parcela_id).first()
    if fatura_existente:
        return jsonify({'error': 'Já existe uma fatura para esta parcela', 'fatura': fatura_existente.to_dict()}), 400
    
    # Buscar empréstimo e cliente
    emprestimo = Loan.query.get(parcela.emprestimo_id)
    if not emprestimo:
        return jsonify({'error': 'Empréstimo não encontrado'}), 404
    
    data = request.get_json() or {}
    
    # Calcular valor total (valor original + multa se houver)
    valor_total = parcela.valor_original + parcela.multa_juros_atraso
    
    # Criar fatura
    fatura = Invoice(
        cliente_id=emprestimo.cliente_id,
        emprestimo_id=parcela.emprestimo_id,
        parcela_id=parcela_id,
        data_emissao=datetime.now().date(),
        data_vencimento=data.get('data_vencimento') or parcela.data_vencimento,
        valor_total=valor_total
    )
    
    # Definir itens da fatura
    itens = [{
        'descricao': f'Parcela {parcela.numero_parcela} do Empréstimo',
        'parcela_id': parcela.id,
        'numero_parcela': parcela.numero_parcela,
        'valor_original': parcela.valor_original,
        'multa_juros_atraso': parcela.multa_juros_atraso,
        'data_vencimento': parcela.data_vencimento.isoformat()
    }]
    fatura.set_itens(itens)
    
    db.session.add(fatura)
    db.session.commit()
    
    return jsonify(fatura.to_dict()), 201

@installment_invoice_bp.route('/parcelas/<parcela_id>/faturas', methods=['GET'])
def get_faturas_parcela(parcela_id):
    """Listar faturas de uma parcela específica"""
    parcela = Installment.query.get(parcela_id)
    if not parcela:
        return jsonify({'error': 'Parcela não encontrada'}), 404
    
    faturas = Invoice.query.filter_by(parcela_id=parcela_id).all()
    return jsonify([f.to_dict() for f in faturas]), 200

@installment_invoice_bp.route('/emprestimos/<emprestimo_id>/gerar_faturas_parcelas', methods=['POST'])
def gerar_faturas_multiplas_parcelas(emprestimo_id):
    """Gerar faturas para múltiplas parcelas de um empréstimo"""
    emprestimo = Loan.query.get(emprestimo_id)
    if not emprestimo:
        return jsonify({'error': 'Empréstimo não encontrado'}), 404
    
    data = request.get_json() or {}
    parcelas_ids = data.get('parcelas_ids', [])
    
    if not parcelas_ids:
        return jsonify({'error': 'Nenhuma parcela selecionada'}), 400
    
    faturas_criadas = []
    erros = []
    
    for parcela_id in parcelas_ids:
        parcela = Installment.query.get(parcela_id)
        if not parcela:
            erros.append({'parcela_id': parcela_id, 'erro': 'Parcela não encontrada'})
            continue
        
        # Verificar se já existe fatura
        fatura_existente = Invoice.query.filter_by(parcela_id=parcela_id).first()
        if fatura_existente:
            erros.append({'parcela_id': parcela_id, 'erro': 'Já existe fatura para esta parcela'})
            continue
        
        # Calcular valor total
        valor_total = parcela.valor_original + parcela.multa_juros_atraso
        
        # Criar fatura
        fatura = Invoice(
            cliente_id=emprestimo.cliente_id,
            emprestimo_id=parcela.emprestimo_id,
            parcela_id=parcela_id,
            data_emissao=datetime.now().date(),
            data_vencimento=parcela.data_vencimento,
            valor_total=valor_total
        )
        
        # Definir itens da fatura
        itens = [{
            'descricao': f'Parcela {parcela.numero_parcela} do Empréstimo',
            'parcela_id': parcela.id,
            'numero_parcela': parcela.numero_parcela,
            'valor_original': parcela.valor_original,
            'multa_juros_atraso': parcela.multa_juros_atraso,
            'data_vencimento': parcela.data_vencimento.isoformat()
        }]
        fatura.set_itens(itens)
        
        db.session.add(fatura)
        faturas_criadas.append(fatura.to_dict())
    
    db.session.commit()
    
    return jsonify({
        'faturas_criadas': faturas_criadas,
        'total_criadas': len(faturas_criadas),
        'erros': erros
    }), 201

