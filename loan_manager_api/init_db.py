#!/usr/bin/env python3
import os
import sys

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.dirname(__file__))

from src.models.user import db
from src.main import app

with app.app_context():
    db.create_all()
    print("Banco de dados criado com sucesso!")

