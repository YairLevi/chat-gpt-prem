package database

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"log"
)

func InitializeSqlite(dst string) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(dst), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database")
	}
	return db
}
