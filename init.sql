-- Script de inicialização do banco de dados
-- Cria a tabela de metadados de arquivos

CREATE TABLE IF NOT EXISTS files (
    id VARCHAR(36) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    size BIGINT NOT NULL,
    mimetype VARCHAR(100),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_files_id ON files(id);
CREATE INDEX IF NOT EXISTS idx_upload_date ON files(upload_date DESC);

-- Comentários nas colunas
COMMENT ON TABLE files IS 'Armazena metadados dos arquivos enviados';
COMMENT ON COLUMN files.id IS 'UUID único do arquivo';
COMMENT ON COLUMN files.filename IS 'Nome original do arquivo';
COMMENT ON COLUMN files.file_path IS 'Caminho do arquivo no filesystem';
COMMENT ON COLUMN files.size IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN files.mimetype IS 'Tipo MIME do arquivo';
COMMENT ON COLUMN files.upload_date IS 'Data e hora do upload';
