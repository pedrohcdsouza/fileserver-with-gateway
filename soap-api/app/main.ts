import * as soap from 'soap';
import * as http from 'http';
import { getFileMetadata, testConnection, FileMetadata } from './database';

/**
 * Interface para argumentos da requisição SOAP
 */
interface GetFileMetadataArgs {
  id: string | number;
}

/**
 * Interface para resposta SOAP
 */
interface GetFileMetadataResponse {
  found: boolean;
  name: string;
  size: number;
  type: string;
}

/**
 * Serviço SOAP que retorna metadados de arquivos do banco de dados PostgreSQL
 */
const service = {
  FileService: {
    FilePort: {
      async GetFileMetadata(args: GetFileMetadataArgs): Promise<GetFileMetadataResponse> {
        console.log('Requisição SOAP recebida para ID:', args.id);

        try {
          const id = args.id.toString();
          const metadata: FileMetadata | null = await getFileMetadata(id);

          if (!metadata) {
            console.log('Arquivo não encontrado:', id);
            return { found: false, name: '', size: 0, type: '' };
          }

          console.log('Metadados encontrados:', metadata.filename);
          return {
            found: true,
            name: metadata.filename,
            size: metadata.size,
            type: metadata.mimetype || 'application/octet-stream'
          };
        } catch (error) {
          console.error('Erro ao buscar metadados:', error);
          return { found: false, name: '', size: 0, type: '' };
        }
      }
    }
  }
};

/**
 * Definição WSDL do serviço SOAP
 */
const wsdl = `<?xml version="1.0" encoding="UTF-8"?>
<definitions
    name="FileService"
    targetNamespace="http://example.com/files"
    xmlns="http://schemas.xmlsoap.org/wsdl/"
    xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
    xmlns:tns="http://example.com/files"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema">

  <message name="GetFileMetadataRequest">
    <part name="id" type="xsd:string"/>
  </message>

  <message name="GetFileMetadataResponse">
    <part name="found" type="xsd:boolean"/>
    <part name="name" type="xsd:string"/>
    <part name="size" type="xsd:int"/>
    <part name="type" type="xsd:string"/>
  </message>

  <portType name="FilePortType">
    <operation name="GetFileMetadata">
      <input message="tns:GetFileMetadataRequest"/>
      <output message="tns:GetFileMetadataResponse"/>
    </operation>
  </portType>

  <binding name="FileBinding" type="tns:FilePortType">
    <soap:binding style="rpc" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="GetFileMetadata">
      <soap:operation/>
      <input><soap:body namespace="urn:FileService" use="literal"/></input>
      <output><soap:body namespace="urn:FileService" use="literal"/></output>
    </operation>
  </binding>

  <service name="FileService">
    <port name="FilePort" binding="tns:FileBinding">
      <soap:address location="http://localhost:8001/soap"/>
    </port>
  </service>

</definitions>`;

/**
 * Inicialização do servidor HTTP e SOAP
 */
const server: http.Server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  res.end("SOAP server running");
});

/**
 * Inicia o servidor
 */
async function startServer() {
  try {
    // Testar conexão com o banco de dados
    await testConnection();
    
    // Iniciar servidor HTTP
    server.listen(8001, () => {
      console.log('SOAP server listening at http://localhost:8001/soap');
      console.log('WSDL available at http://localhost:8001/soap?wsdl');
      
      // Configurar serviço SOAP
      soap.listen(server, '/soap', service, wsdl);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Iniciar o servidor
startServer();

// Tratamento de encerramento gracioso
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});
