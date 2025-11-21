import * as soap from 'soap';
import * as http from 'http';

// fake database
interface FileMetadata {
  name: string;
  size: number;
  type: string;
}

interface FakeDb {
  [key: number]: FileMetadata;
}

const fakeDb: FakeDb = {
  1: { name: "documento.pdf", size: 204800, type: "application/pdf" },
  2: { name: "foto.png", size: 512000, type: "image/png" },
  3: { name: "musica.mp3", size: 3400000, type: "audio/mpeg" }
};

interface GetFileMetadataArgs {
  id: string | number;
}

interface GetFileMetadataResponse {
  found: boolean;
  name: string;
  size: number;
  type: string;
}

const service = {
  FileService: {
    FilePort: {
      GetFileMetadata(args: GetFileMetadataArgs): GetFileMetadataResponse {
        console.log("Chamou SOAP com:", args);

        const id = parseInt(args.id.toString());
        const data = fakeDb[id];

        if (!data) {
          return { found: false, name: "", size: 0, type: "" };
        }

        return { found: true, ...data };
      }
    }
  }
};

const wsdl = `
<?xml version="1.0" encoding="UTF-8"?>
<definitions
    name="FileService"
    targetNamespace="http://example.com/files"
    xmlns="http://schemas.xmlsoap.org/wsdl/"
    xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
    xmlns:tns="http://example.com/files"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema">

  <message name="GetFileMetadataRequest">
    <part name="id" type="xsd:int"/>
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

</definitions>
`;

const server: http.Server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  res.end("SOAP server running");
});

server.listen(8001, () => {
  console.log("SOAP server at http://localhost:8001/soap");
  soap.listen(server, "/soap", service, wsdl);
});


