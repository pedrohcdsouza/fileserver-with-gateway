package main

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/go-resty/resty/v2"
)

var restURL = "http://localhost:8000"      // sua API REST em Python
var soapURL = "http://localhost:8001/soap" // seu servidor SOAP node

func main() {

	app := fiber.New()
	client := resty.New()

	// ---------------------------
	// GET /files/:id  (REST)
	// ---------------------------
	app.Get("/files/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")

		resp, err := client.R().
			SetQueryParam("id", id).
			Get(restURL + "/file")

		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(fiber.Map{
			"data": resp.String(),
			"links": []fiber.Map{
				{"rel": "self", "href": "/files/" + id},
				{"rel": "metadata", "href": "/files/" + id + "/metadata"},
				{"rel": "download", "href": "/files/" + id},
			},
		})
	})

	// ---------------------------
	// GET /files/:id/metadata  (SOAP)
	// ---------------------------
	app.Get("/files/:id/metadata", func(c *fiber.Ctx) error {
		id := c.Params("id")

		soapEnvelope := fmt.Sprintf(`
			<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
				<soap:Body>
					<GetMetadataRequest>
						<id>%s</id>
					</GetMetadataRequest>
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

		return c.JSON(fiber.Map{
			"metadata_raw_xml": resp.String(),
			"links": []fiber.Map{
				{"rel": "self", "href": "/files/" + id + "/metadata"},
				{"rel": "file", "href": "/files/" + id},
			},
		})
	})

	log.Println("Gateway rodando em http://localhost:9000")
	app.Listen(":9000")
}
