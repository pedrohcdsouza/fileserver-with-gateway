# Gateway API

API Gateway desenvolvida em Go com Fiber que orquestra requisições entre REST API e SOAP API.

## 🚀 Tecnologias

- **Go 1.21**
- **Fiber** - Web framework
- **Resty** - HTTP client
- **HATEOAS** - Hypermedia as the Engine of Application State

## 📡 Endpoints

### Raiz da API
```http
GET /
```

Retorna informações da API e links de navegação (HATEOAS).

### Documentação Swagger
```http
GET /docs
```

Interface Swagger UI interativa para testar a API.

**Acesse:** http://localhost:3000/docs

**Resposta:**
```json
{
  "message": "File Server Gateway API",
  "version": "1.0.0",
  "_links": {
    "self": {
      "href": "http://localhost:3000/",
      "method": "GET",
      "rel": "self"
    },
    "files": {
      "href": "http://localhost:3000/files",
      "method": "GET",
      "rel": "collection"
    },
    "upload": {
      "href": "http://localhost:3000/files",
      "method": "POST",
      "rel": "create"
    }
  }
}
```

---

### Listar Arquivos
```http
GET /files
```

Lista todos os arquivos disponíveis com links HATEOAS para cada arquivo.

**Resposta:**
```json
{
  "files": [
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
  ],
  "_links": {
    "self": {
      "href": "http://localhost:3000/files",
      "method": "GET",
      "rel": "self"
    },
    "upload": {
      "href": "http://localhost:3000/files",
      "method": "POST",
      "rel": "create"
    }
  }
}
```

---

### Upload de Arquivo
```http
POST /files
Content-Type: multipart/form-data
```

**Parâmetros:**
- `file` (FormData) - Arquivo a ser enviado

**Resposta (201 Created):**
```json
{
  "id": "abc123",
  "filename": "documento.pdf",
  "message": "File uploaded successfully",
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

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/files \
  -F "file=@documento.pdf"
```

---

### Obter Informações do Arquivo
```http
GET /files/:id
```

**Resposta:**
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

---

### Download de Arquivo
```http
GET /files/:id/download
```

Retorna o arquivo binário para download.

**Resposta:**
- Status: 200 OK
- Content-Disposition: attachment
- Body: arquivo binário

**Exemplo cURL:**
```bash
curl -O -J http://localhost:3000/files/abc123/download
```

---

### Obter Metadados (SOAP)
```http
GET /files/:id/metadata
```

Consome a API SOAP para obter metadados do arquivo.

**Resposta:**
```json
{
  "metadata": {
    "id": "abc123",
    "found": true,
    "name": "documento.pdf",
    "size": 204800,
    "type": "application/pdf",
    "_links": {
      "self": {
        "href": "http://localhost:3000/files/abc123/metadata",
        "method": "GET",
        "rel": "self"
      },
      "file": {
        "href": "http://localhost:3000/files/abc123",
        "method": "GET",
        "rel": "file"
      },
      "download": {
        "href": "http://localhost:3000/files/abc123/download",
        "method": "GET",
        "rel": "download"
      }
    }
  },
  "soap_raw_xml": "<?xml version=\"1.0\"?>..."
}
```

---

### Deletar Arquivo
```http
DELETE /files/:id
```

**Resposta:**
```json
{
  "message": "File deleted successfully",
  "id": "abc123",
  "_links": {
    "files": {
      "href": "http://localhost:3000/files",
      "method": "GET",
      "rel": "collection"
    }
  }
}
```

---

## 🔧 Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `REST_URL` | `http://localhost:8000` | URL da REST API |
| `SOAP_URL` | `http://localhost:8001/soap` | URL da SOAP API |
| `BASE_URL` | `http://localhost:3000` | URL base do Gateway |

---

## 🏃 Como Executar

### Com Docker
```bash
docker build -t gateway-api .
docker run -p 3000:9000 \
  -e REST_URL=http://rest-api:8000 \
  -e SOAP_URL=http://soap-api:8001/soap \
  gateway-api
```

### Local
```bash
go run app/main.go
```

---

## 📚 HATEOAS

Esta API implementa HATEOAS (Hypermedia as the Engine of Application State), um princípio REST que torna a API autodescritiva e navegável.

### Benefícios:
- ✅ Cliente não precisa conhecer URLs antecipadamente
- ✅ API é explorável dinamicamente
- ✅ Mudanças de URL não quebram clientes
- ✅ Indica ações disponíveis no contexto atual

### Estrutura dos Links:
Cada resposta inclui um objeto `_links` com:
- **href**: URL do recurso
- **method**: Método HTTP (GET, POST, DELETE, etc.)
- **rel**: Relação semântica (self, collection, download, etc.)

---

## 🧪 Testes

### Testar raiz da API
```bash
curl http://localhost:3000/
```

### Listar arquivos
```bash
curl http://localhost:3000/files
```

### Upload
```bash
curl -X POST http://localhost:3000/files -F "file=@test.pdf"
```

### Download
```bash
curl -O -J http://localhost:3000/files/abc123/download
```

### Metadados
```bash
curl http://localhost:3000/files/abc123/metadata
```

### Deletar
```bash
curl -X DELETE http://localhost:3000/files/abc123
```
