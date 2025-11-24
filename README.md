# File Server with Gateway

Sistema de gerenciamento de arquivos com arquitetura de microserviços integrando REST e SOAP APIs.

## 👥 Autores

- **Pedro Henrique Cardoso de Souza** - [pedrohcdsouza](https://github.com/pedrohcdsouza)
- **Victor Matheus** - [V-Matheus](https://github.com/V-Matheus)

## 🏗️ Arquitetura

```
Web Client (React) → Gateway API (Go) → REST API (Python) + SOAP API (Node.js)
   Porta 5173          Porta 3000        Porta 8000          Porta 8001
```

### Componentes

- **Web Client** - Interface web para gerenciamento de arquivos
- **Gateway API** - Orquestra requisições e implementa HATEOAS
- **REST API** - CRUD de arquivos (upload, download, delete)
- **SOAP API** - Fornece metadados dos arquivos via WSDL

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

## 📊 Tecnologias

| Componente | Tecnologia | Porta |
|------------|-----------|-------|
| Web Client | React + Vite | 5173 |
| Gateway | Go + Fiber | 3000 |
| REST API | Python + FastAPI | 8000 |
| SOAP API | Node.js + TypeScript | 8001 |

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
docker-compose down -v
```

## 📝 Licença

MIT
