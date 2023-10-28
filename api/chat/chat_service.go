package chat

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type Service interface {
	Ask(history []Message, question string) string
}
