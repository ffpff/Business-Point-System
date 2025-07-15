# Zustand 状态管理使用指南

BusinessScope 项目使用 Zustand 作为客户端状态管理解决方案，提供了完整的类型安全和持久化支持。

## 📁 文件结构

```
src/store/
├── index.ts      # 主要的 Zustand store 配置
├── hooks.ts      # 自定义 hook 封装
├── utils.ts      # 工具函数和组件外部操作
└── README.md     # 使用文档
```

## 🚀 核心功能

### 状态模块

1. **用户管理** - 用户信息、登录状态、认证流程
2. **机会数据** - 商业机会列表、CRUD操作、搜索结果
3. **筛选器** - 高级筛选条件、预设管理、URL同步
4. **收藏系统** - 收藏状态管理、批量操作
5. **搜索功能** - 搜索历史、当前搜索状态、建议
6. **通知系统** - 消息通知、类型分类、已读状态
7. **用户偏好** - 主题设置、默认配置、个人化
8. **错误处理** - 错误状态、错误分类、自动清理
9. **缓存管理** - 数据刷新、过期检查、性能优化

### 持久化策略

- **用户信息** - 登录状态和基本信息
- **收藏状态** - 用户收藏的内容ID
- **搜索历史** - 最近20条搜索记录
- **用户偏好** - 主题、默认设置等
- **筛选预设** - 用户自定义的筛选组合

## 💻 使用示例

### 基础用法

```typescript
import { useAppStore } from '@/store'

function MyComponent() {
  // 直接使用 store
  const user = useAppStore((state) => state.user)
  const setUser = useAppStore((state) => state.setUser)
  
  // 使用自定义 hook
  const { user, setUser, logout } = useUser()
  const { opportunities, setOpportunities } = useOpportunities()
  const { filters, updateFilters, hasActiveFilters } = useFilters()
}
```

### 高级用法

```typescript
import { useNotifications, useErrors, useCache } from '@/store/hooks'
import { storeUtils } from '@/store/utils'

function AdvancedComponent() {
  const { showSuccess, showError } = useNotifications()
  const { handleApiError } = useErrors()
  const { needsRefresh, markRefreshed } = useCache()
  
  const handleAction = async () => {
    try {
      // 检查缓存
      if (needsRefresh('opportunities', 5)) {
        const data = await fetchOpportunities()
        storeUtils.opportunity.addMany(data)
        markRefreshed('opportunities')
        showSuccess('数据更新', '成功获取最新机会')
      }
    } catch (error) {
      storeUtils.error.handleApiError('fetch', error)
    }
  }
}
```

### 筛选器管理

```typescript
import { useFilters } from '@/store/hooks'
import { filterActions } from '@/store/utils'

function FilterComponent() {
  const { filters, updateFilters, hasActiveFilters } = useFilters()
  
  // 应用快速筛选
  const applyHighRatedFilter = () => {
    filterActions.applyQuickFilter('highRated')
  }
  
  // 保存筛选预设
  const saveCurrentFilters = () => {
    const { saveFilterPreset } = useAppStore.getState()
    saveFilterPreset('我的筛选', filters)
  }
}
```

### 搜索功能

```typescript
import { useSearch } from '@/store/hooks'
import { searchActions } from '@/store/utils'

function SearchComponent() {
  const { currentSearch, searchHistory } = useSearch()
  
  const performSearch = async (query: string) => {
    const results = await searchActions.performSearch(query, searchAPI)
    // 搜索结果和历史会自动更新
  }
  
  const getSuggestions = (input: string) => {
    return searchActions.getSuggestions(input)
  }
}
```

### 通知系统

```typescript
import { useNotifications } from '@/store/hooks'
import { notificationActions } from '@/store/utils'

function NotificationComponent() {
  const { notifications, unreadNotificationCount } = useNotifications()
  
  // 显示不同类型的通知
  const showNotifications = () => {
    notificationActions.success('操作成功', '数据保存完成')
    notificationActions.error('操作失败', '网络连接异常')
    notificationActions.warning('注意', '即将达到使用限额')
    notificationActions.info('提示', '有新的机会可查看')
  }
}
```

## 🔧 组件外部使用

```typescript
import { getAppStore, storeUtils } from '@/store/utils'

// API 错误处理
const handleGlobalError = (error: any) => {
  storeUtils.error.handleApiError('global', error)
  storeUtils.notification.error('系统错误', error.message)
}

// 用户登录
const handleLogin = (userData: User) => {
  storeUtils.user.login(userData)
  // 会自动显示欢迎通知
}

// 获取当前状态
const getCurrentUser = () => {
  return getAppStore().user
}
```

## 🎯 最佳实践

### 1. 状态访问优化

```typescript
// ✅ 好的做法 - 只订阅需要的状态
const user = useAppStore((state) => state.user)

// ❌ 避免 - 订阅整个 store
const store = useAppStore()
```

### 2. 批量状态更新

```typescript
// ✅ 好的做法 - 批量更新
const updateMultipleFilters = () => {
  updateFilters({
    platform: ['twitter'],
    minScore: 80,
    finalRate: ['A', 'B']
  })
}

// ❌ 避免 - 多次更新
updateFilters({ platform: ['twitter'] })
updateFilters({ minScore: 80 })
updateFilters({ finalRate: ['A', 'B'] })
```

### 3. 错误处理

```typescript
// ✅ 好的做法 - 统一错误处理
try {
  await apiCall()
} catch (error) {
  storeUtils.error.handleApiError('apiKey', error)
}

// ✅ 好的做法 - 清理错误
useEffect(() => {
  return () => {
    clearError('apiKey')
  }
}, [])
```

### 4. 缓存策略

```typescript
// ✅ 好的做法 - 检查缓存
const refreshData = async () => {
  if (isStale('opportunities', 300)) { // 5分钟过期
    const data = await fetchData()
    setOpportunities(data)
    setLastRefresh('opportunities', new Date())
  }
}
```

## ⚠️ 注意事项

1. **Set 对象持久化** - bookmarkedIds 使用 Set，持久化时会转换为数组
2. **Date 对象序列化** - searchHistory 中的时间戳需要重新转换为 Date
3. **类型安全** - 所有状态都有完整的 TypeScript 类型定义
4. **性能优化** - 使用 subscribeWithSelector 中间件支持选择性订阅
5. **调试支持** - 开发环境下提供状态变化监控工具

## 📊 性能监控

```typescript
import { performanceActions } from '@/store/utils'

// 开发环境下监控状态变化
if (process.env.NODE_ENV === 'development') {
  performanceActions.monitorStateChanges()
}

// 获取状态大小信息
const stateSize = performanceActions.getStateSize()
console.log('Store状态:', stateSize)
```

## 🔄 状态重置

```typescript
// 用户登出时的完整清理
const handleLogout = () => {
  const { logout } = useAppStore.getState()
  logout() // 会自动清理所有用户相关状态
}
```

这个 Zustand 配置提供了完整的状态管理解决方案，支持 BusinessScope 应用的所有功能需求，同时保持代码的可维护性和类型安全。