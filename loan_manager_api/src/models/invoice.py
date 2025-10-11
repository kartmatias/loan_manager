from src.models.user import db
from datetime import datetime
import uuid
from src.models.invoice_installment import invoice_installments

class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cliente_id = db.Column(db.String(36), db.ForeignKey('clients.id'), nullable=False)
    emprestimo_id = db.Column(db.String(36), db.ForeignKey('loans.id'), nullable=True)
    data_emissao = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    data_vencimento = db.Column(db.Date, nullable=False)
    valor_total = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='emitida')  # emitida, paga, cancelada
    
    installments = db.relationship('Installment', secondary=invoice_installments, lazy='subquery',
        backref=db.backref('invoices', lazy=True))

    def __repr__(self):
        return f'<Invoice {self.id} - Cliente {self.cliente_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'cliente_id': self.cliente_id,
            'emprestimo_id': self.emprestimo_id,
            'data_emissao': self.data_emissao.isoformat() if self.data_emissao else None,
            'data_vencimento': self.data_vencimento.isoformat() if self.data_vencimento else None,
            'valor_total': self.valor_total,
            'status': self.status,
            'installments': [installment.to_dict() for installment in self.installments]
        }

