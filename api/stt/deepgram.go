package stt

import (
	"encoding/json"
	"fmt"
	"github.com/Jeffail/gabs/v2"
	"github.com/deepgram-devs/deepgram-go-sdk/deepgram"
	"github.com/gorilla/websocket"
	"log"
	"os"
	"strings"
	"sync"
	"time"
)

type Deepgram struct {
	Client        *deepgram.Client
	Conn          *websocket.Conn
	Mutex         sync.Mutex
	ResultChannel chan TranscriptionResult
}

func NewDeepgramService() *Deepgram {
	return &Deepgram{
		Client: deepgram.NewClient(os.Getenv("DEEPGRAM_API_KEY")),
	}
}

func (dg *Deepgram) Connect() bool {
	liveTranscriptionOptions := deepgram.LiveTranscriptionOptions{
		Language:        "en-US",
		Smart_format:    true,
		Model:           "nova",
		Interim_results: true,
		Sample_rate:     16000,
	}

	dgConn, _, err := dg.Client.LiveTranscription(liveTranscriptionOptions)
	if err != nil {
		log.Println("ERROR creating LiveTranscription connection:", err)
		return false
	}

	dg.Conn = dgConn
	dg.Mutex = sync.Mutex{}
	dg.ResultChannel = make(chan TranscriptionResult, 50)

	dg.initReadGoroutine()
	dg.initKeepAliveGoroutine()
	return true
}

func (dg *Deepgram) Close() {
	dg.Conn.Close()
}

func (dg *Deepgram) ReadLastTranscription() TranscriptionResult {
	select {
	case result := <-dg.ResultChannel:
		return result
	default:
		return TranscriptionResult{}
	}
}

func (dg *Deepgram) SendForTranscription(audioChunk []byte) {
	dg.Mutex.Lock()
	err := dg.Conn.WriteMessage(websocket.BinaryMessage, audioChunk)
	dg.Mutex.Unlock()
	if err != nil {
		log.Println("ERROR writing message to socket:", err)
	}
}

func (dg *Deepgram) initKeepAliveGoroutine() {
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
			dg.Mutex.Lock()
			err = dg.Conn.WriteMessage(websocket.TextMessage, jsonMessage)
			dg.Mutex.Unlock()
			if err != nil {
				log.Println("ERROR keepalive", err)
				return
			}
			time.Sleep(10 * time.Second)
		}
	}()
}

func (dg *Deepgram) initReadGoroutine() {
	go func() {
		for {
			fmt.Println("Reading message, current:", len(dg.ResultChannel))
			_, message, err := dg.Conn.ReadMessage()
			fmt.Println("ReadLastTranscription Message.")
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

			dg.ResultChannel <- TranscriptionResult{
				Transcript: strings.Trim(transcript, `"`),
				IsFinal:    isFinal,
			}
		}
	}()
}
