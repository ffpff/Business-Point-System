import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// 搜索建议请求验证Schema
const suggestionsQuerySchema = z.object({
  q: z.string().min(1, "搜索关键词不能为空").max(50, "搜索关键词过长"),
  limit: z.string().optional().default("10").transform(Number)
})

// 搜索建议API
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "未认证，请先登录" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const validatedParams = suggestionsQuerySchema.safeParse(queryParams)
    if (!validatedParams.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "请求参数无效",
          details: validatedParams.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { q: query, limit } = validatedParams.data
    
    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        data: { suggestions: [] }
      })
    }

    // 获取搜索建议
    const suggestions = await getSearchSuggestions(query, limit)
    
    return NextResponse.json({
      success: true,
      data: { 
        suggestions,
        query,
        count: suggestions.length
      }
    })

  } catch (error) {
    console.error("搜索建议API错误:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "获取搜索建议失败" 
      },
      { status: 500 }
    )
  }
}

// 获取搜索建议实现
async function getSearchSuggestions(query: string, limit: number = 10) {
  const normalizedQuery = query.toLowerCase().trim()
  
  // 从标题、作者、标签、主题中获取建议
  const [titleSuggestions, authorSuggestions, tagSuggestions, topicSuggestions] = await Promise.all([
    // 标题建议 - 提取关键词
    prisma.rawContent.findMany({
      where: {
        AND: [
          { title: { contains: normalizedQuery, mode: 'insensitive' } },
          { title: { not: null } }
        ]
      },
      select: { title: true },
      take: 8,
      orderBy: { collectedAt: 'desc' }
    }),
    
    // 作者建议
    prisma.rawContent.findMany({
      where: {
        AND: [
          { author: { contains: normalizedQuery, mode: 'insensitive' } },
          { author: { not: null } }
        ]
      },
      select: { author: true },
      take: 5,
      distinct: ['author'],
      orderBy: { collectedAt: 'desc' }
    }),
    
    // 标签建议
    prisma.rawContent.findMany({
      where: {
        AND: [
          { tags: { contains: normalizedQuery, mode: 'insensitive' } },
          { tags: { not: null } }
        ]
      },
      select: { tags: true },
      take: 8,
      orderBy: { collectedAt: 'desc' }
    }),
    
    // 主题建议 (来自AI分析)
    prisma.aIAnalysis.findMany({
      where: {
        AND: [
          { mainTopic: { contains: normalizedQuery, mode: 'insensitive' } },
          { mainTopic: { not: null } }
        ]
      },
      select: { mainTopic: true },
      take: 8,
      distinct: ['mainTopic'],
      orderBy: { createdAt: 'desc' }
    })
  ])

  const suggestions: Array<{
    type: string
    text: string
    category: string
    relevance?: number
  }> = []
  
  // 处理标题建议 - 提取关键短语
  titleSuggestions.forEach(item => {
    if (item.title) {
      // 简单的关键词提取 - 查找包含搜索词的短语
      const words = item.title.split(/[\s\-,\.。，]/g)
      const relevantPhrases = words.filter(word => 
        word.toLowerCase().includes(normalizedQuery) && word.length >= 2
      )
      
      relevantPhrases.forEach(phrase => {
        if (!suggestions.find(s => s.text.toLowerCase() === phrase.toLowerCase())) {
          suggestions.push({
            type: 'keyword',
            text: phrase.trim(),
            category: '关键词',
            relevance: calculateRelevance(phrase, normalizedQuery)
          })
        }
      })
    }
  })
  
  // 处理作者建议
  authorSuggestions.forEach(item => {
    if (item.author && !suggestions.find(s => s.text === item.author)) {
      suggestions.push({
        type: 'author',
        text: item.author,
        category: '作者',
        relevance: calculateRelevance(item.author, normalizedQuery)
      })
    }
  })
  
  // 处理标签建议
  const tagSet = new Set<string>()
  tagSuggestions.forEach(item => {
    if (item.tags) {
      const tags = item.tags.split(',').map(tag => tag.trim())
      tags.forEach(tag => {
        if (tag.toLowerCase().includes(normalizedQuery) && !tagSet.has(tag.toLowerCase())) {
          tagSet.add(tag.toLowerCase())
          suggestions.push({
            type: 'tag',
            text: tag,
            category: '标签',
            relevance: calculateRelevance(tag, normalizedQuery)
          })
        }
      })
    }
  })
  
  // 处理主题建议
  topicSuggestions.forEach(item => {
    if (item.mainTopic && !suggestions.find(s => s.text === item.mainTopic)) {
      suggestions.push({
        type: 'topic',
        text: item.mainTopic,
        category: '主题',
        relevance: calculateRelevance(item.mainTopic, normalizedQuery)
      })
    }
  })
  
  // 按相关性排序并去重
  const uniqueSuggestions = suggestions
    .filter((suggestion, index, self) => 
      index === self.findIndex(s => s.text.toLowerCase() === suggestion.text.toLowerCase())
    )
    .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
    .slice(0, limit)
  
  return uniqueSuggestions
}

// 计算相关性得分 (简单实现)
function calculateRelevance(text: string, query: string): number {
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  
  // 完全匹配得分最高
  if (lowerText === lowerQuery) return 100
  
  // 开头匹配得分较高
  if (lowerText.startsWith(lowerQuery)) return 80
  
  // 包含查询词
  if (lowerText.includes(lowerQuery)) return 60
  
  // 字符相似度计算 (简单版本)
  const similarity = calculateSimpleSimilarity(lowerText, lowerQuery)
  return Math.floor(similarity * 40) // 最大40分
}

// 简单字符相似度计算
function calculateSimpleSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  let matches = 0
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) {
      matches++
    }
  }
  
  return matches / longer.length
}