FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY app/ ./app/

RUN go build -o gateway ./app/main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/gateway .

CMD ["./gateway"]
