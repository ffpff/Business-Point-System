import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, RawContent, FilterState } from '@/types'

interface AppState {
  // 用户状态
  user: User | null
  setUser: (user: User | null) => void
  
  // 机会数据状态
  opportunities: RawContent[]
  setOpportunities: (opportunities: RawContent[]) => void
  addOpportunity: (opportunity: RawContent) => void
  
  // 筛选状态
  filters: FilterState
  updateFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void
  
  // 加载状态
  isLoading: boolean
  setLoading: (loading: boolean) => void
  
  // 收藏状态
  bookmarkedIds: Set<string>
  toggleBookmark: (contentId: string) => void
  setBookmarks: (contentIds: string[]) => void
}

const initialFilters: FilterState = {
  platform: [],
  dateRange: undefined,
  minScore: undefined,
  finalRate: [],
  searchQuery: ''
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // 用户状态
      user: null,
      setUser: (user) => set({ user }),
      
      // 机会数据状态
      opportunities: [],
      setOpportunities: (opportunities) => set({ opportunities }),
      addOpportunity: (opportunity) => 
        set((state) => ({ 
          opportunities: [opportunity, ...state.opportunities] 
        })),
      
      // 筛选状态
      filters: initialFilters,
      updateFilters: (newFilters) => 
        set((state) => ({ 
          filters: { ...state.filters, ...newFilters } 
        })),
      resetFilters: () => set({ filters: initialFilters }),
      
      // 加载状态
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),
      
      // 收藏状态
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
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        // 只持久化用户信息和收藏状态
        user: state.user,
        bookmarkedIds: Array.from(state.bookmarkedIds),
      }),
      onRehydrateStorage: () => (state) => {
        // 重新水化时转换数组回Set
        if (state && Array.isArray(state.bookmarkedIds)) {
          state.bookmarkedIds = new Set(state.bookmarkedIds as string[])
        }
      },
    }
  )
)