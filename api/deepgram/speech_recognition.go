package deepgram

import (
	"encoding/json"
	"fmt"
	"github.com/Jeffail/gabs/v2"
	"github.com/deepgram-devs/deepgram-go-sdk/deepgram"
	"github.com/gorilla/websocket"
	"log"
	"strings"
	"sync"
	"time"
)

const (
	DEEPGRAM_API_KEY = "71b9c06ebb4caef6eb6d3e0d1d3047446dbe1fa0"
)

type SpeechToTextController struct {
	DgClient      *deepgram.Client
	DgConn        *websocket.Conn
	Mutex         sync.Mutex
	ResultChannel chan TranscriptionResult
}

type TranscriptionResult struct {
	Transcript string `json:"transcript"`
	IsFinal    bool   `json:"is_final"`
}

func NewDgSpeechToTextController() *SpeechToTextController {
	dg := deepgram.NewClient(DEEPGRAM_API_KEY)

	return &SpeechToTextController{
		DgClient: dg,
	}
}

func (controller *SpeechToTextController) Connect() bool {
	liveTranscriptionOptions := deepgram.LiveTranscriptionOptions{
		Language:        "en-US",
		Smart_format:    true,
		Model:           "nova",
		Interim_results: true,
		Sample_rate:     16000,
	}

	dgConn, _, err := controller.DgClient.LiveTranscription(liveTranscriptionOptions)
	if err != nil {
		log.Println("ERROR creating LiveTranscription connection:", err)
		return false
	}

	controller.DgConn = dgConn
	controller.Mutex = sync.Mutex{}
	controller.ResultChannel = make(chan TranscriptionResult, 50)

	controller.initReadGoroutine()
	controller.initKeepAliveGoroutine()
	return true
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
	controller.Mutex.Lock()
	err := controller.DgConn.WriteMessage(websocket.BinaryMessage, audioChunk)
	controller.Mutex.Unlock()
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
				return
			}

			// Write the JSON message to the WebSocket
			controller.Mutex.Lock()
			err = controller.DgConn.WriteMessage(websocket.TextMessage, jsonMessage)
			controller.Mutex.Unlock()
			if err != nil {
				log.Println("ERROR keepalive", err)
				return
			}
			time.Sleep(10 * time.Second)
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
				return
			}
			jsonParsed, jsonErr := gabs.ParseJSON(message)
			if jsonErr != nil {
				log.Println("ERROR parsing JSON message:", err)
				return
			}
			transcript := jsonParsed.Path("channel.alternatives.0.transcript").String()

			isFinal := false
			if jsonParsed.Path("is_final").String() == "true" {
				isFinal = true
			}

			controller.ResultChannel <- TranscriptionResult{
				Transcript: strings.Trim(transcript, `"`),
				IsFinal:    isFinal,
			}
		}
	}()
}
