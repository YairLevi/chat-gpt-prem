package main

import (
	"embed"
	"github.com/joho/godotenv"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"log"
	"main/api/chat"
	"main/api/stt"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	err := godotenv.Load("env/.env")
	if err != nil {
		log.Fatal("ERROR, cant load env.")
	}

	// Create an instance of the app structure
	var (
		dgStt      stt.Service  = stt.NewDeepgramService()
		openaiChat chat.Service = chat.NewOpenAIService()
	)

	// Create application with options
	err = wails.Run(&options.App{
		Title:  "chat-gpt-prem",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		Bind: []interface{}{
			dgStt,
			openaiChat,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
