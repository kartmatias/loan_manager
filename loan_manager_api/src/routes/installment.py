from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.loan import Loan
from src.models.installment import Installment
from datetime import datetime

installment_bp = Blueprint('installment', __name__)

@installment_bp.route('/emprestimos/<emprestimo_id>/parcelas', methods=['GET'])
def get_parcelas(emprestimo_id):
    """Listar parcelas de um empréstimo"""
    emprestimo = Loan.query.get(emprestimo_id)
    if not emprestimo:
        return jsonify({'error': 'Empréstimo não encontrado'}), 404
    
    parcelas = Installment.query.filter_by(emprestimo_id=emprestimo_id).order_by(Installment.numero_parcela).all()
    return jsonify([p.to_dict() for p in parcelas]), 200

@installment_bp.route('/parcelas/<id>/pagar', methods=['POST'])
def pagar_parcela(id):
    """Registrar pagamento de uma parcela"""
    parcela = Installment.query.get(id)
    if not parcela:
        return jsonify({'error': 'Parcela não encontrada'}), 404
    
    data = request.get_json()
    valor_pago = float(data.get('valor_pago', parcela.valor_original))
    data_pagamento = data.get('data_pagamento', datetime.now().strftime('%Y-%m-%d'))
    
    parcela.valor_pago = valor_pago
    parcela.data_pagamento = datetime.strptime(data_pagamento, '%Y-%m-%d').date()
    
    # Calcular multa se houver atraso
    if parcela.data_pagamento > parcela.data_vencimento:
        dias_atraso = (parcela.data_pagamento - parcela.data_vencimento).days
        # Multa de 2% + 0.033% ao dia (1% ao mês)
        multa_percentual = 0.02 + (0.00033 * dias_atraso)
        parcela.multa_juros_atraso = parcela.valor_original * multa_percentual
        parcela.status = 'atrasado'
    else:
        parcela.status = 'pago'
    
    db.session.commit()
    
    # Verificar se todas as parcelas foram pagas para atualizar status do empréstimo
    emprestimo = Loan.query.get(parcela.emprestimo_id)
    todas_pagas = all(p.status in ['pago', 'atrasado'] and p.valor_pago >= p.valor_original for p in emprestimo.parcelas)
    
    if todas_pagas:
        emprestimo.status = 'quitado'
        db.session.commit()
    
    return jsonify(parcela.to_dict()), 200

@installment_bp.route('/emprestimos/<emprestimo_id>/adiantar_parcelas', methods=['POST'])
def adiantar_parcelas(emprestimo_id):
    """Adiantar pagamento de parcelas"""
    emprestimo = Loan.query.get(emprestimo_id)
    if not emprestimo:
        return jsonify({'error': 'Empréstimo não encontrado'}), 404
    
    data = request.get_json()
    quantidade_parcelas = int(data.get('quantidade_parcelas', 1))
    valor_total = float(data.get('valor_total', 0))
    data_pagamento = data.get('data_pagamento', datetime.now().strftime('%Y-%m-%d'))
    
    # Buscar parcelas pendentes
    parcelas_pendentes = Installment.query.filter_by(
        emprestimo_id=emprestimo_id,
        status='pendente'
    ).order_by(Installment.numero_parcela).limit(quantidade_parcelas).all()
    
    if not parcelas_pendentes:
        return jsonify({'error': 'Não há parcelas pendentes para adiantar'}), 400
    
    # Se valor_total foi fornecido, dividir entre as parcelas
    if valor_total > 0:
        valor_por_parcela = valor_total / len(parcelas_pendentes)
    else:
        valor_por_parcela = None
    
    parcelas_atualizadas = []
    for parcela in parcelas_pendentes:
        parcela.valor_pago = valor_por_parcela if valor_por_parcela else parcela.valor_original
        parcela.data_pagamento = datetime.strptime(data_pagamento, '%Y-%m-%d').date()
        parcela.status = 'adiantado'
        parcelas_atualizadas.append(parcela.to_dict())
    
    db.session.commit()
    
    # Verificar se todas as parcelas foram pagas
    todas_pagas = all(p.status in ['pago', 'atrasado', 'adiantado'] and p.valor_pago >= p.valor_original for p in emprestimo.parcelas)
    
    if todas_pagas:
        emprestimo.status = 'quitado'
        db.session.commit()
    
    return jsonify({
        'message': f'{len(parcelas_atualizadas)} parcela(s) adiantada(s) com sucesso',
        'parcelas': parcelas_atualizadas
    }), 200

