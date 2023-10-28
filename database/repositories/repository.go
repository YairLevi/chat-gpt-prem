package repositories

import (
	"gorm.io/gorm"
	"time"
)

type Repository[T any] interface {
	Create(obj T) T
	Read() []T
	Update(obj T) T
	Delete(obj T)
}

type Model struct {
	ID        uint           `json:"id" gorm:"primarykey"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`
}
