from src.models.user import db

invoice_installments = db.Table('invoice_installments',
    db.Column('invoice_id', db.String(36), db.ForeignKey('invoices.id'), primary_key=True),
    db.Column('installment_id', db.String(36), db.ForeignKey('installments.id'), primary_key=True)
)
