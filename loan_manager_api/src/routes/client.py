from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.client import Client

client_bp = Blueprint('client', __name__)

@client_bp.route('/clientes', methods=['GET'])
def get_clientes():
    """Listar todos os clientes"""
    clientes = Client.query.all()
    return jsonify([c.to_dict() for c in clientes]), 200

@client_bp.route('/clientes', methods=['POST'])
def create_cliente():
    """Criar um novo cliente"""
    data = request.get_json()
    
    # Validação básica
    if not data.get('nome') or not data.get('cpf_cnpj'):
        return jsonify({'error': 'Nome e CPF/CNPJ são obrigatórios'}), 400
    
    # Verificar se CPF/CNPJ já existe
    existing = Client.query.filter_by(cpf_cnpj=data['cpf_cnpj']).first()
    if existing:
        return jsonify({'error': 'CPF/CNPJ já cadastrado'}), 400
    
    cliente = Client(
        nome=data['nome'],
        cpf_cnpj=data['cpf_cnpj'],
        email=data.get('email'),
        telefone=data.get('telefone'),
        endereco=data.get('endereco')
    )
    
    db.session.add(cliente)
    db.session.commit()
    
    return jsonify(cliente.to_dict()), 201

@client_bp.route('/clientes/<id>', methods=['GET'])
def get_cliente(id):
    """Obter detalhes de um cliente"""
    cliente = Client.query.get(id)
    if not cliente:
        return jsonify({'error': 'Cliente não encontrado'}), 404
    
    return jsonify(cliente.to_dict()), 200

@client_bp.route('/clientes/<id>', methods=['PUT'])
def update_cliente(id):
    """Atualizar informações de um cliente"""
    cliente = Client.query.get(id)
    if not cliente:
        return jsonify({'error': 'Cliente não encontrado'}), 404
    
    data = request.get_json()
    
    # Atualizar campos se fornecidos
    if 'nome' in data:
        cliente.nome = data['nome']
    if 'email' in data:
        cliente.email = data['email']
    if 'telefone' in data:
        cliente.telefone = data['telefone']
    if 'endereco' in data:
        cliente.endereco = data['endereco']
    
    db.session.commit()
    
    return jsonify(cliente.to_dict()), 200

@client_bp.route('/clientes/<id>', methods=['DELETE'])
def delete_cliente(id):
    """Excluir um cliente"""
    cliente = Client.query.get(id)
    if not cliente:
        return jsonify({'error': 'Cliente não encontrado'}), 404
    
    db.session.delete(cliente)
    db.session.commit()
    
    return jsonify({'message': 'Cliente excluído com sucesso'}), 200

