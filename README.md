# File Server with Gateway

Sistema de gerenciamento de arquivos com arquitetura de microserviços integrando REST e SOAP APIs.

## 👥 Autores

- **Pedro Henrique Cardoso de Souza** - [pedrohcdsouza](https://github.com/pedrohcdsouza)

## 🏗️ Arquitetura

```
Web Client (React) → Gateway API (Go) → REST API (Python) + SOAP API (Node.js)
   Porta 5173          Porta 3000        Porta 8000          Porta 8001
                                              ↓                    ↓
                                         PostgreSQL (Porta 5432)
```

### Componentes

- **PostgreSQL** - Banco de dados para armazenamento de metadados dos arquivos
- **Web Client** - Interface web para gerenciamento de arquivos
- **Gateway API** - Orquestra requisições e implementa HATEOAS
- **REST API** - CRUD de arquivos (upload, download, delete) + persistência no banco
- **SOAP API** - Fornece metadados dos arquivos via WSDL consultando o banco

## 🚀 Como executar

```bash
docker-compose up --build
```

### Acessar

- **Web Client**: http://localhost:5173
- **Gateway API**: http://localhost:3000
  - Swagger: http://localhost:3000/docs
- **REST API**: http://localhost:8000
  - Swagger: http://localhost:8000/docs
- **SOAP API**: http://localhost:8001
  - WSDL: http://localhost:8001/soap?wsdl

## 📡 Endpoints Principais

### Gateway (HATEOAS)

```bash
# Listar arquivos
GET http://localhost:3000/files

# Upload
POST http://localhost:3000/files
Content-Type: multipart/form-data

# Download
GET http://localhost:3000/files/{id}/download

# Metadados (SOAP)
GET http://localhost:3000/files/{id}/metadata

# Deletar
DELETE http://localhost:3000/files/{id}
```

## � HATEOAS

Exemplo de resposta com hipermídia:

```json
{
  "id": "abc123",
  "filename": "documento.pdf",
  "_links": {
    "self": { "href": "/files/abc123", "method": "GET" },
    "download": { "href": "/files/abc123/download", "method": "GET" },
    "metadata": { "href": "/files/abc123/metadata", "method": "GET" },
    "delete": { "href": "/files/abc123", "method": "DELETE" }
  }
}
```

## 🧪 Testando

```bash
# Upload
curl -X POST http://localhost:3000/files -F "file=@test.pdf"

# Listar
curl http://localhost:3000/files

# Download
curl -O -J http://localhost:3000/files/{id}/download

# Metadados via SOAP
curl http://localhost:3000/files/{id}/metadata

# Deletar
curl -X DELETE http://localhost:3000/files/{id}
```

## 💾 Banco de Dados

O sistema utiliza **PostgreSQL** para armazenar metadados dos arquivos:

- **Tabela `files`**: Armazena ID, nome do arquivo, caminho no filesystem, tamanho, tipo MIME e data de upload
- **Arquivos físicos**: Armazenados no volume Docker `files-data` em `/data/files`
- **Compartilhamento**: REST API e SOAP API compartilham a mesma tabela de metadados

### Acessar banco de dados

```bash
# Via docker-compose
docker-compose exec postgres psql -U fileserver -d fileserver_db

# Listar arquivos
SELECT id, filename, size, mimetype FROM files;
```

## 🔧 Variáveis de Ambiente

### REST API e SOAP API

```bash
DATABASE_URL=postgresql://fileserver:fileserver123@postgres:5432/fileserver_db
```

### Gateway API

```bash
REST_URL=http://rest-api:8000
SOAP_URL=http://soap-api:8001/soap
BASE_URL=http://localhost:3000
```

Estas variáveis já estão configuradas no `docker-compose.yml`.

## 📊 Tecnologias

| Componente | Tecnologia | Porta |
|------------|-----------|-------|
| Web Client | React + Vite | 5173 |
| Gateway | Go + Fiber | 3000 |
| REST API | Python + FastAPI | 8000 |
| SOAP API | Node.js + TypeScript | 8001 |
| Database | PostgreSQL 15 | 5432 |

## 📁 Estrutura

```
fileserver-with-gateway/
├── docker-compose.yml
├── web-client/        # React frontend
├── gateway-api/       # Go gateway + HATEOAS
├── rest-api/          # Python FastAPI
└── soap-api/          # Node.js SOAP
```

## 📚 Documentação Detalhada

Cada componente possui README próprio:
- [Web Client](web-client/README.md)
- [Gateway API](gateway-api/README.md) + [OpenAPI](gateway-api/openapi.yaml)
- [REST API](rest-api/README.md)
- [SOAP API](soap-api/README.md)

## 🧹 Limpar

```bash
# Parar containers e remover volumes (incluindo banco de dados)
docker-compose down -v

# Apenas parar containers (mantém dados)
docker-compose down
```

## 📝 Licença

MIT
