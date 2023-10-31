package main

import (
	"embed"
	"github.com/joho/godotenv"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"log"
	"main/backend/api/chat"
	"main/backend/api/stt"
	database2 "main/backend/database"
	"main/backend/services"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	err := godotenv.Load("backend/env/.env")
	if err != nil {
		log.Fatal("ERROR, cant load env.", err)
	}

	gormDB := database2.InitializeSqlite("database.db")
	err = gormDB.AutoMigrate(
		&chat.Message{},
		&chat.Chat{},
	)
	if err != nil {
		log.Fatal("ERROR, migrating models", err)
	}

	// Create an instance of the app structure
	var (
		dgStt       = stt.NewDeepgramService()
		openaiChat  = chat.NewOpenAIService()
		chatService = services.NewChatService(
			//database.NewGormRepository[chat.Chat](gormDB),
			gormDB,
			*openaiChat,
		)
	)

	//chatService.New("Chat num 1")
	//ch := chatService.GetChatByID(9)
	//ch.Messages = append(ch.Messages, chat.Message{
	//	Role:    "user",
	//	Content: "Hello world!",
	//})
	//chatService.SaveChat(ch)

	// Create application with options
	err = wails.Run(&options.App{
		Title:     "chat-gpt-prem",
		Width:     1024,
		MinWidth:  1024,
		Height:    768,
		MinHeight: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		Bind: []interface{}{
			dgStt,
			openaiChat,
			chatService,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
