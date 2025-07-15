// Zustand状态管理的自定义hook和实用工具
import { useEffect, useCallback } from 'react'
import { useAppStore } from './index'
import type { FilterState, FinalRate, Platform } from '@/types'

// 用户状态管理hook
export const useUser = () => {
  const user = useAppStore((state) => state.user)
  const setUser = useAppStore((state) => state.setUser)
  const logout = useAppStore((state) => state.logout)
  
  return { user, setUser, logout }
}

// 机会数据管理hook
export const useOpportunities = () => {
  const opportunities = useAppStore((state) => state.opportunities)
  const setOpportunities = useAppStore((state) => state.setOpportunities)
  const addOpportunity = useAppStore((state) => state.addOpportunity)
  const updateOpportunity = useAppStore((state) => state.updateOpportunity)
  const removeOpportunity = useAppStore((state) => state.removeOpportunity)
  
  return {
    opportunities,
    setOpportunities,
    addOpportunity,
    updateOpportunity,
    removeOpportunity
  }
}

// 筛选器管理hook
export const useFilters = () => {
  const filters = useAppStore((state) => state.filters)
  const updateFilters = useAppStore((state) => state.updateFilters)
  const resetFilters = useAppStore((state) => state.resetFilters)
  const filterPresets = useAppStore((state) => state.filterPresets)
  const saveFilterPreset = useAppStore((state) => state.saveFilterPreset)
  const loadFilterPreset = useAppStore((state) => state.loadFilterPreset)
  
  // 检查是否有活跃的筛选条件
  const hasActiveFilters = useCallback(() => {
    return (
      (filters.platform?.length || 0) > 0 ||
      (filters.finalRate?.length || 0) > 0 ||
      (filters.sentimentLabel?.length || 0) > 0 ||
      filters.minScore !== undefined ||
      filters.dateRange !== undefined ||
      (filters.searchQuery && filters.searchQuery.trim().length > 0) ||
      (filters.tags?.length || 0) > 0 ||
      filters.hasAnalysis !== undefined
    )
  }, [filters])
  
  return {
    filters,
    updateFilters,
    resetFilters,
    filterPresets,
    saveFilterPreset,
    loadFilterPreset,
    hasActiveFilters: hasActiveFilters()
  }
}

// 收藏管理hook
export const useBookmarks = () => {
  const bookmarkedIds = useAppStore((state) => state.bookmarkedIds)
  const toggleBookmark = useAppStore((state) => state.toggleBookmark)
  const setBookmarks = useAppStore((state) => state.setBookmarks)
  const isBookmarked = useAppStore((state) => state.isBookmarked)
  
  const bookmarkCount = bookmarkedIds.size
  
  return {
    bookmarkedIds,
    toggleBookmark,
    setBookmarks,
    isBookmarked,
    bookmarkCount
  }
}

// 搜索功能hook
export const useSearch = () => {
  const searchHistory = useAppStore((state) => state.searchHistory)
  const addSearchHistory = useAppStore((state) => state.addSearchHistory)
  const clearSearchHistory = useAppStore((state) => state.clearSearchHistory)
  const removeSearchHistoryItem = useAppStore((state) => state.removeSearchHistoryItem)
  const currentSearch = useAppStore((state) => state.currentSearch)
  const setCurrentSearch = useAppStore((state) => state.setCurrentSearch)
  const clearCurrentSearch = useAppStore((state) => state.clearCurrentSearch)
  
  return {
    searchHistory,
    addSearchHistory,
    clearSearchHistory,
    removeSearchHistoryItem,
    currentSearch,
    setCurrentSearch,
    clearCurrentSearch
  }
}

// 加载状态管理hook
export const useLoading = () => {
  const isLoading = useAppStore((state) => state.isLoading)
  const setLoading = useAppStore((state) => state.setLoading)
  const loadingStates = useAppStore((state) => state.loadingStates)
  const setLoadingState = useAppStore((state) => state.setLoadingState)
  
  const isLoadingAny = useCallback(() => {
    return isLoading || Object.values(loadingStates).some(Boolean)
  }, [isLoading, loadingStates])
  
  const getLoadingState = useCallback((key: string) => {
    return loadingStates[key] || false
  }, [loadingStates])
  
  return {
    isLoading,
    setLoading,
    loadingStates,
    setLoadingState,
    isLoadingAny: isLoadingAny(),
    getLoadingState
  }
}

