from src.models.user import db
from datetime import datetime
import uuid
import json

class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cliente_id = db.Column(db.String(36), db.ForeignKey('clients.id'), nullable=False)
    emprestimo_id = db.Column(db.String(36), db.ForeignKey('loans.id'), nullable=True)
    parcela_id = db.Column(db.String(36), db.ForeignKey('installments.id'), nullable=True)
    data_emissao = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    data_vencimento = db.Column(db.Date, nullable=False)
    valor_total = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='emitida')  # emitida, paga, cancelada
    itens_fatura = db.Column(db.Text, nullable=True)  # JSON com detalhes dos itens
    
    def __repr__(self):
        return f'<Invoice {self.id} - Cliente {self.cliente_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'cliente_id': self.cliente_id,
            'emprestimo_id': self.emprestimo_id,
            'parcela_id': self.parcela_id,
            'data_emissao': self.data_emissao.isoformat() if self.data_emissao else None,
            'data_vencimento': self.data_vencimento.isoformat() if self.data_vencimento else None,
            'valor_total': self.valor_total,
            'status': self.status,
            'itens_fatura': json.loads(self.itens_fatura) if self.itens_fatura else []
        }
    
    def set_itens(self, itens_list):
        """Helper para definir itens da fatura como JSON"""
        self.itens_fatura = json.dumps(itens_list)

