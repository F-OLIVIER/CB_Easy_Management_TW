package utils

import (
	"math"
	"sync"
	"time"
)

type TokenBucket struct {
	mu             sync.Mutex
	tokens         float64
	maxTokens      float64
	refillRate     float64
	lastRefillTime time.Time
}

// NewTokenBucket crée une nouvelle instance TokenBucket.
func NewTokenBucket(maxTokens float64, refillRate float64) *TokenBucket {
	return &TokenBucket{
		tokens:         maxTokens,
		maxTokens:      maxTokens,
		refillRate:     refillRate,
		lastRefillTime: time.Now(),
	}
}

// recharge remplit le seau de jetons en fonction du temps écoulé depuis la dernière recharge.
func (tb *TokenBucket) refill() {
	now := time.Now()
	duration := now.Sub(tb.lastRefillTime)
	tokensToAdd := tb.refillRate * duration.Seconds()
	tb.tokens = math.Min(tb.tokens+tokensToAdd, tb.maxTokens)
	tb.lastRefillTime = now
}

// La requête vérifie si le bucket de jetons contient suffisamment de jetons pour une requête ?
func (tb *TokenBucket) Request(tokens float64) bool {
	tb.mu.Lock()
	defer tb.mu.Unlock()
	tb.refill()
	if tokens <= tb.tokens {
		tb.tokens -= tokens
		return true
	}
	return false
}
