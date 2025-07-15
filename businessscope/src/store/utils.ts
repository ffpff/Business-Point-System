// 状态管理工具函数 - 用于在组件外部操作store
import { useAppStore } from './index'
import type { OpportunityWithAnalysis, FilterState, User } from '@/types'

// 获取store实例（用于在组件外部调用）
export const getAppStore = () => useAppStore.getState()

// 订阅store变化（用于在组件外部监听）
export const subscribeToStore = useAppStore.subscribe

// === 用户操作工具 ===
export const userActions = {
  login: (user: User) => {
    getAppStore().setUser(user)
    // 登录后初始化用户相关数据
    getAppStore().addNotification({
      type: 'success',
      title: '登录成功',
      message: `欢迎回来，${user.name || user.email}！`
    })
  },
  
  logout: () => {
    getAppStore().logout()
    // 清空敏感数据
    getAppStore().clearAllErrors()
    getAppStore().addNotification({
      type: 'info',
      title: '已退出登录',
      message: '您已安全退出账户'
    })
  }
}

// === 机会数据操作工具 ===
export const opportunityActions = {
  // 批量添加机会
  addMany: (opportunities: OpportunityWithAnalysis[]) => {
    const store = getAppStore()
    opportunities.forEach(opp => store.addOpportunity(opp))
  },
  
  // 根据ID查找机会
  findById: (id: string): OpportunityWithAnalysis | undefined => {
    return getAppStore().opportunities.find(opp => opp.id === id)
  },
  
  // 获取已收藏的机会
  getBookmarked: (): OpportunityWithAnalysis[] => {
    const store = getAppStore()
    return store.opportunities.filter(opp => store.bookmarkedIds.has(opp.id))
  },
  
  // 按平台筛选
  getByPlatform: (platform: string): OpportunityWithAnalysis[] => {
    return getAppStore().opportunities.filter(opp => opp.platform === platform)
  },
  
  // 按评分筛选
  getByRating: (minRating: number): OpportunityWithAnalysis[] => {
    return getAppStore().opportunities.filter(opp => 
      opp.analysis?.businessRate && opp.analysis.businessRate >= minRating
    )
  }
}

// === 筛选器操作工具 ===
export const filterActions = {
  // 应用快速筛选
  applyQuickFilter: (filterType: 'highRated' | 'recent' | 'popular' | 'bookmarked') => {
    const store = getAppStore()
    
    switch (filterType) {
      case 'highRated':
        store.updateFilters({ minScore: 80, finalRate: ['A', 'B'] })
        break
      case 'recent':
        // 暂时注释掉，需要实现DateRange对象
        // store.updateFilters({ dateRange: { start: new Date(...), end: new Date(...) } })
        break
      case 'popular':
        // 根据互动数据筛选热门内容
        store.updateFilters({ minScore: 60 })
        break
      case 'bookmarked':
        // 这个需要在组件中处理，因为需要筛选已收藏的内容
        break
    }
  },
  
  // 清空所有筛选条件
  clearAll: () => {
    getAppStore().resetFilters()
  },
  
  // 导出筛选器配置
  exportFilters: (): FilterState => {
    return { ...getAppStore().filters }
  },
  
  // 导入筛选器配置
  importFilters: (filters: FilterState) => {
    getAppStore().updateFilters(filters)
  }
}

// === 搜索操作工具 ===
export const searchActions = {
  // 执行搜索并记录历史
  performSearch: async (query: string, searchFunction: (q: string) => Promise<OpportunityWithAnalysis[]>) => {
    const store = getAppStore()
    
    // 设置搜索状态
    store.setCurrentSearch({ query, isSearching: true })
    
    try {
      const results = await searchFunction(query)
      
      // 更新搜索结果
      store.setCurrentSearch({
        isSearching: false,
        results,
        totalResults: results.length
      })
      
      // 添加到搜索历史
      store.addSearchHistory(query, results.length)
      
      return results
    } catch (error) {
      store.setCurrentSearch({ isSearching: false })
      store.setError('search', error instanceof Error ? error.message : '搜索失败')
      throw error
    }
  },
  
  // 获取搜索建议
  getSuggestions: (query: string): string[] => {
    const store = getAppStore()
    return store.searchHistory
      .filter(item => item.query.toLowerCase().includes(query.toLowerCase()))
      .map(item => item.query)
      .slice(0, 5)
  }
}

