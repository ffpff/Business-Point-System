"use client"

import React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showDetails?: boolean
}

interface ErrorFallbackProps {
  error?: Error
  errorInfo?: React.ErrorInfo
  resetError: () => void
  showDetails?: boolean
}

function DefaultErrorFallback({ 
  error, 
  errorInfo, 
  resetError, 
  showDetails = false 
}: ErrorFallbackProps) {
  return (
    <Card className="w-full max-w-lg mx-auto my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          出现错误
        </CardTitle>
        <CardDescription>
          抱歉，页面遇到了一些问题。请尝试刷新页面或稍后再试。
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {showDetails && error && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <details className="text-sm">
              <summary className="cursor-pointer font-medium mb-2">
                错误详情
              </summary>
              <div className="space-y-2 text-muted-foreground">
                <div>
                  <strong>错误信息:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>堆栈跟踪:</strong>
                    <pre className="text-xs mt-1 whitespace-pre-wrap break-all">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {errorInfo?.componentStack && (
                  <div>
                    <strong>组件堆栈:</strong>
                    <pre className="text-xs mt-1 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button onClick={resetError} className="w-full" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          重新加载
        </Button>
      </CardFooter>
    </Card>
  )
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          showDetails={this.props.showDetails}
        />
      )
    }

    return this.props.children
  }
}

// Hook版本的错误边界，用于函数组件
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error("Error caught by useErrorHandler:", error, errorInfo)
    
    // 在开发环境下显示错误详情
    if (process.env.NODE_ENV === "development") {
      console.error("Error stack:", error.stack)
      if (errorInfo) {
        console.error("Component stack:", errorInfo.componentStack)
      }
    }
    
    // 这里可以集成错误报告服务，如 Sentry
    // reportError(error, errorInfo)
  }
}

// 用于包装组件的HOC
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// 简单的错误展示组件
export function ErrorMessage({ 
  error, 
  title = "操作失败", 
  onRetry,
  className 
}: {
  error: string | Error
  title?: string
  onRetry?: () => void
  className?: string
}) {
  const errorMessage = typeof error === "string" ? error : error.message

  return (
    <div className={`rounded-md border border-destructive/50 bg-destructive/10 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-destructive">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}