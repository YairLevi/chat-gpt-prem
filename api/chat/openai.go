package chat

import (
	"context"
	"github.com/sashabaranov/go-openai"
	"log"
	"os"
)

type OpenAIService struct {
	Client *openai.Client
}

func NewOpenAIService() *OpenAIService {
	return &OpenAIService{
		Client: openai.NewClient(os.Getenv("OPENAI_API_KEY")),
	}
}

func (chat *OpenAIService) Ask(history []Message, question string) string {
	historyInOpenAIFormat := chat.turnMessagesToOpenAIFormat(history)
	newMessage := openai.ChatCompletionMessage{
		Content: question,
		Role:    "user",
	}
	messages := append(historyInOpenAIFormat, newMessage)

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
