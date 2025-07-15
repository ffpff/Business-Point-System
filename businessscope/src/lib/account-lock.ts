import { prisma } from "./db"

// 账户锁定配置
const LOCK_CONFIG = {
  maxFailedAttempts: 5, // 最大失败尝试次数
  lockDurationMinutes: 30, // 锁定时长（分钟）
  attemptWindowMinutes: 15, // 尝试窗口期（分钟）
}

export class AccountLockService {
  /**
   * 检查账户是否被锁定
   */
  static async isAccountLocked(email: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { lockUntil: true }
      })

      if (!user || !user.lockUntil) {
        return false
      }

      // 检查锁定是否过期
      const now = new Date()
      if (user.lockUntil <= now) {
        // 锁定过期，清除锁定状态
        await this.clearAccountLock(email)
        return false
      }

      return true
    } catch (error) {
      console.error('检查账户锁定状态失败:', error)
      return false
    }
  }

  /**
   * 记录登录失败
   */
  static async recordFailedLogin(email: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, loginFailedCount: true, lockedAt: true }
      })

      if (!user) {
        return
      }

      const now = new Date()
      const failedCount = user.loginFailedCount + 1

      // 如果达到最大失败次数，锁定账户
      if (failedCount >= LOCK_CONFIG.maxFailedAttempts) {
        const lockUntil = new Date(now.getTime() + LOCK_CONFIG.lockDurationMinutes * 60 * 1000)
        
        await prisma.user.update({
          where: { email },
          data: {
            loginFailedCount: failedCount,
            lockedAt: now,
            lockUntil: lockUntil
          }
        })
      } else {
        // 增加失败计数
        await prisma.user.update({
          where: { email },
          data: {
            loginFailedCount: failedCount
          }
        })
      }
    } catch (error) {
      console.error('记录登录失败失败:', error)
    }
  }

  /**
   * 清除账户锁定状态
   */
  static async clearAccountLock(email: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { email },
        data: {
          loginFailedCount: 0,
          lockedAt: null,
          lockUntil: null
        }
      })
    } catch (error) {
      console.error('清除账户锁定状态失败:', error)
    }
  }

  /**
   * 获取账户锁定信息
   */
  static async getAccountLockInfo(email: string): Promise<{
    isLocked: boolean
    lockUntil?: Date
    failedAttempts: number
    remainingAttempts: number
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          loginFailedCount: true,
          lockUntil: true,
          lockedAt: true
        }
      })

      if (!user) {
        return {
          isLocked: false,
          failedAttempts: 0,
          remainingAttempts: LOCK_CONFIG.maxFailedAttempts
        }
      }

      const now = new Date()
      const isLocked = user.lockUntil && user.lockUntil > now

      return {
        isLocked: Boolean(isLocked),
        lockUntil: user.lockUntil || undefined,
        failedAttempts: user.loginFailedCount,
        remainingAttempts: Math.max(0, LOCK_CONFIG.maxFailedAttempts - user.loginFailedCount)
      }
    } catch (error) {
      console.error('获取账户锁定信息失败:', error)
      return {
        isLocked: false,
        failedAttempts: 0,
        remainingAttempts: LOCK_CONFIG.maxFailedAttempts
      }
    }
  }

  /**
   * 成功登录后清除失败计数
   */
  static async recordSuccessfulLogin(email: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { email },
        data: {
          loginFailedCount: 0,
          lockedAt: null,
          lockUntil: null,
          lastActiveAt: new Date()
        }
      })
    } catch (error) {
      console.error('记录成功登录失败:', error)
    }
  }
}