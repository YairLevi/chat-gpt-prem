package database

import (
	"gorm.io/gorm"
	"time"
)

type Repository[T any] interface {
	Create(obj T) T
	Read() []T
	ReadOne(id uint) T
	Update(obj T) T
	Delete(obj T)
}

type Model struct {
	ID        uint           `json:"id" orm:"primarykey"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" orm:"index"`
}

type GormRepository[T any] struct {
	db *gorm.DB
}

func NewGormRepository[T any](db *gorm.DB) *GormRepository[T] {
	return &GormRepository[T]{db}
}

func (r *GormRepository[T]) Create(obj T) T {
	r.db.Create(&obj)
	return obj
}

func (r *GormRepository[T]) ReadOne(id uint) T {
	var obj T
	r.db.First(&obj, id)
	return obj
}

func (r *GormRepository[T]) Read() []T {
	var objs []T
	r.db.Find(&objs)
	return objs
}

func (r *GormRepository[T]) Update(obj T) T {
	r.db.Save(obj)
	return obj
}

func (r *GormRepository[T]) Delete(obj T) {
	r.db.Delete(obj)
}
