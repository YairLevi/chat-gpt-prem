package chat

import (
	"context"
	"github.com/sashabaranov/go-openai"
	"log"
	db "main/backend/database"
	"os"
)

type OpenAIService struct {
	Client *openai.Client
}

type Chat struct {
	db.Model
	Title    string    `json:"title"`
	Messages []Message `json:"messages"`
}

type Message struct {
	db.Model
	ChatID  int    `json:"chat_id"`
	Role    string `json:"role"`
	Content string `json:"content"`
}

func NewOpenAIService() *OpenAIService {
	return &OpenAIService{
		Client: openai.NewClient(os.Getenv("OPENAI_API_KEY")),
	}
}

func (chat *OpenAIService) Ask(history []Message) string {
	messages := chat.turnMessagesToOpenAIFormat(history)

	resp, err := chat.Client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model:            openai.GPT3Dot5Turbo,
			Temperature:      0.5,
			FrequencyPenalty: 0,
			PresencePenalty:  0,
			MaxTokens:        1024,
			Messages:         messages,
		},
	)

	if err != nil {
		log.Println("ERROR openai asking question", err)
	}

	answer := resp.Choices[0].Message.Content
	return answer
}

func (chat *OpenAIService) turnMessagesToOpenAIFormat(messages []Message) []openai.ChatCompletionMessage {
	var openAiMessages []openai.ChatCompletionMessage
	for _, msg := range messages {
		openAiMessages = append(openAiMessages, openai.ChatCompletionMessage{
			Role:    msg.Role,
			Content: msg.Content,
		})
	}
	return openAiMessages
}
