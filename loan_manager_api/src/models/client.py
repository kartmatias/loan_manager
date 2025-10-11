from src.models.user import db
from datetime import datetime
import uuid

class Client(db.Model):
    __tablename__ = 'clients'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nome = db.Column(db.String(200), nullable=False)
    cpf_cnpj = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), nullable=True)
    telefone = db.Column(db.String(20), nullable=True)
    endereco = db.Column(db.Text, nullable=True)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    emprestimos = db.relationship('Loan', backref='cliente', lazy=True, cascade='all, delete-orphan')
    faturas = db.relationship('Invoice', backref='cliente', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Client {self.nome}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'cpf_cnpj': self.cpf_cnpj,
            'email': self.email,
            'telefone': self.telefone,
            'endereco': self.endereco,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None
        }

