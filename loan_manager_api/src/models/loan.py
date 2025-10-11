from src.models.user import db
from datetime import datetime
import uuid

class Loan(db.Model):
    __tablename__ = 'loans'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cliente_id = db.Column(db.String(36), db.ForeignKey('clients.id'), nullable=False)
    valor_emprestado = db.Column(db.Float, nullable=False)
    data_emprestimo = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    taxa_juros = db.Column(db.Float, default=0.0)  # Taxa de juros (e.g., 0.05 para 5%)
    numero_parcelas = db.Column(db.Integer, nullable=False)
    valor_parcela = db.Column(db.Float, nullable=False)
    data_primeira_parcela = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='ativo')  # ativo, quitado, atrasado
    observacoes = db.Column(db.Text, nullable=True)
    
    # Relacionamentos
    parcelas = db.relationship('Installment', backref='emprestimo', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Loan {self.id} - Cliente {self.cliente_id}>'
    
    def to_dict(self, include_parcelas=False):
        data = {
            'id': self.id,
            'cliente_id': self.cliente_id,
            'valor_emprestado': self.valor_emprestado,
            'data_emprestimo': self.data_emprestimo.isoformat() if self.data_emprestimo else None,
            'taxa_juros': self.taxa_juros,
            'numero_parcelas': self.numero_parcelas,
            'valor_parcela': self.valor_parcela,
            'data_primeira_parcela': self.data_primeira_parcela.isoformat() if self.data_primeira_parcela else None,
            'status': self.status,
            'observacoes': self.observacoes
        }
        
        if include_parcelas:
            data['parcelas'] = [p.to_dict() for p in self.parcelas]
        
        return data

