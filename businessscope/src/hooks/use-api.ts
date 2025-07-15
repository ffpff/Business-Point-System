import { useState, useEffect, useCallback, useRef } from 'react'
import { api, ApiError } from '@/lib/api'
import { useAppStore } from '@/store'
import type {
  OpportunitiesQueryParams,
  SearchQueryParams
} from '@/lib/api'

// 基础API Hook类型
interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
  retry: () => void
  isValidating: boolean
  mutate: (newData: T | null) => void
}

// 分页API Hook类型
interface UsePaginatedApiState<T> extends UseApiState<T> {
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  loadMore: () => void
  hasMore: boolean
}

/**
 * 基础API Hook - 通用的数据获取逻辑
 */
function useApiData<T>(
  apiCall: () => Promise<T>,
  dependencies: unknown[] = [],
  immediate = true,
  options: {
    retryAttempts?: number
    retryDelay?: number
    onSuccess?: (data: T) => void
    onError?: (error: string) => void
    enableOptimisticUpdates?: boolean
  } = {}
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(immediate)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const { 
    retryAttempts = 3, 
    retryDelay = 1000,
    onSuccess,
    onError,
    enableOptimisticUpdates = false
  } = options

  const { setError: setGlobalError, clearError: clearGlobalError } = useAppStore()

  const fetchData = useCallback(async (isRetry = false) => {
    try {
      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()
      
      if (!isRetry) {
        setLoading(true)
        setRetryCount(0)
      } else {
        setIsValidating(true)
      }
      
      setError(null)
      clearGlobalError('api')

      const result = await apiCall()
      setData(result)
      
      if (onSuccess) {
        onSuccess(result)
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // 请求被取消，不处理错误
      }
      
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : err instanceof Error 
          ? err.message 
          : '未知错误'
      
      setError(errorMessage)
      setGlobalError('api', errorMessage)
      
      if (onError) {
        onError(errorMessage)
      }
      
      // 自动重试逻辑
      if (retryCount < retryAttempts && !isRetry) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          fetchData(true)
        }, retryDelay * Math.pow(2, retryCount)) // 指数退避
      }
    } finally {
      setLoading(false)
      setIsValidating(false)
      abortControllerRef.current = null
    }
  }, [apiCall, setGlobalError, clearGlobalError, retryCount, retryAttempts, retryDelay, onSuccess, onError])

  useEffect(() => {
    if (immediate) {
      fetchData()
    }
    
    // 清理函数
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, fetchData, ...dependencies])

  const refetch = useCallback(() => {
    setRetryCount(0)
    fetchData()
  }, [fetchData])
  
  const retry = useCallback(() => {
    if (error) {
      fetchData(true)
    }
  }, [fetchData, error])
  
  const mutate = useCallback((newData: T | null) => {
    if (enableOptimisticUpdates) {
      setData(newData)
    }
  }, [enableOptimisticUpdates])

  return { 
    data, 
    loading, 
    isValidating,
    error, 
    refetch, 
    retry,
    mutate
  }
}

/**
 * 机会列表Hook - 支持筛选和分页
 */
export function useOpportunities(params: OpportunitiesQueryParams = {}) {
  const [meta, setMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  const { setOpportunities, opportunities: storeOpportunities } = useAppStore()

  const apiCall = useCallback(async () => {
    const response = await api.getOpportunities(params)
    
    // 更新Zustand store
    if (response.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setOpportunities(response.data.opportunities as any)
    }
    
    // 更新分页元数据
    setMeta(response.meta)
    
    return response
  }, [params, setOpportunities])

  const result = useApiData(
    apiCall,
    [JSON.stringify(params)], // 使用JSON stringify确保参数变化能被检测到
    true
  )

  const loadMore = useCallback(async () => {
    if (!meta.hasNextPage || result.loading) return

    try {
      const nextPageParams = { ...params, page: meta.page + 1 }
      const response = await api.getOpportunities(nextPageParams)
      
      // 追加数据到store
      if (response.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newOpportunities = [...storeOpportunities, ...response.data.opportunities as any]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setOpportunities(newOpportunities as any)
      }
      
      // 更新分页元数据
      setMeta(response.meta)
    } catch (err) {
      console.error('Load more failed:', err)
    }
  }, [meta, params, result.loading, storeOpportunities, setOpportunities])

  return {
    ...result,
    meta,
    loadMore,
    hasMore: meta.hasNextPage,
    opportunities: storeOpportunities
  }
}

/**
 * 机会详情Hook
 */
export function useOpportunity(id: string) {
  const { updateOpportunity } = useAppStore()

  const apiCall = useCallback(async () => {
    const response = await api.getOpportunity(id)
    
    // 更新store中的机会数据
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateOpportunity(id, response.opportunity as any)
    
    return response
  }, [id, updateOpportunity])

  return useApiData(apiCall, [id])
}

/**
 * 搜索Hook - 支持高级搜索
 */
export function useSearch(params: SearchQueryParams) {
  const { addSearchHistory } = useAppStore()

  const apiCall = useCallback(async () => {
    const response = await api.searchOpportunities(params)
    
    // 记录搜索历史
    if (response.data) {
      addSearchHistory(params.q, response.data.total)
    }
    
    return response
  }, [params, addSearchHistory])

  const result = useApiData(
    apiCall,
    [JSON.stringify(params)],
    !!params.q // 只有在有搜索词时才自动执行
  )

  return {
    ...result,
    searchResults: result.data?.data?.opportunities || [],
    meta: result.data?.meta || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false
    }
  }
}

