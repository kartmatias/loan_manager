from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.loan import Loan
from src.models.installment import Installment
from src.models.client import Client
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

loan_bp = Blueprint('loan', __name__)

@loan_bp.route('/emprestimos', methods=['GET'])
def get_emprestimos():
    """Listar todos os empréstimos"""
    emprestimos = Loan.query.all()
    return jsonify([e.to_dict() for e in emprestimos]), 200

@loan_bp.route('/emprestimos', methods=['POST'])
def create_emprestimo():
    """Criar um novo empréstimo e gerar parcelas automaticamente"""
    data = request.get_json()
    
    # Validação básica
    required_fields = ['cliente_id', 'valor_emprestado', 'numero_parcelas', 'data_primeira_parcela']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Campo {field} é obrigatório'}), 400
    
    # Verificar se cliente existe
    cliente = Client.query.get(data['cliente_id'])
    if not cliente:
        return jsonify({'error': 'Cliente não encontrado'}), 404
    
    # Calcular valor da parcela
    valor_emprestado = float(data['valor_emprestado'])
    numero_parcelas = int(data['numero_parcelas'])
    taxa_juros = float(data.get('taxa_juros', 0.0))
    
    # Calcular valor total com juros
    valor_total = valor_emprestado * (1 + taxa_juros)
    valor_parcela = valor_total / numero_parcelas
    
    # Criar empréstimo
    emprestimo = Loan(
        cliente_id=data['cliente_id'],
        valor_emprestado=valor_emprestado,
        data_emprestimo=datetime.strptime(data.get('data_emprestimo', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d').date(),
        taxa_juros=taxa_juros,
        numero_parcelas=numero_parcelas,
        valor_parcela=valor_parcela,
        data_primeira_parcela=datetime.strptime(data['data_primeira_parcela'], '%Y-%m-%d').date(),
        observacoes=data.get('observacoes')
    )
    
    db.session.add(emprestimo)
    db.session.flush()  # Para obter o ID do empréstimo
    
    # Gerar parcelas
    data_vencimento = datetime.strptime(data['data_primeira_parcela'], '%Y-%m-%d').date()
    for i in range(1, numero_parcelas + 1):
        parcela = Installment(
            emprestimo_id=emprestimo.id,
            numero_parcela=i,
            valor_original=valor_parcela,
            data_vencimento=data_vencimento
        )
        db.session.add(parcela)
        # Próxima parcela: 1 mês depois
        data_vencimento = data_vencimento + relativedelta(months=1)
    
    db.session.commit()
    
    return jsonify(emprestimo.to_dict(include_parcelas=True)), 201

@loan_bp.route('/emprestimos/<id>', methods=['GET'])
def get_emprestimo(id):
    """Obter detalhes de um empréstimo com parcelas"""
    emprestimo = Loan.query.get(id)
    if not emprestimo:
        return jsonify({'error': 'Empréstimo não encontrado'}), 404
    
    return jsonify(emprestimo.to_dict(include_parcelas=True)), 200

@loan_bp.route('/emprestimos/<id>', methods=['PUT'])
def update_emprestimo(id):
    """Atualizar informações de um empréstimo"""
    emprestimo = Loan.query.get(id)
    if not emprestimo:
        return jsonify({'error': 'Empréstimo não encontrado'}), 404
    
    data = request.get_json()
    
    # Atualizar campos permitidos
    if 'status' in data:
        emprestimo.status = data['status']
    if 'observacoes' in data:
        emprestimo.observacoes = data['observacoes']
    
    db.session.commit()
    
    return jsonify(emprestimo.to_dict(include_parcelas=True)), 200

@loan_bp.route('/emprestimos/<id>', methods=['DELETE'])
def delete_emprestimo(id):
    """Excluir um empréstimo"""
    emprestimo = Loan.query.get(id)
    if not emprestimo:
        return jsonify({'error': 'Empréstimo não encontrado'}), 404
    
    db.session.delete(emprestimo)
    db.session.commit()
    
    return jsonify({'message': 'Empréstimo excluído com sucesso'}), 200

@loan_bp.route('/clientes/<cliente_id>/emprestimos', methods=['GET'])
def get_emprestimos_cliente(cliente_id):
    """Listar empréstimos de um cliente específico"""
    cliente = Client.query.get(cliente_id)
    if not cliente:
        return jsonify({'error': 'Cliente não encontrado'}), 404
    
    emprestimos = Loan.query.filter_by(cliente_id=cliente_id).all()
    return jsonify([e.to_dict() for e in emprestimos]), 200

