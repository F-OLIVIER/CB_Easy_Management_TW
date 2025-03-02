package utils

import (
	data "botgvg/internal"
	"encoding/json"

	"github.com/gorilla/websocket"
)

func SendMessage(msg data.SocketMessage) error {
	conn, _, err := websocket.DefaultDialer.Dial("ws://localhost:8081", nil)
	if err != nil {
		return err
	}
	defer conn.Close()

	jsonData, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	err = conn.WriteMessage(websocket.TextMessage, jsonData)
	if err != nil {
		return err
	}

	return nil
}
