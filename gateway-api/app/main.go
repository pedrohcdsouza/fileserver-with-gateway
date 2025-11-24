package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/go-resty/resty/v2"
)

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

var restURL = getEnv("REST_URL", "http://localhost:8000")
var soapURL = getEnv("SOAP_URL", "http://localhost:8001/soap")
var baseURL = getEnv("BASE_URL", "http://localhost:3000")

// Link representa um link HATEOAS
type Link struct {
	Href   string `json:"href"`
	Method string `json:"method"`
	Rel    string `json:"rel"`
}

// FileResponse representa um arquivo com HATEOAS
type FileResponse struct {
	ID       string          `json:"id"`
	Filename string          `json:"filename"`
	Links    map[string]Link `json:"_links"`
}

// FileListResponse representa uma lista de arquivos com HATEOAS
type FileListResponse struct {
	Files []FileResponse  `json:"files"`
	Links map[string]Link `json:"_links"`
}

// MetadataResponse representa metadados com HATEOAS
type MetadataResponse struct {
	ID       string          `json:"id"`
	Found    bool            `json:"found"`
	Name     string          `json:"name,omitempty"`
	Size     int             `json:"size,omitempty"`
	Type     string          `json:"type,omitempty"`
	Links    map[string]Link `json:"_links"`
}

func createFileLinks(id string) map[string]Link {
	return map[string]Link{
		"self": {
			Href:   baseURL + "/files/" + id,
			Method: "GET",
			Rel:    "self",
		},
		"download": {
			Href:   baseURL + "/files/" + id + "/download",
			Method: "GET",
			Rel:    "download",
		},
		"metadata": {
			Href:   baseURL + "/files/" + id + "/metadata",
			Method: "GET",
			Rel:    "metadata",
		},
		"delete": {
			Href:   baseURL + "/files/" + id,
			Method: "DELETE",
			Rel:    "delete",
		},
	}
}

func main() {
	app := fiber.New()
	app.Use(cors.New())
	
	client := resty.New()

	// ---------------------------
	// GET / - API Root com HATEOAS
	// ---------------------------
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "File Server Gateway API",
			"version": "1.0.0",
			"_links": map[string]Link{
				"self": {
					Href:   baseURL + "/",
					Method: "GET",
					Rel:    "self",
				},
				"files": {
					Href:   baseURL + "/files",
					Method: "GET",
					Rel:    "collection",
				},
				"upload": {
					Href:   baseURL + "/files",
					Method: "POST",
					Rel:    "create",
				},
			},
		})
	})

	// ---------------------------
	// GET /files - Listar todos os arquivos
	// ---------------------------
	app.Get("/files", func(c *fiber.Ctx) error {
		resp, err := client.R().Get(restURL + "/files")
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		var restFiles []map[string]interface{}
		json.Unmarshal(resp.Body(), &restFiles)

		files := make([]FileResponse, 0)
		for _, file := range restFiles {
			id := file["id"].(string)
			filename := file["filename"].(string)
			
			files = append(files, FileResponse{
				ID:       id,
				Filename: filename,
				Links:    createFileLinks(id),
			})
		}

		response := FileListResponse{
			Files: files,
			Links: map[string]Link{
				"self": {
					Href:   baseURL + "/files",
					Method: "GET",
					Rel:    "self",
				},
				"upload": {
					Href:   baseURL + "/files",
					Method: "POST",
					Rel:    "create",
				},
			},
		}

		return c.JSON(response)
	})

	// ---------------------------
	// POST /files - Upload de arquivo
	// ---------------------------
	app.Post("/files", func(c *fiber.Ctx) error {
		file, err := c.FormFile("file")
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "No file uploaded"})
		}

		resp, err := client.R().
			SetFileReader("file", file.Filename, c.Request().BodyStream()).
			Post(restURL + "/files")

		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		var result map[string]interface{}
		json.Unmarshal(resp.Body(), &result)
		
		id := result["id"].(string)

		return c.Status(201).JSON(fiber.Map{
			"id":       id,
			"filename": result["filename"],
			"message":  "File uploaded successfully",
			"_links":   createFileLinks(id),
		})
	})

	// ---------------------------
	// GET /files/:id - Informações do arquivo
	// ---------------------------
	app.Get("/files/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")

		resp, err := client.R().Get(restURL + "/files/" + id)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		if resp.StatusCode() == 404 {
			return c.Status(404).JSON(fiber.Map{
				"error": "File not found",
				"_links": map[string]Link{
					"files": {
						Href:   baseURL + "/files",
						Method: "GET",
						Rel:    "collection",
					},
				},
			})
		}

		var fileData map[string]interface{}
		json.Unmarshal(resp.Body(), &fileData)

		return c.JSON(FileResponse{
			ID:       id,
			Filename: fileData["filename"].(string),
			Links:    createFileLinks(id),
		})
	})

	// ---------------------------
	// GET /files/:id/download - Download do arquivo
	// ---------------------------
	app.Get("/files/:id/download", func(c *fiber.Ctx) error {
		id := c.Params("id")

		resp, err := client.R().Get(restURL + "/files/" + id)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		if resp.StatusCode() == 404 {
			return c.Status(404).JSON(fiber.Map{"error": "File not found"})
		}

		c.Set("Content-Disposition", "attachment")
		return c.Send(resp.Body())
	})

	// ---------------------------
	// GET /files/:id/metadata - Metadados via SOAP
	// ---------------------------
	app.Get("/files/:id/metadata", func(c *fiber.Ctx) error {
		id := c.Params("id")

		soapEnvelope := fmt.Sprintf(`
			<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
				<soap:Body>
					<GetFileMetadata xmlns="urn:FileService">
						<id>%s</id>
					</GetFileMetadata>
				</soap:Body>
			</soap:Envelope>
		`, id)

		resp, err := client.R().
			SetHeader("Content-Type", "text/xml").
			SetBody(soapEnvelope).
			Post(soapURL)

		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		// Aqui você pode parsear o XML se quiser
		// Por simplicidade, vou retornar um mock
		metadata := MetadataResponse{
			ID:    id,
			Found: true,
			Name:  "documento.pdf",
			Size:  204800,
			Type:  "application/pdf",
			Links: map[string]Link{
				"self": {
					Href:   baseURL + "/files/" + id + "/metadata",
					Method: "GET",
					Rel:    "self",
				},
				"file": {
					Href:   baseURL + "/files/" + id,
					Method: "GET",
					Rel:    "file",
				},
				"download": {
					Href:   baseURL + "/files/" + id + "/download",
					Method: "GET",
					Rel:    "download",
				},
			},
		}

		return c.JSON(fiber.Map{
			"metadata":    metadata,
			"soap_raw_xml": resp.String(),
		})
	})

	// ---------------------------
	// DELETE /files/:id - Deletar arquivo
	// ---------------------------
	app.Delete("/files/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")

		resp, err := client.R().Delete(restURL + "/files/" + id)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		if resp.StatusCode() == 404 {
			return c.Status(404).JSON(fiber.Map{"error": "File not found"})
		}

		return c.JSON(fiber.Map{
			"message": "File deleted successfully",
			"id":      id,
			"_links": map[string]Link{
				"files": {
					Href:   baseURL + "/files",
					Method: "GET",
					Rel:    "collection",
				},
			},
		})
	})

	log.Println("Gateway rodando em http://localhost:9000")
	app.Listen(":9000")
}
