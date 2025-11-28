"""
Módulo de conexão ao banco de dados PostgreSQL
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional
import logging

logger = logging.getLogger(__name__)

def get_database_url() -> str:
    """Obtém a URL do banco de dados a partir da variável de ambiente"""
    return os.getenv("DATABASE_URL", "postgresql://fileserver:fileserver123@localhost:5432/fileserver_db")

def get_db_connection():
    """
    Cria e retorna uma conexão com o banco de dados PostgreSQL
    
    Returns:
        psycopg2.connection: Conexão com o banco de dados
    """
    try:
        conn = psycopg2.connect(
            get_database_url(),
            cursor_factory=RealDictCursor
        )
        return conn
    except Exception as e:
        logger.error(f"Erro ao conectar ao banco de dados: {e}")
        raise

def init_db():
    """
    Inicializa o banco de dados criando as tabelas necessárias.
    Esta função é chamada no startup da aplicação.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # O schema já é criado pelo init.sql, mas verificamos aqui também
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS files (
                id VARCHAR(36) PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                file_path VARCHAR(512) NOT NULL,
                size BIGINT NOT NULL,
                mimetype VARCHAR(100),
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_files_id ON files(id);
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_upload_date ON files(upload_date DESC);
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        logger.info("Banco de dados inicializado com sucesso")
    except Exception as e:
        logger.error(f"Erro ao inicializar banco de dados: {e}")
        raise
