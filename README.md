# File Server with Gateway

Sistema de gerenciamento de arquivos com arquitetura de microserviços integrando REST e SOAP APIs.

## 🏗️ Arquitetura

```
        ┌─────────────────────────┐
        │   Web Client (React)    │  ← Interface do usuário
        │      Porta: 5173        │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Gateway API (Go/Fiber) │  ← HATEOAS implementado
        │      Porta: 3000        │
        └────────────┬────────────┘
                     │
              ┌──────┴──────┐
              │             │
        ┌─────▼─────┐ ┌────▼──────┐
        │ REST API  │ │ SOAP API  │
        │ (Python)  │ │ (Node.js) │
        │ Porta 8000│ │ Porta 8001│
        └───────────┘ └───────────┘
           FastAPI      TypeScript
          Arquivos      Metadados
```

### Componentes

- **Web Client (React/Vite)** - Porta 5173
  - Interface web para CRUD de arquivos
  - Design moderno e responsivo
  - Documentação: [web-client/README.md](web-client/README.md)

- **Gateway API (Go/Fiber)** - Porta 3000
  - Orquestra requisições entre REST e SOAP
  - Implementa HATEOAS (Hypermedia)
  - Documentação: [gateway-api/README.md](gateway-api/README.md)
  - Swagger: [gateway-api/docs/swagger.html](gateway-api/docs/swagger.html)

- **REST API (Python/FastAPI)** - Porta 8000
  - Gerencia upload, download, listagem e exclusão de arquivos
  - Documentação automática em `/docs`
  - Documentação: [rest-api/README.md](rest-api/README.md)

- **SOAP API (Node.js/TypeScript)** - Porta 8001
  - Fornece metadados dos arquivos via SOAP/WSDL
  - WSDL disponível em `/soap?wsdl`
  - Documentação: [soap-api/README.md](soap-api/README.md)

## 🚀 Como executar

### Com Docker Compose (Recomendado)

```bash
docker-compose up --build
```

### Acessar as APIs

- **Web Client**: http://localhost:5173
  - Interface web completa para gerenciar arquivos
- **Gateway**: http://localhost:3000
  - **Swagger UI**: http://localhost:3000/docs
  - Swagger local: [gateway-api/docs/swagger.html](gateway-api/docs/swagger.html)
- **REST API**: http://localhost:8000
  - Swagger UI: http://localhost:8000/docs
- **SOAP API**: http://localhost:8001
  - WSDL: http://localhost:8001/soap?wsdl

## 📡 Endpoints do Gateway (HATEOAS)

Todos os endpoints implementam HATEOAS com links de navegação.

### Raiz da API
```bash
GET http://localhost:3000/
```

### Listar arquivos
```bash
GET http://localhost:3000/files
```

### Upload de arquivo
```bash
POST http://localhost:3000/files
Content-Type: multipart/form-data

# Exemplo cURL
curl -X POST http://localhost:3000/files -F "file=@documento.pdf"
```

### Informações do arquivo
```bash
GET http://localhost:3000/files/{id}
```

### Download de arquivo
```bash
GET http://localhost:3000/files/{id}/download

# Exemplo cURL
curl -O -J http://localhost:3000/files/{id}/download
```

### Obter metadados (SOAP)
```bash
GET http://localhost:3000/files/{id}/metadata
```

### Deletar arquivo
```bash
DELETE http://localhost:3000/files/{id}
```

## 📚 Documentação

Cada componente possui documentação detalhada:

1. **Web Client**
   - [README.md](web-client/README.md) - Documentação do cliente React
   - http://localhost:5173 - Interface web

2. **Gateway API**
   - [README.md](gateway-api/README.md) - Documentação completa
   - [openapi.yaml](gateway-api/openapi.yaml) - Especificação OpenAPI 3.0
   - [swagger.html](gateway-api/docs/swagger.html) - Interface Swagger UI

