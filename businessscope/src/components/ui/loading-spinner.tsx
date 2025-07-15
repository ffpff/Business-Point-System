import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const spinnerVariants = cva(
  "animate-spin rounded-full border-2 border-current border-t-transparent",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
      variant: {
        default: "text-primary",
        secondary: "text-muted-foreground",
        accent: "text-accent",
        destructive: "text-destructive",
        white: "text-white",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  text?: string
  center?: boolean
}

export function LoadingSpinner({
  className,
  size,
  variant,
  text,
  center = false,
  ...props
}: LoadingSpinnerProps) {
  const containerClasses = cn(
    "flex items-center gap-2",
    center && "justify-center",
    className
  )

  const spinnerClasses = cn(spinnerVariants({ size, variant }))

  return (
    <div className={containerClasses} {...props}>
      <div className={spinnerClasses} />
      {text && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  )
}

export function LoadingOverlay({ 
  children, 
  isLoading, 
  text = "加载中..." 
}: { 
  children: React.ReactNode
  isLoading: boolean
  text?: string 
}) {
  if (!isLoading) return <>{children}</>

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  )
}

export function LoadingButton({
  children,
  isLoading,
  loadingText = "处理中...",
  disabled,
  ...props
}: {
  children: React.ReactNode
  isLoading: boolean
  loadingText?: string
  disabled?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center gap-2",
        props.className
      )}
    >
      {isLoading && <LoadingSpinner size="sm" variant="white" />}
      {isLoading ? loadingText : children}
    </button>
  )
}