/**
 * 搜索建议Hook
 */
export function useSearchSuggestions(query: string, enabled = true) {
  const apiCall = useCallback(async () => {
    if (!query || query.length < 2) {
      return { success: true, suggestions: [] }
    }
    return api.getSearchSuggestions(query)
  }, [query])

  return useApiData(
    apiCall,
    [query],
    enabled && query.length >= 2
  )
}

/**
 * 搜索历史Hook
 */
export function useSearchHistory() {
  const { searchHistory } = useAppStore()

  const apiCall = useCallback(async () => {
    return api.getSearchHistory()
  }, [])

  const result = useApiData(apiCall, [], true)

  const clearHistory = useCallback(async () => {
    try {
      await api.clearSearchHistory()
      result.refetch()
    } catch (err) {
      console.error('Clear search history failed:', err)
    }
  }, [result])

  return {
    ...result,
    history: result.data?.history || searchHistory,
    clearHistory
  }
}

/**
 * 收藏操作Hook
 */
export function useBookmark() {
  const { toggleBookmark: toggleStoreBookmark, bookmarkedIds } = useAppStore()
  const [loading, setLoading] = useState(false)

  const toggleBookmark = useCallback(async (
    id: string, 
    action: 'bookmark' | 'unbookmark',
    notes?: string
  ) => {
    try {
      setLoading(true)
      
      await api.toggleBookmark(id, action, notes)
      
      // 更新store中的收藏状态
      toggleStoreBookmark(id)
      
      return true
    } catch (err) {
      console.error('Toggle bookmark failed:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [toggleStoreBookmark])

  const isBookmarked = useCallback((id: string) => {
    return bookmarkedIds.has(id)
  }, [bookmarkedIds])

  return {
    toggleBookmark,
    isBookmarked,
    loading
  }
}

/**
 * 用户统计Hook
 */
export function useUserStats() {
  const apiCall = useCallback(async () => {
    return api.getUserStats()
  }, [])

  return useApiData(apiCall, [], true)
}

/**
 * 用户活动Hook
 */
export function useUserActivities(params: { page?: number; limit?: number } = {}) {
  const apiCall = useCallback(async () => {
    return api.getUserActivities(params)
  }, [params])

  return useApiData(apiCall, [JSON.stringify(params)], true)
}

/**
 * 用户使用图表Hook
 */
export function useUserUsageChart(timeRange = '7d') {
  const apiCall = useCallback(async () => {
    return api.getUserUsageChart({ timeRange })
  }, [timeRange])

  return useApiData(apiCall, [timeRange], true)
}

/**
 * 用户收藏列表Hook
 */
export function useUserBookmarks(params: { page?: number; limit?: number } = {}) {
  const { setBookmarks } = useAppStore()

  const apiCall = useCallback(async () => {
    const response = await api.getUserBookmarks(params)
    
    // 更新store中的收藏列表
    if (response.bookmarks) {
      const bookmarkIds = response.bookmarks.map(b => b.id)
      setBookmarks(bookmarkIds)
    }
    
    return response
  }, [params, setBookmarks])

  return useApiData(apiCall, [JSON.stringify(params)], true)
}

/**
 * 用户个人资料Hook
 */
export function useUserProfile() {
  const apiCall = useCallback(async () => {
    return api.getUserProfile()
  }, [])

  const result = useApiData(apiCall, [], true)

  const updateProfile = useCallback(async (data: {
    name?: string
    email?: string
    preferences?: Record<string, unknown>
  }) => {
    try {
      await api.updateUserProfile(data)
      result.refetch()
      return true
    } catch (err) {
      console.error('Update profile failed:', err)
      return false
    }
  }, [result])

  return {
    ...result,
    updateProfile
  }
}

/**
 * 趋势数据Hook
 */
export function useTrendingData(params: { dateRange?: string; platform?: string } = {}) {
  const apiCall = useCallback(async () => {
    return api.getTrendingData(params)
  }, [params])

  return useApiData(apiCall, [JSON.stringify(params)], true)
}

// 导出错误处理工具
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return '未知错误，请稍后重试'
}

/**
 * 通用错误处理Hook
 */
export function useErrorHandler() {
  const { setError: setGlobalError, clearError: clearGlobalError } = useAppStore()
  
  const handleError = useCallback((
    error: unknown, 
    context?: string,
    options?: {
      showGlobalError?: boolean
      logToConsole?: boolean
      customMessage?: string
    }
  ) => {
    const {
      showGlobalError = true,
      logToConsole = true,
      customMessage
    } = options || {}
    
    const errorMessage = customMessage || handleApiError(error)
    
    if (logToConsole) {
      console.error(`Error in ${context || 'unknown context'}:`, error)
    }
    
    if (showGlobalError) {
      setGlobalError(context || 'api', errorMessage)
    }
    
    return errorMessage
  }, [setGlobalError])
  
  const clearError = useCallback((context?: string) => {
    clearGlobalError(context || 'api')
  }, [clearGlobalError])
  
  return {
    handleError,
    clearError
  }
}

/**
 * 加载状态管理Hook
 */
export function useLoadingState(initialState = false) {
  const [loading, setLoading] = useState(initialState)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  
  const setLoadingState = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }))
  }, [])
  
  const isAnyLoading = useCallback(() => {
    return loading || Object.values(loadingStates).some(Boolean)
  }, [loading, loadingStates])
  
  const getLoadingState = useCallback((key: string) => {
    return loadingStates[key] || false
  }, [loadingStates])
  
  const clearLoadingState = useCallback((key: string) => {
    setLoadingStates(prev => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _, ...rest } = prev
      return rest
    })
  }, [])
  
  const clearAllLoadingStates = useCallback(() => {
    setLoadingStates({})
    setLoading(false)
  }, [])
  
  return {
    loading,
    setLoading,
    loadingStates,
    setLoadingState,
    getLoadingState,
    isAnyLoading,
    clearLoadingState,
    clearAllLoadingStates
  }
}

