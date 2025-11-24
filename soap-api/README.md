# SOAP API - File Metadata Service

Serviço SOAP desenvolvido em Node.js/TypeScript para fornecer metadados de arquivos.

## 🚀 Tecnologias

- **Node.js 18+**
- **TypeScript**
- **soap** - Biblioteca para criar serviços SOAP

## 📡 Serviço SOAP

### WSDL Endpoint
```
http://localhost:8001/soap?wsdl
```

### Operação: GetFileMetadata

Retorna metadados de um arquivo baseado no ID.

**Request:**
```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetFileMetadata xmlns="urn:FileService">
      <id>1</id>
    </GetFileMetadata>
  </soap:Body>
</soap:Envelope>
```

**Response:**
```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetFileMetadataResponse xmlns="urn:FileService">
      <found>true</found>
      <name>documento.pdf</name>
      <size>204800</size>
      <type>application/pdf</type>
    </GetFileMetadataResponse>
  </soap:Body>
</soap:Envelope>
```

---

## 📄 Estrutura WSDL

O arquivo WSDL define a interface do serviço SOAP. Principais tags:

### 1. `<definitions>` - Raiz do documento
Define namespaces e estrutura geral.

```xml
<definitions
    name="FileService"
    targetNamespace="http://example.com/files"
    xmlns="http://schemas.xmlsoap.org/wsdl/"
    xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
    xmlns:tns="http://example.com/files"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema">
```

### 2. `<message>` - Define estruturas de mensagens

**Request:**
```xml
<message name="GetFileMetadataRequest">
  <part name="id" type="xsd:int"/>
</message>
```

**Response:**
```xml
<message name="GetFileMetadataResponse">
  <part name="found" type="xsd:boolean"/>
  <part name="name" type="xsd:string"/>
  <part name="size" type="xsd:int"/>
  <part name="type" type="xsd:string"/>
</message>
```

### 3. `<portType>` - Define operações disponíveis
```xml
<portType name="FilePortType">
  <operation name="GetFileMetadata">
    <input message="tns:GetFileMetadataRequest"/>
    <output message="tns:GetFileMetadataResponse"/>
  </operation>
</portType>
```

### 4. `<binding>` - Define protocolo de comunicação
```xml
<binding name="FileBinding" type="tns:FilePortType">
  <soap:binding style="rpc" transport="http://schemas.xmlsoap.org/soap/http"/>
  <operation name="GetFileMetadata">
    <soap:operation/>
    <input><soap:body namespace="urn:FileService" use="literal"/></input>
    <output><soap:body namespace="urn:FileService" use="literal"/></output>
  </operation>
</binding>
```

### 5. `<service>` - Define endpoint do serviço
```xml
<service name="FileService">
  <port name="FilePort" binding="tns:FileBinding">
    <soap:address location="http://localhost:8001/soap"/>
  </port>
</service>
```

---

## 💾 Base de Dados Fake

Para demonstração, o serviço usa dados em memória:

```typescript
const fakeDb: FakeDb = {
  1: { name: "documento.pdf", size: 204800, type: "application/pdf" },
  2: { name: "foto.png", size: 512000, type: "image/png" },
  3: { name: "musica.mp3", size: 3400000, type: "audio/mpeg" }
};
```

---

## 🏃 Como Executar

### Com Docker
```bash
docker build -t soap-api .
docker run -p 8001:8001 soap-api
```

### Local
```bash
# Instalar dependências
npm install

# Compilar TypeScript
npm run build

# Executar
npm start

# Ou desenvolvimento com hot-reload
npm run dev
```

---

## 🧪 Testar o Serviço

### 1. Verificar WSDL
```bash
curl http://localhost:8001/soap?wsdl
```

### 2. Testar com cURL
```bash
curl -X POST http://localhost:8001/soap \
  -H "Content-Type: text/xml" \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetFileMetadata xmlns="urn:FileService">
      <id>1</id>
    </GetFileMetadata>
  </soap:Body>
</soap:Envelope>'
```

### 3. Testar com SoapUI

1. Criar novo projeto SOAP
2. Importar WSDL: `http://localhost:8001/soap?wsdl`
3. Executar operação `GetFileMetadata`
4. Passar ID: 1, 2 ou 3

---

## 🔧 Cliente SOAP (Exemplo Python)

```python
from zeep import Client

# Conectar ao serviço
wsdl = 'http://localhost:8001/soap?wsdl'
client = Client(wsdl=wsdl)

# Chamar operação
result = client.service.GetFileMetadata(id=1)

print(f"Found: {result['found']}")
print(f"Name: {result['name']}")
print(f"Size: {result['size']} bytes")
print(f"Type: {result['type']}")
```

**Instalar zeep:**
```bash
pip install zeep
```

---

## 🔧 Cliente SOAP (Exemplo Java)

```java
import org.apache.cxf.jaxws.JaxWsProxyFactoryBean;

public class SoapClient {
    public static void main(String[] args) {
        JaxWsProxyFactoryBean factory = new JaxWsProxyFactoryBean();
        factory.setServiceClass(FileService.class);
        factory.setAddress("http://localhost:8001/soap");
        
        FileService service = (FileService) factory.create();
        FileMetadata metadata = service.getFileMetadata(1);
        
        System.out.println("Name: " + metadata.getName());
        System.out.println("Size: " + metadata.getSize());
    }
}
```

---

## 📊 Tipos de Dados

### Entrada
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID do arquivo |

### Saída
| Campo | Tipo | Descrição |
|-------|------|-----------|
| found | boolean | Se o arquivo foi encontrado |
| name | string | Nome do arquivo |
| size | int | Tamanho em bytes |
| type | string | MIME type |

---

## 🔍 Principais Tags WSDL Explicadas

| Tag | Descrição |
|-----|-----------|
| `<definitions>` | Elemento raiz, define namespaces |
| `<types>` | Define tipos de dados complexos (não usado neste exemplo) |
| `<message>` | Define estrutura de mensagens (request/response) |
| `<portType>` | Interface abstrata com operações |
| `<binding>` | Protocolo de comunicação concreto (SOAP/HTTP) |
| `<service>` | Endpoint real do serviço |
| `<soap:binding>` | Estilo SOAP (RPC ou Document) |
| `<soap:address>` | URL do serviço |

---

## 🌐 Vantagens do SOAP

- ✅ **Fortemente tipado** - Contratos bem definidos via WSDL
- ✅ **Independente de linguagem** - Qualquer linguagem pode consumir
- ✅ **Padrão estabelecido** - Amplamente usado em sistemas corporativos
- ✅ **Segurança** - Suporte nativo a WS-Security
- ✅ **Transações** - Suporte a operações atômicas

---

## 📝 Notas

- O serviço usa **RPC style** SOAP
- Os dados são mantidos em memória (fake database)
- Para produção, integrar com banco de dados real
- WSDL é gerado automaticamente pela biblioteca `soap`
