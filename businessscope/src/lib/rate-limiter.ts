import { LRUCache } from 'lru-cache'

type RateLimitConfig = {
  interval: number // 时间窗口（毫秒）
  uniqueTokenPerInterval: number // 每个时间窗口内的唯一令牌数
}

type RateLimitInfo = {
  count: number
  resetTime: number
}

// 创建内存缓存实例
const cache = new LRUCache<string, RateLimitInfo>({
  max: 500, // 最大缓存条目数
  ttl: 60 * 1000, // 缓存TTL为1分钟
})

export function rateLimit(config: RateLimitConfig) {
  return {
    check: (identifier: string): { success: boolean; remaining: number; resetTime: number } => {
      const now = Date.now()
      const key = `${identifier}`
      
      const cached = cache.get(key)
      const windowStart = now - config.interval
      
      if (!cached || cached.resetTime <= windowStart) {
        // 新的时间窗口
        const info: RateLimitInfo = {
          count: 1,
          resetTime: now + config.interval
        }
        cache.set(key, info)
        
        return {
          success: true,
          remaining: config.uniqueTokenPerInterval - 1,
          resetTime: info.resetTime
        }
      }
      
      if (cached.count >= config.uniqueTokenPerInterval) {
        // 超过限制
        return {
          success: false,
          remaining: 0,
          resetTime: cached.resetTime
        }
      }
      
      // 增加计数
      cached.count++
      cache.set(key, cached)
      
      return {
        success: true,
        remaining: config.uniqueTokenPerInterval - cached.count,
        resetTime: cached.resetTime
      }
    }
  }
}

// 预定义的限制器
export const authLimiter = rateLimit({
  interval: 15 * 60 * 1000, // 15分钟
  uniqueTokenPerInterval: 5, // 每15分钟最多5次尝试
})

export const registerLimiter = rateLimit({
  interval: 60 * 60 * 1000, // 1小时
  uniqueTokenPerInterval: 3, // 每小时最多3次注册
})

export const generalLimiter = rateLimit({
  interval: 60 * 1000, // 1分钟
  uniqueTokenPerInterval: 10, // 每分钟最多10次请求
})