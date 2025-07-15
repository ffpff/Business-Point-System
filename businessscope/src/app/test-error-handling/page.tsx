'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner, LoadingOverlay, LoadingButton } from '@/components/ui/loading-spinner'
import { 
  ErrorMessage, 
  SimpleErrorMessage, 
  SuccessMessage, 
  WarningMessage, 
  InfoMessage,
  InlineError,
  LoadingError,
  EmptyState
} from '@/components/ui/error-message'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { useErrorHandler, useLoadingState, useOptimisticUpdate } from '@/hooks/use-api'
import { Lightbulb, Users, Settings } from 'lucide-react'

// 模拟错误组件
function ErrorComponent() {
  const [shouldError, setShouldError] = useState(false)
  
  if (shouldError) {
    throw new Error('这是一个测试错误，用于验证ErrorBoundary功能')
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>ErrorBoundary 测试</CardTitle>
        <CardDescription>点击按钮触发错误，测试错误边界处理</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => setShouldError(true)}
          variant="destructive"
        >
          触发组件错误
        </Button>
      </CardContent>
    </Card>
  )
}

export default function TestErrorHandlingPage() {
  const [apiError, setApiError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isAsyncLoading, setIsAsyncLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  
  const { handleError, clearError } = useErrorHandler()
  const { 
    loading, 
    setLoading, 
    setLoadingState, 
    getLoadingState, 
    isAnyLoading, 
    clearAllLoadingStates 
  } = useLoadingState()
  
  const { performOptimisticUpdate, optimisticData, isOptimistic } = useOptimisticUpdate<string>()

  // 模拟API错误
  const simulateApiError = () => {
    const error = new Error('模拟的API请求失败')
    const errorMessage = handleError(error, 'test-api', {
      customMessage: '这是一个自定义的错误消息'
    })
    setApiError(errorMessage)
  }

  // 模拟成功状态
  const simulateSuccess = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  // 模拟异步加载
  const simulateAsyncLoading = async () => {
    setIsAsyncLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsAsyncLoading(false)
  }

  // 模拟表单验证错误
  const simulateFormError = () => {
    setFormError('用户名必须至少包含3个字符')
    setTimeout(() => setFormError(null), 5000)
  }

  // 模拟乐观更新
  const simulateOptimisticUpdate = async () => {
    try {
      await performOptimisticUpdate(
        '乐观更新的数据',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 1500))
          // 模拟50%的失败率
          if (Math.random() > 0.5) {
            throw new Error('乐观更新失败')
          }
          return '更新成功'
        },
        (result) => {
          console.log('乐观更新成功:', result)
        },
        (error) => {
          handleError(error, 'optimistic-update')
        }
      )
    } catch (error) {
      console.error('乐观更新错误:', error)
    }
  }

  // 模拟多个加载状态
  const simulateMultipleLoading = () => {
    setLoadingState('task1', true)
    setLoadingState('task2', true)
    setLoadingState('task3', true)
    
    setTimeout(() => setLoadingState('task1', false), 1000)
    setTimeout(() => setLoadingState('task2', false), 2000)
    setTimeout(() => setLoadingState('task3', false), 3000)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">错误处理和加载状态测试</h1>
          <p className="text-muted-foreground mt-2">
            测试各种错误处理机制和加载状态组件的用户体验
          </p>
        </div>

        {/* 错误消息组件测试 */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">错误消息组件</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>基础错误消息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ErrorMessage
                  error="这是一个基础的错误消息"
                  title="操作失败"
                  onRetry={() => console.log('重试操作')}
                />
                
                <WarningMessage message="这是一个警告消息，提醒用户注意" />
                
                <InfoMessage message="这是一个信息提示，提供额外的说明" />
                
                {showSuccess && (
                  <SuccessMessage message="操作成功完成！" />
                )}
                
                <Button onClick={simulateSuccess}>显示成功消息</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API 错误处理</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiError && (
                  <LoadingError
                    error={apiError}
                    onRetry={() => {
                      clearError('test-api')
                      setApiError(null)
                    }}
                  />
                )}
                
                <div className="space-x-2">
                  <Button onClick={simulateApiError} variant="destructive">
                    模拟API错误
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      clearError('test-api')
                      setApiError(null)
                    }}
                    variant="outline"
                  >
                    清除错误
                  </Button>
                </div>
                
                <SimpleErrorMessage 
                  message="这是一个简单的错误消息" 
                  className="mt-4"
                />
                
                <div>
                  <label className="text-sm font-medium">用户名</label>
                  <input 
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="输入用户名"
                  />
                  <InlineError error={formError} />
                  <Button 
                    onClick={simulateFormError}
                    size="sm"
                    variant="outline"
                    className="mt-2"
                  >
                    模拟表单错误
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 加载状态组件测试 */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">加载状态组件</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Loading Spinner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm">小尺寸</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <LoadingSpinner size="md" />
                    <span className="text-sm">中等尺寸</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <LoadingSpinner size="lg" />
                    <span className="text-sm">大尺寸</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <LoadingSpinner size="xl" text="正在加载..." />
                    <span className="text-sm">特大尺寸 + 文本</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <LoadingButton
                    isLoading={isAsyncLoading}
                    onClick={simulateAsyncLoading}
                    loadingText="加载中..."
                  >
                    异步加载按钮
                  </LoadingButton>
                  
                  <div className="text-sm text-muted-foreground">
                    点击按钮查看加载状态
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>加载状态管理</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">全局加载状态:</span>
                    <span className={`text-sm ${loading ? 'text-orange-600' : 'text-green-600'}`}>
                      {loading ? '加载中' : '空闲'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">是否有任何加载:</span>
                    <span className={`text-sm ${isAnyLoading() ? 'text-orange-600' : 'text-green-600'}`}>
                      {isAnyLoading() ? '是' : '否'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div>Task 1: {getLoadingState('task1') ? '🔄' : '✅'}</div>
                    <div>Task 2: {getLoadingState('task2') ? '🔄' : '✅'}</div>
                    <div>Task 3: {getLoadingState('task3') ? '🔄' : '✅'}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-x-2">
                  <Button onClick={() => setLoading(!loading)} size="sm">
                    切换全局加载
                  </Button>
                  <Button onClick={simulateMultipleLoading} size="sm">
                    模拟多任务加载
                  </Button>
                  <Button onClick={clearAllLoadingStates} size="sm" variant="outline">
                    清除所有状态
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 乐观更新测试 */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">乐观更新</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>乐观更新测试</CardTitle>
              <CardDescription>
                测试UI立即更新，后台同步，失败时回滚的功能
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-md">
                <div className="text-sm font-medium mb-2">当前数据:</div>
                <div className="text-lg">
                  {optimisticData || '无数据'}
                  {isOptimistic && (
                    <span className="ml-2 text-xs text-orange-600">(乐观更新中...)</span>
                  )}
                </div>
              </div>
              
              <Button onClick={simulateOptimisticUpdate}>
                执行乐观更新 (50% 失败率)
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Loading Overlay 测试 */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Loading Overlay</h2>
          
          <LoadingOverlay 
            isLoading={loading} 
            text="正在处理请求..."
          >
            <Card>
              <CardHeader>
                <CardTitle>被遮罩的内容</CardTitle>
                <CardDescription>
                  当加载状态为true时，此内容将被遮罩
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  这是一些示例内容。当加载状态激活时，这些内容会被半透明遮罩覆盖，
                  并显示加载指示器。
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-md">内容区域 1</div>
                  <div className="p-4 bg-muted rounded-md">内容区域 2</div>
                </div>
              </CardContent>
            </Card>
          </LoadingOverlay>
        </section>

        {/* 空状态测试 */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">空状态组件</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState
              title="暂无用户"
              description="当前系统中还没有注册用户，请邀请用户加入"
              icon={Users}
              action={
                <Button>
                  <Users className="w-4 h-4 mr-2" />
                  邀请用户
                </Button>
              }
            />
            
            <EmptyState
              title="功能开发中"
              description="此功能正在开发中，敬请期待"
              icon={Settings}
              action={
                <Button variant="outline">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  了解更多
                </Button>
              }
            />
          </div>
        </section>

        {/* ErrorBoundary 测试 */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">错误边界</h2>
          
          <ErrorBoundary
            showDetails={true}
            onError={(error, errorInfo) => {
              console.error('ErrorBoundary 捕获错误:', error, errorInfo)
            }}
          >
            <ErrorComponent />
          </ErrorBoundary>
        </section>
      </div>
    </div>
  )
}