// 通知系统hook
export const useNotifications = () => {
  const notifications = useAppStore((state) => state.notifications)
  const addNotification = useAppStore((state) => state.addNotification)
  const markNotificationRead = useAppStore((state) => state.markNotificationRead)
  const removeNotification = useAppStore((state) => state.removeNotification)
  const clearAllNotifications = useAppStore((state) => state.clearAllNotifications)
  const unreadNotificationCount = useAppStore((state) => state.unreadNotificationCount)
  
  // 显示不同类型的通知
  const showSuccess = useCallback((title: string, message: string, actionUrl?: string) => {
    addNotification({ type: 'success', title, message, actionUrl })
  }, [addNotification])
  
  const showError = useCallback((title: string, message: string, actionUrl?: string) => {
    addNotification({ type: 'error', title, message, actionUrl })
  }, [addNotification])
  
  const showWarning = useCallback((title: string, message: string, actionUrl?: string) => {
    addNotification({ type: 'warning', title, message, actionUrl })
  }, [addNotification])
  
  const showInfo = useCallback((title: string, message: string, actionUrl?: string) => {
    addNotification({ type: 'info', title, message, actionUrl })
  }, [addNotification])
  
  return {
    notifications,
    addNotification,
    markNotificationRead,
    removeNotification,
    clearAllNotifications,
    unreadNotificationCount,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}

// 用户偏好设置hook
export const usePreferences = () => {
  const preferences = useAppStore((state) => state.preferences)
  const updatePreferences = useAppStore((state) => state.updatePreferences)
  
  return {
    preferences,
    updatePreferences
  }
}

// 错误处理hook
export const useErrors = () => {
  const errors = useAppStore((state) => state.errors)
  const setError = useAppStore((state) => state.setError)
  const clearError = useAppStore((state) => state.clearError)
  const clearAllErrors = useAppStore((state) => state.clearAllErrors)
  
  const hasErrors = Object.keys(errors).length > 0
  
  const getError = useCallback((key: string) => {
    return errors[key] || null
  }, [errors])
  
  return {
    errors,
    setError,
    clearError,
    clearAllErrors,
    hasErrors,
    getError
  }
}

// 缓存管理hook
export const useCache = () => {
  const lastRefresh = useAppStore((state) => state.lastRefresh)
  const setLastRefresh = useAppStore((state) => state.setLastRefresh)
  const isStale = useAppStore((state) => state.isStale)
  
  return {
    lastRefresh,
    setLastRefresh,
    isStale
  }
}

// 仪表板数据hook
export const useDashboard = () => {
  const dashboardStats = useAppStore((state) => state.dashboardStats)
  const setDashboardStats = useAppStore((state) => state.setDashboardStats)
  
  return {
    dashboardStats,
    setDashboardStats
  }
}

// 综合状态hook - 提供应用的整体状态概览
export const useAppStatus = () => {
  const user = useAppStore((state) => state.user)
  const isLoading = useAppStore((state) => state.isLoading)
  const loadingStates = useAppStore((state) => state.loadingStates)
  const errors = useAppStore((state) => state.errors)
  const unreadNotificationCount = useAppStore((state) => state.unreadNotificationCount)
  
  const isAuthenticated = !!user
  const hasErrors = Object.keys(errors).length > 0
  const isLoadingAny = isLoading || Object.values(loadingStates).some(Boolean)
  
  return {
    isAuthenticated,
    hasErrors,
    isLoadingAny,
    unreadNotificationCount,
    user
  }
}

// 自动保存筛选器状态到URL参数
export const useSyncFiltersWithURL = () => {
  const filters = useAppStore((state) => state.filters)
  const updateFilters = useAppStore((state) => state.updateFilters)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const params = new URLSearchParams(window.location.search)
    
    // 从URL参数恢复筛选器状态
    const urlFilters: Partial<FilterState> = {}
    
    if (params.get('platform')) {
      urlFilters.platform = params.get('platform')!.split(',') as Platform[]
    }
    if (params.get('finalRate')) {
      urlFilters.finalRate = params.get('finalRate')!.split(',') as FinalRate[]
    }
    if (params.get('minScore')) {
      urlFilters.minScore = Number(params.get('minScore'))
    }
    if (params.get('dateRange')) {
      // URL中的dateRange是字符串，需要转换为DateRange对象
      // 暂时注释掉，因为需要更复杂的解析逻辑
      // urlFilters.dateRange = params.get('dateRange')!
    }
    if (params.get('q')) {
      urlFilters.searchQuery = params.get('q')!
    }
    
    if (Object.keys(urlFilters).length > 0) {
      updateFilters(urlFilters)
    }
  }, [updateFilters])
  
  // 将筛选器状态同步到URL
  const syncToURL = useCallback(() => {
    if (typeof window === 'undefined') return
    
    const params = new URLSearchParams()
    
    if (filters.platform && filters.platform.length > 0) {
      params.set('platform', filters.platform.join(','))
    }
    if (filters.finalRate && filters.finalRate.length > 0) {
      params.set('finalRate', filters.finalRate.join(','))
    }
    if (filters.minScore !== undefined) {
      params.set('minScore', filters.minScore.toString())
    }
    if (filters.dateRange) {
      // 将DateRange对象转换为字符串格式用于URL
      // 暂时注释掉，需要实现序列化逻辑
      // params.set('dateRange', JSON.stringify(filters.dateRange))
    }
    if (filters.searchQuery?.trim()) {
      params.set('q', filters.searchQuery.trim())
    }
    
    const newURL = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newURL)
  }, [filters])
  
  return { syncToURL }
}