3. **REST API**
   - [README.md](rest-api/README.md) - Documentação completa
   - http://localhost:8000/docs - Swagger UI automático (FastAPI)
   - http://localhost:8000/redoc - ReDoc automático (FastAPI)

3. **SOAP API**
   - [README.md](soap-api/README.md) - Documentação completa + explicação WSDL
   - http://localhost:8001/soap?wsdl - Arquivo WSDL

## 🔗 HATEOAS (Hypermedia)

O Gateway implementa HATEOAS, tornando a API autodescritiva. Exemplo de resposta:

```json
{
  "id": "abc123",
  "filename": "documento.pdf",
  "_links": {
    "self": {
      "href": "http://localhost:3000/files/abc123",
      "method": "GET",
      "rel": "self"
    },
    "download": {
      "href": "http://localhost:3000/files/abc123/download",
      "method": "GET",
      "rel": "download"
    },
    "metadata": {
      "href": "http://localhost:3000/files/abc123/metadata",
      "method": "GET",
      "rel": "metadata"
    },
    "delete": {
      "href": "http://localhost:3000/files/abc123",
      "method": "DELETE",
      "rel": "delete"
    }
  }
}
```

## 🧪 Testando o Sistema

### 1. Verificar APIs ativas
```bash
# Gateway
curl http://localhost:3000/

# REST API
curl http://localhost:8000/files

# SOAP API (WSDL)
curl http://localhost:8001/soap?wsdl
```

### 2. Upload de arquivo
```bash
curl -X POST http://localhost:3000/files \
  -F "file=@test.pdf"
```

### 3. Listar arquivos (com HATEOAS)
```bash
curl http://localhost:3000/files
```

### 4. Download
```bash
curl -O -J http://localhost:3000/files/{id}/download
```

### 5. Metadados via SOAP
```bash
curl http://localhost:3000/files/1/metadata
```

### 6. Deletar
```bash
curl -X DELETE http://localhost:3000/files/{id}
```

## 🛠️ Executar localmente (sem Docker)

### Web Client (React)
```bash
cd web-client
npm install
npm run dev
```

### REST API (Python)
```bash
cd rest-api
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### SOAP API (Node.js)
```bash
cd soap-api
npm install
npm run dev
```

### Gateway API (Go)
```bash
cd gateway-api
go run app/main.go
```

## 📊 Tecnologias Utilizadas

| Componente | Linguagem | Framework | Porta |
|------------|-----------|-----------|-------|
| Web Client | JavaScript | React 18 + Vite | 5173 |
| Gateway | Go 1.21 | Fiber | 3000 |
| REST API | Python 3.11+ | FastAPI | 8000 |
| SOAP API | TypeScript/Node.js 18+ | soap | 8001 |

## 🔧 Variáveis de Ambiente

### Gateway
- `REST_URL` - URL da REST API (padrão: http://localhost:8000)
- `SOAP_URL` - URL da SOAP API (padrão: http://localhost:8001/soap)
- `BASE_URL` - URL base do Gateway (padrão: http://localhost:3000)

### REST API
- `DATA_DIR` - Diretório de armazenamento (padrão: /data/files)

## 📁 Estrutura do Projeto

```
fileserver-with-gateway/
├── docker-compose.yml
├── README.md
├── web-client/               # Cliente Web React
│   ├── Dockerfile
│   ├── README.md
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── gateway-api/
│   ├── Dockerfile
│   ├── README.md
│   ├── openapi.yaml
│   ├── docs/
│   │   └── swagger.html
│   ├── go.mod
│   ├── go.sum
│   └── app/
│       └── main.go
├── rest-api/
│   ├── Dockerfile
│   ├── README.md
│   ├── requirements.txt
│   └── app/
│       └── main.py
└── soap-api/
    ├── Dockerfile
    ├── README.md
    ├── package.json
    ├── tsconfig.json
    └── app/
        └── main.ts
```

## 🧹 Limpar containers

```bash
docker-compose down -v
```

## 📝 Licença

MIT

## 👥 Autor

Pedro Henrique - [GitHub](https://github.com/pedrohcdsouza)
