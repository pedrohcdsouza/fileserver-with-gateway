# REST API - File Server

API REST desenvolvida em Python com FastAPI para gerenciamento de arquivos (upload, download, listagem e exclusão).

## 🚀 Tecnologias

- **Python 3.11+**
- **FastAPI** - Framework web moderno e rápido
- **Uvicorn** - Servidor ASGI de alta performance

## 📡 Endpoints

### Listar Arquivos
```http
GET /files
```

**Resposta:**
```json
[
  {
    "id": "abc123",
    "filename": "documento.pdf"
  },
  {
    "id": "def456",
    "filename": "imagem.png"
  }
]
```

---

### Upload de Arquivo
```http
POST /files
Content-Type: multipart/form-data
```

**Parâmetros:**
- `file` (FormData) - Arquivo a ser enviado

**Resposta (200 OK):**
```json
{
  "id": "abc123",
  "filename": "documento.pdf",
  "path": "abc123_documento.pdf"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:8000/files \
  -F "file=@documento.pdf"
```

**Exemplo Python:**
```python
import requests

files = {'file': open('documento.pdf', 'rb')}
response = requests.post('http://localhost:8000/files', files=files)
print(response.json())
```

---

### Download de Arquivo
```http
GET /files/{file_id}
```

**Parâmetros:**
- `file_id` (path) - ID do arquivo

**Resposta:**
- Status: 200 OK
- Content-Disposition: attachment; filename="documento.pdf"
- Body: arquivo binário

**Exemplo cURL:**
```bash
curl -O -J http://localhost:8000/files/abc123
```

---

### Deletar Arquivo
```http
DELETE /files/{file_id}
```

**Parâmetros:**
- `file_id` (path) - ID do arquivo

**Resposta (200 OK):**
```json
{
  "deleted": "abc123"
}
```

**Resposta de Erro (404 Not Found):**
```json
{
  "detail": "File not found"
}
```

---

## 📂 Estrutura de Armazenamento

Os arquivos são armazenados no diretório `/data/files` com o formato:
```
{uuid}_{filename_original}
```

Exemplo:
```
abc123-def456-789_documento.pdf
```

---

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `DATA_DIR` | `/data/files` | Diretório para armazenar arquivos |

---

## 🏃 Como Executar

### Com Docker
```bash
docker build -t rest-api .
docker run -p 8000:8000 -v files-data:/data/files rest-api
```

### Local
```bash
# Instalar dependências
pip install -r requirements.txt

# Executar servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📚 Documentação Interativa

FastAPI gera automaticamente documentação interativa:

### Swagger UI
```
http://localhost:8000/docs
```

### ReDoc
```
http://localhost:8000/redoc
```

### OpenAPI JSON
```
http://localhost:8000/openapi.json
```

---

## 🧪 Testes

### Upload de arquivo
```bash
curl -X POST http://localhost:8000/files \
  -F "file=@test.pdf" \
  -H "accept: application/json"
```

### Listar arquivos
```bash
curl http://localhost:8000/files
```

### Download
```bash
curl -O -J http://localhost:8000/files/abc123
```

### Deletar
```bash
curl -X DELETE http://localhost:8000/files/abc123
```

---

## 🔒 Segurança

⚠️ **Atenção**: Esta é uma API de demonstração. Para produção, considere:

- ✅ Autenticação (OAuth2, JWT)
- ✅ Validação de tipos de arquivo
- ✅ Limite de tamanho de upload
- ✅ Sanitização de nomes de arquivo
- ✅ Rate limiting
- ✅ HTTPS obrigatório

---

## 📊 Status Codes

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 404 | Arquivo não encontrado |
| 422 | Validação de dados falhou |
| 500 | Erro interno do servidor |
