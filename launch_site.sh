#!/bin/bash

cd ./services/site
npm i
go mod tidy
go build ./cmd/main.go
chmod +x main
./main
