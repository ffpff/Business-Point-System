import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import type { User, FilterState, OpportunityWithAnalysis, DashboardStats } from '@/types'

// 搜索历史条目类型
interface SearchHistoryItem {
  id: string
  query: string
  timestamp: Date
  resultCount: number
}

// 通知类型
export interface NotificationItem {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

// 用户偏好设置
interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  defaultPageSize: number
  defaultSortBy: 'relevance' | 'date' | 'score' | 'popularity'
  emailNotifications: boolean
  autoRefresh: boolean
  refreshInterval: number // 秒
}

interface AppState {
  // === 用户状态 ===
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
  
  // === 机会数据状态 ===
  opportunities: OpportunityWithAnalysis[]
  setOpportunities: (opportunities: OpportunityWithAnalysis[]) => void
  addOpportunity: (opportunity: OpportunityWithAnalysis) => void
  updateOpportunity: (id: string, updates: Partial<OpportunityWithAnalysis>) => void
  removeOpportunity: (id: string) => void
  
  // === 筛选状态 ===
  filters: FilterState
  updateFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void
  saveFilterPreset: (name: string, filters: FilterState) => void
  loadFilterPreset: (name: string) => void
  filterPresets: Record<string, FilterState>
  
  // === 加载状态 ===
  isLoading: boolean
  setLoading: (loading: boolean) => void
  loadingStates: Record<string, boolean>
  setLoadingState: (key: string, loading: boolean) => void
  
  // === 收藏状态 ===
  bookmarkedIds: Set<string>
  toggleBookmark: (contentId: string) => void
  setBookmarks: (contentIds: string[]) => void
  isBookmarked: (contentId: string) => boolean
  
  // === 搜索功能 ===
  searchHistory: SearchHistoryItem[]
  addSearchHistory: (query: string, resultCount: number) => void
  clearSearchHistory: () => void
  removeSearchHistoryItem: (id: string) => void
  currentSearch: {
    query: string
    isSearching: boolean
    results: OpportunityWithAnalysis[]
    totalResults: number
  }
  setCurrentSearch: (search: Partial<AppState['currentSearch']>) => void
  clearCurrentSearch: () => void
  
  // === 仪表板数据 ===
  dashboardStats: DashboardStats | null
  setDashboardStats: (stats: DashboardStats) => void
  
  // === 通知系统 ===
  notifications: NotificationItem[]
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void
  markNotificationRead: (id: string) => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  unreadNotificationCount: number
  
  // === 用户偏好 ===
  preferences: UserPreferences
  updatePreferences: (prefs: Partial<UserPreferences>) => void
  
  // === 缓存管理 ===
  lastRefresh: Record<string, Date>
  setLastRefresh: (key: string, date: Date) => void
  isStale: (key: string, maxAge: number) => boolean
  
  // === 错误处理 ===
  errors: Record<string, string>
  setError: (key: string, error: string) => void
  clearError: (key: string) => void
  clearAllErrors: () => void
}

