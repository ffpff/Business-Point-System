import { AlertTriangle, RefreshCw, Info, CheckCircle, XCircle } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const errorMessageVariants = cva(
  "rounded-md border p-4",
  {
    variants: {
      variant: {
        destructive: "border-destructive/50 bg-destructive/10 text-destructive",
        warning: "border-orange-500/50 bg-orange-50 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
        info: "border-blue-500/50 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
        success: "border-green-500/50 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200",
      },
      size: {
        sm: "p-3 text-sm",
        md: "p-4 text-sm",
        lg: "p-6 text-base",
      },
    },
    defaultVariants: {
      variant: "destructive",
      size: "md",
    },
  }
)

const iconMap = {
  destructive: XCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
}

export interface ErrorMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof errorMessageVariants> {
  error: string | Error
  title?: string
  onRetry?: () => void
  retryText?: string
  hideIcon?: boolean
  description?: string
}

export function ErrorMessage({
  error,
  title,
  onRetry,
  retryText = "重试",
  hideIcon = false,
  description,
  variant = "destructive",
  size,
  className,
  ...props
}: ErrorMessageProps) {
  const errorMessage = typeof error === "string" ? error : error.message
  const Icon = iconMap[variant || "destructive"]

  return (
    <div className={cn(errorMessageVariants({ variant, size }), className)} {...props}>
      <div className="flex items-start gap-3">
        {!hideIcon && (
          <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <p className="text-sm opacity-90">
            {errorMessage}
          </p>
          {description && (
            <p className="text-xs opacity-75 mt-1">
              {description}
            </p>
          )}
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryText}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// 简化版本的错误消息组件
export function SimpleErrorMessage({ 
  message, 
  className 
}: { 
  message: string
  className?: string 
}) {
  return (
    <div className={cn(
      "text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2",
      className
    )}>
      {message}
    </div>
  )
}

// 成功消息组件
export function SuccessMessage({ 
  message, 
  className 
}: { 
  message: string
  className?: string 
}) {
  return (
    <ErrorMessage
      error={message}
      variant="success"
      hideIcon={false}
      className={className}
    />
  )
}

// 警告消息组件
export function WarningMessage({ 
  message, 
  className 
}: { 
  message: string
  className?: string 
}) {
  return (
    <ErrorMessage
      error={message}
      variant="warning"
      hideIcon={false}
      className={className}
    />
  )
}

// 信息消息组件
export function InfoMessage({ 
  message, 
  className 
}: { 
  message: string
  className?: string 
}) {
  return (
    <ErrorMessage
      error={message}
      variant="info"
      hideIcon={false}
      className={className}
    />
  )
}

// 内联错误消息（用于表单等）
export function InlineError({ 
  error, 
  className 
}: { 
  error?: string | null
  className?: string 
}) {
  if (!error) return null
  
  return (
    <div className={cn("text-xs text-destructive mt-1", className)}>
      {error}
    </div>
  )
}

// 加载错误组件（包含重试功能）
export function LoadingError({
  error,
  onRetry,
  isRetrying = false,
  className
}: {
  error: string | Error
  onRetry?: () => void
  isRetrying?: boolean
  className?: string
}) {
  return (
    <ErrorMessage
      error={error}
      title="加载失败"
      onRetry={onRetry}
      retryText={isRetrying ? "重试中..." : "重试"}
      description="请检查网络连接或稍后再试"
      className={className}
    />
  )
}

// 空状态组件（技术上不是错误，但相关）
export function EmptyState({
  title = "暂无数据",
  description,
  action,
  icon: Icon = Info,
  className
}: {
  title?: string
  description?: string
  action?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium text-muted-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground/75 mb-4 max-w-sm">
          {description}
        </p>
      )}
      {action}
    </div>
  )
}