package openai

import (
	"context"
	"github.com/sashabaranov/go-openai"
	"log"
)

const (
	OPENAI_API_KEY = "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"
)

type ChatController struct {
	Client *openai.Client
	Chat   Chat
}

type Chat struct {
	Messages []openai.ChatCompletionMessage
	Title    string
}

func NewChatController() *ChatController {
	return &ChatController{
		Client: openai.NewClient(OPENAI_API_KEY),
		Chat:   Chat{},
	}
}

func (chat *ChatController) addMessage(content string, role string) {
	chat.Chat.Messages = append(chat.Chat.Messages, openai.ChatCompletionMessage{
		Role:    role,
		Content: content,
	})
}

func (chat *ChatController) Ask(question string) string {
	chat.addMessage(question, openai.ChatMessageRoleUser)

	resp, err := chat.Client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model:            openai.GPT3Dot5Turbo,
			Temperature:      0.5,
			FrequencyPenalty: 0,
			PresencePenalty:  0,
			MaxTokens:        1024,
			Messages:         chat.Chat.Messages,
		},
	)

	if err != nil {
		log.Println("ERROR openai asking question", err)
	}

	answer := resp.Choices[0].Message.Content
	chat.addMessage(answer, openai.ChatMessageRoleAssistant)
	return answer
}
