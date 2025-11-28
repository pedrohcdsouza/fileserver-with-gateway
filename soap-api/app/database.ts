/**
 * Módulo de conexão ao banco de dados PostgreSQL
 */
import { Pool, QueryResult } from 'pg';

/**
 * Interface para metadados de arquivo
 */
export interface FileMetadata {
  id: string;
  filename: string;
  file_path: string;
  size: number;
  mimetype: string | null;
  upload_date: Date;
}

/**
 * Pool de conexões PostgreSQL
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://fileserver:fileserver123@localhost:5432/fileserver_db',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Busca metadados de um arquivo pelo ID
 * 
 * @param fileId - ID do arquivo
 * @returns Metadados do arquivo ou null se não encontrado
 */
export async function getFileMetadata(fileId: string): Promise<FileMetadata | null> {
  try {
    const result: QueryResult<FileMetadata> = await pool.query(
      'SELECT id, filename, file_path, size, mimetype, upload_date FROM files WHERE id = $1',
      [fileId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Erro ao buscar metadados do arquivo:', error);
    throw error;
  }
}

/**
 * Testa a conexão com o banco de dados
 */
export async function testConnection(): Promise<void> {
  try {
    const client = await pool.connect();
    console.log('Conexão com PostgreSQL estabelecida com sucesso');
    client.release();
  } catch (error) {
    console.error('Erro ao conectar ao PostgreSQL:', error);
    throw error;
  }
}

/**
 * Fecha o pool de conexões
 */
export async function closePool(): Promise<void> {
  await pool.end();
  console.log('Pool de conexões fechado');
}
