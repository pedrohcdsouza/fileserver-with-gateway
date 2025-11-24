# Web Client - File Manager

Cliente web desenvolvido em React para gerenciar arquivos através do Gateway API.

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para UI
- **Vite** - Build tool moderna e rápida
- **Axios** - Cliente HTTP
- **CSS3** - Estilização responsiva

## ✨ Funcionalidades

### CRUD Completo de Arquivos:

1. **📤 Upload (Create)**
   - Interface drag-and-drop friendly
   - Feedback visual de progresso
   - Validação de arquivo selecionado

2. **📋 Listagem (Read)**
   - Grid responsivo de cards
   - Exibição de ID e nome do arquivo
   - Atualização automática após operações

3. **⬇️ Download (Read)**
   - Download direto pelo navegador
   - Preserva nome original do arquivo

4. **ℹ️ Metadados (Read - SOAP)**
   - Modal com informações detalhadas
   - Consome API SOAP através do Gateway
   - Exibe: nome, tamanho, tipo, status

5. **🗑️ Deletar (Delete)**
   - Confirmação antes de deletar
   - Feedback de sucesso/erro

## 🎨 Interface

- Design moderno com gradiente
- Cards com hover effects
- Responsivo (mobile-friendly)
- Mensagens de feedback coloridas
- Modal para metadados
- Empty state quando não há arquivos

## 🏃 Como Executar

### Desenvolvimento Local

```bash
cd web-client

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

Acesse: http://localhost:5173

### Com Docker

```bash
# Build
docker build -t web-client .

# Run
docker run -p 80:80 web-client
```

Acesse: http://localhost

### Com Docker Compose

O cliente já está incluído no `docker-compose.yml` principal.

```bash
docker-compose up --build
```

Acesse: http://localhost:5173

## 🔌 Integração com Gateway

O cliente consome os seguintes endpoints do Gateway:

| Ação | Método | Endpoint | Descrição |
|------|--------|----------|-----------|
| Listar | GET | `/files` | Lista todos os arquivos |
| Upload | POST | `/files` | Envia novo arquivo |
| Download | GET | `/files/{id}/download` | Baixa arquivo |
| Metadados | GET | `/files/{id}/metadata` | Obtém metadados via SOAP |
| Deletar | DELETE | `/files/{id}` | Remove arquivo |

## 📦 Estrutura do Projeto

```
web-client/
├── public/
├── src/
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Entry point
│   └── index.css        # Estilos globais
├── index.html
├── package.json
├── vite.config.js
├── Dockerfile
├── nginx.conf
└── README.md
```

## ⚙️ Configuração

### URL da API

Por padrão, o cliente se conecta ao Gateway em:
```javascript
const API_URL = 'http://localhost:3000'
```

Para alterar, edite a constante em `src/App.jsx`.

### Variáveis de Ambiente (Opcional)

Crie um arquivo `.env`:
```env
VITE_API_URL=http://localhost:3000
```

E use no código:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
```

## 🧪 Testando

### 1. Upload de Arquivo
- Clique em "Escolher arquivo"
- Selecione um arquivo
- Clique em "Enviar Arquivo"
- Verifique a mensagem de sucesso

### 2. Listar Arquivos
- Os arquivos aparecem automaticamente em cards
- Cada card mostra ID e nome do arquivo

### 3. Download
- Clique no botão "⬇️ Download"
- O arquivo será baixado automaticamente

### 4. Ver Metadados (SOAP)
- Clique no botão "ℹ️ Metadados"
- Um modal exibe informações do SOAP API
- Mostra: nome, tamanho, tipo, etc.

### 5. Deletar
- Clique no botão "🗑️ Deletar"
- Confirme a ação
- O arquivo é removido da lista

## 🎯 HATEOAS

O cliente utiliza os links HATEOAS retornados pelo Gateway para navegação dinâmica entre recursos, demonstrando o conceito de hipermídia.

## 📱 Responsividade

- Desktop: Grid de 3 colunas
- Tablet: Grid de 2 colunas
- Mobile: 1 coluna

## 🐛 Tratamento de Erros

- Mensagens de erro visuais
- Console logs para debug
- Confirmação antes de ações destrutivas
- Feedback de loading

## 🔒 Considerações de Segurança

Para produção, considere:
- ✅ HTTPS obrigatório
- ✅ Autenticação de usuário
- ✅ Validação de tipos de arquivo
- ✅ Limite de tamanho de upload
- ✅ CORS configurado corretamente

## 📄 Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`.
