package stt

type TranscriptionResult struct {
	Transcript string `json:"transcript"`
	IsFinal    bool   `json:"is_final"`
}

type Service interface {
	Connect() bool
	Close()
	ReadLastTranscription() TranscriptionResult
	SendForTranscription(audioChunk []byte)
}
