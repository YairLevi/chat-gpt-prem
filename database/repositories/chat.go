package repositories

import "gorm.io/gorm"

type ChatRepository struct {
	db *gorm.DB
}

func NewChatRepository(db *gorm.DB) *ChatRepository {
	return &ChatRepository{db}
}

type Role = string

const (
	User      = "user"
	Assistant = ""
)

type Message struct {
	Role    Role
	Content string
}

type Chat struct {
	Title    string
	Messages []Message
}

func (repo *ChatRepository) Create(obj Chat) Chat {
	repo.db.Create(obj)
	return obj
}

func (repo *ChatRepository) Read() []Chat {
	var chats []Chat
	repo.db.Find(&chats)
	return chats
}

func (repo *ChatRepository) Update(obj Chat) Chat {
	repo.db.Save(obj)
	return obj
}

func (repo *ChatRepository) Delete(obj Chat) {
	repo.db.Delete(obj)
}