// === 通知操作工具 ===
export const notificationActions = {
  // 显示成功通知
  success: (title: string, message: string, actionUrl?: string) => {
    getAppStore().addNotification({ type: 'success', title, message, actionUrl })
  },
  
  // 显示错误通知
  error: (title: string, message: string, actionUrl?: string) => {
    getAppStore().addNotification({ type: 'error', title, message, actionUrl })
  },
  
  // 显示警告通知
  warning: (title: string, message: string, actionUrl?: string) => {
    getAppStore().addNotification({ type: 'warning', title, message, actionUrl })
  },
  
  // 显示信息通知
  info: (title: string, message: string, actionUrl?: string) => {
    getAppStore().addNotification({ type: 'info', title, message, actionUrl })
  },
  
  // 批量标记已读
  markAllRead: () => {
    const store = getAppStore()
    store.notifications.forEach(notification => {
      if (!notification.read) {
        store.markNotificationRead(notification.id)
      }
    })
  },
  
  // 清理过期通知（7天前的已读通知）
  cleanupOld: () => {
    const store = getAppStore()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    store.notifications
      .filter(n => n.read && n.timestamp < sevenDaysAgo)
      .forEach(n => store.removeNotification(n.id))
  }
}

// === 缓存操作工具 ===
export const cacheActions = {
  // 检查数据是否需要刷新
  needsRefresh: (key: string, maxAgeMinutes: number = 5): boolean => {
    return getAppStore().isStale(key, maxAgeMinutes * 60)
  },
  
  // 标记数据已刷新
  markRefreshed: (key: string) => {
    getAppStore().setLastRefresh(key, new Date())
  },
  
  // 获取缓存时间
  getCacheAge: (key: string): number => {
    const lastRefresh = getAppStore().lastRefresh[key]
    if (!lastRefresh) return Infinity
    return Math.floor((Date.now() - lastRefresh.getTime()) / 1000)
  }
}

// === 错误处理工具 ===
export const errorActions = {
  // 处理API错误
  handleApiError: (key: string, error: Error | { message?: string; error?: string }) => {
    const store = getAppStore()
    const message = error?.message || ('error' in error ? error.error : undefined) || '操作失败，请稍后重试'
    
    store.setError(key, message)
    store.addNotification({
      type: 'error',
      title: '操作失败',
      message
    })
  },
  
  // 处理网络错误
  handleNetworkError: () => {
    const store = getAppStore()
    const message = '网络连接异常，请检查网络设置'
    
    store.setError('network', message)
    store.addNotification({
      type: 'error',
      title: '网络错误',
      message
    })
  },
  
  // 处理认证错误
  handleAuthError: () => {
    const store = getAppStore()
    store.setError('auth', '登录已过期，请重新登录')
    store.addNotification({
      type: 'warning',
      title: '登录过期',
      message: '请重新登录以继续使用',
      actionUrl: '/signin'
    })
  }
}

// === 性能监控工具 ===
export const performanceActions = {
  // 监控状态变化性能
  monitorStateChanges: () => {
    if (process.env.NODE_ENV === 'development') {
      return subscribeToStore((state, prevState) => {
        const changes = []
        
        if (state.opportunities.length !== prevState.opportunities.length) {
          changes.push('opportunities')
        }
        if (state.filters !== prevState.filters) {
          changes.push('filters')
        }
        if (state.notifications.length !== prevState.notifications.length) {
          changes.push('notifications')
        }
        
        if (changes.length > 0) {
          console.log('[Store] State changed:', changes)
        }
      })
    }
  },
  
  // 获取状态大小信息
  getStateSize: () => {
    const state = getAppStore()
    return {
      opportunities: state.opportunities.length,
      bookmarks: state.bookmarkedIds.size,
      notifications: state.notifications.length,
      searchHistory: state.searchHistory.length,
      filterPresets: Object.keys(state.filterPresets).length
    }
  }
}

// 导出所有工具
export const storeUtils = {
  user: userActions,
  opportunity: opportunityActions,
  filter: filterActions,
  search: searchActions,
  notification: notificationActions,
  cache: cacheActions,
  error: errorActions,
  performance: performanceActions
}