const initialFilters: FilterState = {
  platform: [],
  dateRange: undefined,
  minScore: undefined,
  finalRate: [],
  sentimentLabel: [],
  searchQuery: '',
  tags: [],
  hasAnalysis: undefined
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  defaultPageSize: 20,
  defaultSortBy: 'date',
  emailNotifications: true,
  autoRefresh: false,
  refreshInterval: 300 // 5分钟
}

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // === 用户状态 ===
        user: null,
        setUser: (user) => set({ user }),
        logout: () => set({ 
          user: null,
          bookmarkedIds: new Set(),
          searchHistory: [],
          notifications: [],
          dashboardStats: null,
          currentSearch: {
            query: '',
            isSearching: false,
            results: [],
            totalResults: 0
          }
        }),
        
        // === 机会数据状态 ===
        opportunities: [],
        setOpportunities: (opportunities) => set({ opportunities }),
        addOpportunity: (opportunity) => 
          set((state) => ({ 
            opportunities: [opportunity, ...state.opportunities] 
          })),
        updateOpportunity: (id, updates) =>
          set((state) => ({
            opportunities: state.opportunities.map(opp => 
              opp.id === id ? { ...opp, ...updates } : opp
            )
          })),
        removeOpportunity: (id) =>
          set((state) => ({
            opportunities: state.opportunities.filter(opp => opp.id !== id)
          })),
        
        // === 筛选状态 ===
        filters: initialFilters,
        updateFilters: (newFilters) => 
          set((state) => ({ 
            filters: { ...state.filters, ...newFilters } 
          })),
        resetFilters: () => set({ filters: initialFilters }),
        saveFilterPreset: (name, filters) =>
          set((state) => ({
            filterPresets: { ...state.filterPresets, [name]: filters }
          })),
        loadFilterPreset: (name) => {
          const state = get()
          const preset = state.filterPresets[name]
          if (preset) {
            set({ filters: preset })
          }
        },
        filterPresets: {},
        
        // === 加载状态 ===
        isLoading: false,
        setLoading: (isLoading) => set({ isLoading }),
        loadingStates: {},
        setLoadingState: (key, loading) =>
          set((state) => ({
            loadingStates: { ...state.loadingStates, [key]: loading }
          })),
        
        // === 收藏状态 ===
        bookmarkedIds: new Set(),
        toggleBookmark: (contentId) => 
          set((state) => {
            const newBookmarks = new Set(state.bookmarkedIds)
            if (newBookmarks.has(contentId)) {
              newBookmarks.delete(contentId)
            } else {
              newBookmarks.add(contentId)
            }
            return { bookmarkedIds: newBookmarks }
          }),
        setBookmarks: (contentIds) => 
          set({ bookmarkedIds: new Set(contentIds) }),
        isBookmarked: (contentId) => get().bookmarkedIds.has(contentId),
        
        // === 搜索功能 ===
        searchHistory: [],
        addSearchHistory: (query, resultCount) => {
          if (!query.trim()) return
          set((state) => {
            const newItem: SearchHistoryItem = {
              id: generateId(),
              query,
              timestamp: new Date(),
              resultCount
            }
            // 保持最近20条搜索记录，去重
            const filtered = state.searchHistory.filter(item => item.query !== query)
            return {
              searchHistory: [newItem, ...filtered].slice(0, 20)
            }
          })
        },
        clearSearchHistory: () => set({ searchHistory: [] }),
        removeSearchHistoryItem: (id) =>
          set((state) => ({
            searchHistory: state.searchHistory.filter(item => item.id !== id)
          })),
        currentSearch: {
          query: '',
          isSearching: false,
          results: [],
          totalResults: 0
        },
        setCurrentSearch: (search) =>
          set((state) => ({
            currentSearch: { ...state.currentSearch, ...search }
          })),
        clearCurrentSearch: () => set({
          currentSearch: {
            query: '',
            isSearching: false,
            results: [],
            totalResults: 0
          }
        }),
        
        // === 仪表板数据 ===
        dashboardStats: null,
        setDashboardStats: (dashboardStats) => set({ dashboardStats }),
        
        // === 通知系统 ===
        notifications: [],
        addNotification: (notification) =>
          set((state) => {
            const newNotification: NotificationItem = {
              ...notification,
              id: generateId(),
              timestamp: new Date(),
              read: false
            }
            return {
              notifications: [newNotification, ...state.notifications].slice(0, 50) // 保持最多50条
            }
          }),
        markNotificationRead: (id) =>
          set((state) => ({
            notifications: state.notifications.map(n => 
              n.id === id ? { ...n, read: true } : n
            )
          })),
        removeNotification: (id) =>
          set((state) => ({
            notifications: state.notifications.filter(n => n.id !== id)
          })),
        clearAllNotifications: () => set({ notifications: [] }),
        get unreadNotificationCount() {
          return get().notifications.filter(n => !n.read).length
        },
        
        // === 用户偏好 ===
        preferences: defaultPreferences,
        updatePreferences: (prefs) =>
          set((state) => ({
            preferences: { ...state.preferences, ...prefs }
          })),
        
        // === 缓存管理 ===
        lastRefresh: {},
        setLastRefresh: (key, date) =>
          set((state) => ({
            lastRefresh: { ...state.lastRefresh, [key]: date }
          })),
        isStale: (key, maxAge) => {
          const lastRefresh = get().lastRefresh[key]
          if (!lastRefresh) return true
          return Date.now() - lastRefresh.getTime() > maxAge * 1000
        },
        
        // === 错误处理 ===
        errors: {},
        setError: (key, error) =>
          set((state) => ({
            errors: { ...state.errors, [key]: error }
          })),
        clearError: (key) =>
          set((state) => {
            const newErrors = { ...state.errors }
            delete newErrors[key]
            return { errors: newErrors }
          }),
        clearAllErrors: () => set({ errors: {} }),
      }),
      {
        name: 'businessscope-storage',
        version: 1,
        partialize: (state) => ({
          // 持久化用户信息、收藏状态、搜索历史、偏好设置和筛选预设
          user: state.user,
          bookmarkedIds: Array.from(state.bookmarkedIds),
          searchHistory: state.searchHistory,
          preferences: state.preferences,
          filterPresets: state.filterPresets,
        }),
        onRehydrateStorage: () => (state) => {
          // 重新水化时处理数据转换
          if (state) {
            // 转换收藏Set
            if (Array.isArray(state.bookmarkedIds)) {
              state.bookmarkedIds = new Set(state.bookmarkedIds as string[])
            }
            // 确保搜索历史中的时间戳是Date对象
            if (state.searchHistory) {
              state.searchHistory = state.searchHistory.map(item => ({
                ...item,
                timestamp: new Date(item.timestamp)
              }))
            }
            // 确保偏好设置完整
            if (state.preferences) {
              state.preferences = { ...defaultPreferences, ...state.preferences }
            }
          }
        },
      }
    )
  )
)