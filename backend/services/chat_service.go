package services

import (
	"gorm.io/gorm"
	"main/backend/api/chat"
)

type ChatService struct {
	db  *gorm.DB
	api chat.OpenAIService
}

func NewChatService(db *gorm.DB, api chat.OpenAIService) *ChatService {
	return &ChatService{
		db:  db,
		api: api,
	}
}

func (cs *ChatService) New(title string) chat.Chat {
	newChat := chat.Chat{
		Title:    title,
		Messages: make([]chat.Message, 0),
	}
	cs.db.Create(&newChat)
	return newChat
}

func (cs *ChatService) GetChatWithMessages(chatID uint) chat.Chat {
	var ch chat.Chat
	cs.db.Preload("Messages").Find(&ch, chatID)
	return ch
}

func (cs *ChatService) Ask(chatID uint, question string) []chat.Message {
	var ch chat.Chat
	cs.db.Find(&ch, chatID)

	userMessage := chat.Message{Role: "user", Content: question}

	answer := cs.api.Ask(ch.Messages)
	botMessage := chat.Message{Role: "assistant", Content: answer}

	ch.Messages = append(ch.Messages, userMessage)
	ch.Messages = append(ch.Messages, botMessage)

	cs.db.Save(&ch)
	return []chat.Message{userMessage, botMessage}
}

func (cs *ChatService) AddMessage(chatID uint, role string, content string) {
	var ch chat.Chat
	cs.db.Find(&ch, chatID)

	message := chat.Message{
		Role:    role,
		Content: content,
	}
	ch.Messages = append(ch.Messages, message)
	cs.db.Save(ch)
}

func (cs *ChatService) GetChatByID(chatID uint) chat.Chat {
	var ch chat.Chat
	cs.db.Find(&ch, chatID)
	return ch
}

func (cs *ChatService) GetChatsWithoutMessages() []chat.Chat {
	var chats []chat.Chat
	cs.db.Find(&chats)
	return chats
}
