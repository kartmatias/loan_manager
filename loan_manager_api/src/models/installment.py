from src.models.user import db
from datetime import datetime
import uuid

class Installment(db.Model):
    __tablename__ = 'installments'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    emprestimo_id = db.Column(db.String(36), db.ForeignKey('loans.id'), nullable=False)
    numero_parcela = db.Column(db.Integer, nullable=False)
    valor_original = db.Column(db.Float, nullable=False)
    valor_pago = db.Column(db.Float, default=0.0)
    data_vencimento = db.Column(db.Date, nullable=False)
    data_pagamento = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(20), default='pendente')  # pendente, pago, atrasado, adiantado
    multa_juros_atraso = db.Column(db.Float, default=0.0)
    
    def __repr__(self):
        return f'<Installment {self.numero_parcela} - Loan {self.emprestimo_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'emprestimo_id': self.emprestimo_id,
            'numero_parcela': self.numero_parcela,
            'valor_original': self.valor_original,
            'valor_pago': self.valor_pago,
            'data_vencimento': self.data_vencimento.isoformat() if self.data_vencimento else None,
            'data_pagamento': self.data_pagamento.isoformat() if self.data_pagamento else None,
            'status': self.status,
            'multa_juros_atraso': self.multa_juros_atraso
        }

