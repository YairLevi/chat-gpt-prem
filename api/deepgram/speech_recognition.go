package deepgram

import (
	"encoding/json"
	"fmt"
	"github.com/Jeffail/gabs/v2"
	"github.com/deepgram-devs/deepgram-go-sdk/deepgram"
	"github.com/gorilla/websocket"
	"log"
	"strings"
	"time"
)

const (
	DEEPGRAM_API_KEY = "71b9c06ebb4caef6eb6d3e0d1d3047446dbe1fa0"
)

type SpeechToTextController struct {
	DgConn        *websocket.Conn
	ResultChannel chan TranscriptionResult
}

type TranscriptionResult struct {
	Transcript string `json:"transcript"`
	IsFinal    bool   `json:"is_final"`
}

func NewDgSpeechToTextController() *SpeechToTextController {
	dg := *deepgram.NewClient(DEEPGRAM_API_KEY)

	liveTranscriptionOptions := deepgram.LiveTranscriptionOptions{
		Language:        "en-US",
		Smart_format:    true,
		Model:           "nova",
		Interim_results: true,
		Sample_rate:     16000,
	}

	dgConn, _, err := dg.LiveTranscription(liveTranscriptionOptions)
	if err != nil {
		log.Println("ERROR creating LiveTranscription connection:", err)
		return nil
	}

	controller := &SpeechToTextController{
		DgConn:        dgConn,
		ResultChannel: make(chan TranscriptionResult, 50),
	}
	controller.initKeepAliveGoroutine()
	controller.initReadGoroutine()

	return controller
}

func (controller *SpeechToTextController) Close() {
	controller.DgConn.Close()
}

func (controller *SpeechToTextController) Read() TranscriptionResult {
	select {
	case result := <-controller.ResultChannel:
		fmt.Println(result)
		return result
	default:
		return TranscriptionResult{}
	}
}

func (controller *SpeechToTextController) SendForTranscription(audioChunk []byte) {
	err := controller.DgConn.WriteMessage(websocket.BinaryMessage, audioChunk)
	if err != nil {
		log.Println("ERROR writing message to socket:", err)
	}
}

func (controller *SpeechToTextController) initKeepAliveGoroutine() {
	go func() {
		for {
			message := map[string]string{
				"type": "KeepAlive",
			}

			// Marshal the JSON message
			jsonMessage, err := json.Marshal(message)
			if err != nil {
				log.Println("ERROR marshal keep alive message", err)
			}

			// Write the JSON message to the WebSocket
			err = controller.DgConn.WriteMessage(websocket.TextMessage, jsonMessage)
			if err != nil {
				log.Println("ERROR keepalive", err)
			}
			time.Sleep(2 * time.Second)
		}
	}()
}

func (controller *SpeechToTextController) initReadGoroutine() {
	go func() {
		for {
			fmt.Println("Reading message, current:", len(controller.ResultChannel))
			_, message, err := controller.DgConn.ReadMessage()
			fmt.Println("Read Message.")
			if err != nil {
				log.Println("ERROR reading message:", err)
			}
			jsonParsed, jsonErr := gabs.ParseJSON(message)
			if jsonErr != nil {
				log.Println("ERROR parsing JSON message:", err)
			}
			transcript := jsonParsed.Path("channel.alternatives.0.transcript").String()

			if transcript == "" {
				continue
			}

			isFinal := false
			if jsonParsed.Path("is_final").String() == "true" {
				isFinal = true
			}

			if !isFinal {
				continue

			}
			controller.ResultChannel <- TranscriptionResult{
				Transcript: strings.Trim(transcript, `"`),
				IsFinal:    isFinal,
			}
		}
	}()
}
