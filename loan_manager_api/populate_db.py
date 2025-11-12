#!/usr/bin/env python3
import os
import sys
from datetime import datetime, timedelta

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.dirname(__file__))

from src.models.user import db
from src.models.client import Client
from src.models.loan import Loan
from src.models.installment import Installment
from src.main import app

with app.app_context():
    # Criar cliente
    cliente = Client(
        nome="João Silva",
        cpf_cnpj="123.456.789-00",
        email="joao@email.com",
        telefone="(11) 98765-4321"
    )
    db.session.add(cliente)
    db.session.commit()
    print(f"Cliente criado: {cliente.id}")
    
    # Criar empréstimo
    valor_emprestado = 5000.00
    numero_parcelas = 5
    valor_parcela = valor_emprestado / numero_parcelas
    
    emprestimo = Loan(
        cliente_id=cliente.id,
        valor_emprestado=valor_emprestado,
        numero_parcelas=numero_parcelas,
        valor_parcela=valor_parcela,
        taxa_juros=0.0,
        data_emprestimo=datetime.now().date(),
        data_primeira_parcela=(datetime.now() + timedelta(days=30)).date(),
        status='ativo'
    )
    db.session.add(emprestimo)
    db.session.commit()
    print(f"Empréstimo criado: {emprestimo.id}")
    
    # Criar parcelas
    data_vencimento = emprestimo.data_primeira_parcela
    for i in range(1, numero_parcelas + 1):
        parcela = Installment(
            emprestimo_id=emprestimo.id,
            numero_parcela=i,
            valor_original=valor_parcela,
            data_vencimento=data_vencimento,
            status='pendente'
        )
        db.session.add(parcela)
        data_vencimento = data_vencimento + timedelta(days=30)
    
    db.session.commit()
    print(f"Criadas {numero_parcelas} parcelas")
    print("Banco de dados populado com sucesso!")