/**
 * 乐观更新Hook - 用于立即更新UI，后台同步
 */
export function useOptimisticUpdate<T>() {
  const [optimisticData, setOptimisticData] = useState<T | null>(null)
  const [isOptimistic, setIsOptimistic] = useState(false)
  
  const performOptimisticUpdate = useCallback(
    async <R>(
      optimisticValue: T,
      asyncOperation: () => Promise<R>,
      onSuccess?: (result: R) => void,
      onError?: (error: unknown) => void
    ) => {
      try {
        // 立即更新UI
        setOptimisticData(optimisticValue)
        setIsOptimistic(true)
        
        // 执行后台操作
        const result = await asyncOperation()
        
        // 成功后确认更新
        setIsOptimistic(false)
        if (onSuccess) {
          onSuccess(result)
        }
        
        return result
      } catch (error) {
        // 失败时回滚
        setOptimisticData(null)
        setIsOptimistic(false)
        
        if (onError) {
          onError(error)
        }
        
        throw error
      }
    },
    []
  )
  
  const resetOptimistic = useCallback(() => {
    setOptimisticData(null)
    setIsOptimistic(false)
  }, [])
  
  return {
    optimisticData,
    isOptimistic,
    performOptimisticUpdate,
    resetOptimistic
  }
}

/**
 * 防抖API调用Hook
 */
export function useDebouncedApi<T>(
  apiCall: () => Promise<T>,
  delay = 300,
  dependencies: unknown[] = []
) {
  const [debouncedDeps, setDebouncedDeps] = useState(dependencies)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDeps(dependencies)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [dependencies, delay])
  
  return useApiData(apiCall, [JSON.stringify(debouncedDeps)], true, {
    retryAttempts: 1
  })
}

// 导出类型
export type {
  UseApiState,
  UsePaginatedApiState
}