import { z } from 'zod'

// 基础验证schemas
export const platformSchema = z.enum(['twitter', 'reddit', 'hackernews', 'producthunt'] as const)
export const contentStatusSchema = z.enum(['待处理', '已分析', '已忽略', '已删除'] as const)
export const finalRateSchema = z.enum(['A', 'B', 'C', 'D'] as const)
export const subscriptionTypeSchema = z.enum(['free', 'professional', 'enterprise'] as const)
export const sentimentLabelSchema = z.enum(['positive', 'negative', 'neutral'] as const)

// 用户认证相关schemas
export const signInSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位字符').max(50, '密码不能超过50位字符'),
})

export const signUpSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string()
    .min(6, '密码至少6位字符')
    .max(50, '密码不能超过50位字符')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字'),
  confirmPassword: z.string(),
  name: z.string().min(2, '姓名至少2个字符').max(50, '姓名不能超过50个字符').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '密码确认不匹配',
  path: ['confirmPassword'],
})

export const resetPasswordSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
})

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, '请输入当前密码'),
  newPassword: z.string()
    .min(6, '新密码至少6位字符')
    .max(50, '新密码不能超过50位字符')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '新密码必须包含大小写字母和数字'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '新密码确认不匹配',
  path: ['confirmPassword'],
})

// 用户资料schemas
export const updateProfileSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符').max(50, '姓名不能超过50个字符').optional(),
  email: z.string().email('请输入有效的邮箱地址'),
})

// 原始内容schemas
export const rawContentSchema = z.object({
  id: z.string().cuid('无效的ID格式'),
  platform: platformSchema,
  originalUrl: z.string().url('无效的URL格式').optional(),
  title: z.string().max(500, '标题不能超过500个字符').optional(),
  content: z.string().max(10000, '内容不能超过10000个字符').optional(),
  author: z.string().max(100, '作者名不能超过100个字符').optional(),
  publishedAt: z.date().optional(),
  collectedAt: z.date(),
  likesCount: z.number().int().min(0, '点赞数不能为负数'),
  sharesCount: z.number().int().min(0, '分享数不能为负数'),
  commentsCount: z.number().int().min(0, '评论数不能为负数'),
  viewCount: z.number().int().min(0, '浏览数不能为负数'),
  tags: z.string().max(1000, '标签不能超过1000个字符').optional(),
  status: contentStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

// AI分析结果schemas
export const aiAnalysisSchema = z.object({
  id: z.string().cuid('无效的ID格式'),
  contentId: z.string().cuid('无效的内容ID格式'),
  sentimentLabel: sentimentLabelSchema.optional(),
  sentimentScore: z.number().min(0).max(1, '情感评分必须在0-1之间').optional(),
  mainTopic: z.string().max(200, '主题不能超过200个字符').optional(),
  keywords: z.array(z.string().max(50, '关键词不能超过50个字符')).optional(),
  businessRate: z.number().int().min(0).max(100, '商业评分必须在0-100之间').optional(),
  contentRate: z.number().int().min(0).max(100, '内容评分必须在0-100之间').optional(),
  finalRate: finalRateSchema.optional(),
  reason: z.string().max(1000, '理由不能超过1000个字符').optional(),
  confidence: z.number().min(0).max(1, '置信度必须在0-1之间').optional(),
  analyzedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// 搜索和筛选schemas
export const searchParamsSchema = z.object({
  q: z.string().max(200, '搜索词不能超过200个字符').optional(),
  platform: z.array(platformSchema).optional(),
  finalRate: z.array(finalRateSchema).optional(),
  sentimentLabel: z.array(sentimentLabelSchema).optional(),
  minScore: z.number().int().min(0).max(100).optional(),
  maxScore: z.number().int().min(0).max(100).optional(),
  dateStart: z.string().datetime().optional(),
  dateEnd: z.string().datetime().optional(),
  tags: z.array(z.string().max(50)).optional(),
  hasAnalysis: z.boolean().optional(),
  page: z.number().int().min(1, '页码必须大于0').default(1),
  limit: z.number().int().min(1).max(100, '每页最多100条记录').default(20),
})

// 收藏schemas
export const bookmarkSchema = z.object({
  contentId: z.string().cuid('无效的内容ID格式'),
  notes: z.string().max(500, '备注不能超过500个字符').optional(),
})

export const updateBookmarkSchema = z.object({
  notes: z.string().max(500, '备注不能超过500个字符').optional(),
})

// Webhook数据schemas
export const webhookDataSchema = z.object({
  platform: platformSchema,
  data: z.array(z.object({
    originalUrl: z.string().url().optional(),
    title: z.string().optional(),
    content: z.string().optional(),
    author: z.string().optional(),
    publishedAt: z.string().datetime().optional(),
    likesCount: z.number().int().min(0).default(0),
    sharesCount: z.number().int().min(0).default(0),
    commentsCount: z.number().int().min(0).default(0),
    viewCount: z.number().int().min(0).default(0),
    tags: z.string().optional(),
  })),
  source: z.string().optional(),
  timestamp: z.string().datetime(),
})

// 导出类型
export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
export type SearchParams = z.infer<typeof searchParamsSchema>
export type BookmarkFormData = z.infer<typeof bookmarkSchema>
export type UpdateBookmarkFormData = z.infer<typeof updateBookmarkSchema>
export type WebhookData = z.infer<typeof webhookDataSchema>