import os
from typing import Union, List, Dict
import uuid
import mimetypes
import logging

from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.params import File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import closing

from app.database import get_db_connection, init_db

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="File Server REST API",
    description="API REST para gerenciamento de arquivos com armazenamento de metadados em PostgreSQL",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = "/data/files"
os.makedirs(DATA_DIR, exist_ok=True)

@app.on_event("startup")
async def startup_event():
    """Evento de startup para inicializar o banco de dados"""
    logger.info("Inicializando aplicação REST API...")
    try:
        init_db()
        logger.info("Banco de dados conectado e inicializado")
    except Exception as e:
        logger.error(f"Erro ao inicializar banco de dados: {e}")
        raise

@app.get("/")
def read_root():
    """Endpoint raiz da API"""
    return {
        "message": "File Server REST API",
        "version": "1.0.0",
        "endpoints": {
            "upload": "POST /files",
            "list": "GET /files",
            "download": "GET /files/{file_id}",
            "delete": "DELETE /files/{file_id}"
        }
    }

@app.post("/files")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload de arquivo
    
    - Salva o arquivo no filesystem
    - Armazena metadados no banco de dados PostgreSQL
    - Retorna informações do arquivo incluindo ID, nome, tamanho e tipo MIME
    """
    try:
        # Gerar ID único
        file_id = str(uuid.uuid4())
        
        # Determinar tipo MIME
        mimetype = file.content_type
        if not mimetype:
            mimetype, _ = mimetypes.guess_type(file.filename)
            mimetype = mimetype or "application/octet-stream"
        
        # Criar nome do arquivo físico
        filename_on_disk = f"{file_id}_{file.filename}"
        file_path = os.path.join(DATA_DIR, filename_on_disk)
        
        # Salvar arquivo no filesystem
        contents = await file.read()
        file_size = len(contents)
        
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Salvar metadados no banco de dados
        with closing(get_db_connection()) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO files (id, filename, file_path, size, mimetype)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (file_id, file.filename, filename_on_disk, file_size, mimetype)
                )
                conn.commit()
        
        logger.info(f"Arquivo enviado com sucesso: {file.filename} (ID: {file_id})")
        
        return {
            "id": file_id,
            "filename": file.filename,
            "size": file_size,
            "mimetype": mimetype,
            "path": filename_on_disk
        }
    
    except Exception as e:
        logger.error(f"Erro ao fazer upload do arquivo: {e}")
        # Se houve erro, tentar remover o arquivo se foi criado
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload: {str(e)}")

@app.get("/files/{file_id}")
def download_file(file_id: str):
    """
    Download de arquivo
    
    - Busca informações do arquivo no banco de dados
    - Retorna o arquivo para download
    """
    try:
        with closing(get_db_connection()) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT filename, file_path, mimetype FROM files WHERE id = %s",
                    (file_id,)
                )
                result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Arquivo não encontrado")
        
        filename = result["filename"]
        file_path_disk = result["file_path"]
        mimetype = result["mimetype"]
        
        full_path = os.path.join(DATA_DIR, file_path_disk)
        
        if not os.path.exists(full_path):
            logger.error(f"Arquivo não encontrado no disco: {full_path}")
            raise HTTPException(status_code=404, detail="Arquivo não encontrado no disco")
        
        return FileResponse(
            full_path,
            filename=filename,
            media_type=mimetype
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar arquivo: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar arquivo: {str(e)}")

@app.get("/files")
def list_files() -> List[Dict]:
    """
    Lista todos os arquivos
    
    - Busca metadados do banco de dados
    - Ordena por data de upload (mais recentes primeiro)
    - Retorna lista com ID, nome do arquivo, tamanho e tipo MIME
    """
    try:
        with closing(get_db_connection()) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, filename, size, mimetype, upload_date
                    FROM files
                    ORDER BY upload_date DESC
                    """
                )
                results = cursor.fetchall()
        
        files = []
        for row in results:
            files.append({
                "id": row["id"],
                "filename": row["filename"],
                "size": row["size"],
                "mimetype": row["mimetype"],
                "upload_date": row["upload_date"].isoformat() if row["upload_date"] else None
            })
        
        return files
    
    except Exception as e:
        logger.error(f"Erro ao listar arquivos: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao listar arquivos: {str(e)}")

@app.delete("/files/{file_id}")
def delete_file(file_id: str):
    """
    Deleta um arquivo
    
    - Remove do banco de dados
    - Remove do filesystem
    - Usa transação para garantir consistência
    """
    try:
        with closing(get_db_connection()) as conn:
            with conn.cursor() as cursor:
                # Buscar informações do arquivo antes de deletar
                cursor.execute(
                    "SELECT file_path FROM files WHERE id = %s",
                    (file_id,)
                )
                result = cursor.fetchone()
                
                if not result:
                    raise HTTPException(status_code=404, detail="Arquivo não encontrado")
                
                file_path_disk = result["file_path"]
                full_path = os.path.join(DATA_DIR, file_path_disk)
                
                # Deletar do banco de dados
                cursor.execute(
                    "DELETE FROM files WHERE id = %s",
                    (file_id,)
                )
                conn.commit()
                
                # Deletar arquivo físico
                if os.path.exists(full_path):
                    os.remove(full_path)
                    logger.info(f"Arquivo deletado: {file_path_disk}")
                else:
                    logger.warning(f"Arquivo não encontrado no disco: {full_path}")
        
        return {"deleted": file_id, "message": "Arquivo deletado com sucesso"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao deletar arquivo: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao deletar arquivo: {str(e)}")