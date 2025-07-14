#!/usr/bin/env tsx

/**
 * 测试数据创建功能
 * 创建一些测试数据来验证数据库操作
 */

// 加载环境变量
import { config } from 'dotenv'
import { resolve } from 'path'

// 加载 .env.local 文件
config({ path: resolve(process.cwd(), '.env.local') })

import { DatabaseService, prisma } from '../src/lib/db'
import type { RawContent, AIAnalysis } from '../src/types'

async function createTestData() {
  console.log('🧪 开始创建测试数据...\n')

  try {
    // 1. 创建测试用户
    console.log('1️⃣ 创建测试用户...')
    const testUser = await DatabaseService.createUser({
      email: 'test@example.com',
      name: 'Test User',
      subscriptionType: 'free',
      dailyUsageCount: 0,
      monthlyUsageCount: 0,
      usageLimit: 10
    })
    console.log(`   ✅ 创建用户成功: ${testUser.name} (${testUser.email})`)

    // 2. 创建测试原始内容
    console.log('\n2️⃣ 创建测试原始内容...')
    const testContent1 = await DatabaseService.createRawContent({
      platform: 'twitter',
      originalUrl: 'https://twitter.com/example/status/123',
      title: '新的AI工具发布，改变创业游戏规则',
      content: '🚀 我们刚刚发布了一个革命性的AI工具，可以帮助创业者快速分析市场机会。这个工具已经帮助100+创业者找到了他们的下一个大机会！#AI #创业 #工具',
      author: '@TechFounder',
      publishedAt: new Date('2024-01-15'),
      collectedAt: new Date(),
      likesCount: 156,
      sharesCount: 23,
      commentsCount: 45,
      viewCount: 2340,
      tags: 'AI,创业,工具',
      status: '待处理'
    })

    const testContent2 = await DatabaseService.createRawContent({
      platform: 'reddit',
      originalUrl: 'https://reddit.com/r/startups/comments/example',
      title: '如何在30天内验证你的商业想法',
      content: '分享一个我用来快速验证商业想法的框架。这个方法帮我在30天内就确定了产品方向，节省了数月的开发时间。',
      author: 'startup_guru',
      publishedAt: new Date('2024-01-16'),
      collectedAt: new Date(),
      likesCount: 89,
      sharesCount: 12,
      commentsCount: 34,
      viewCount: 1205,
      tags: '创业,验证,方法论',
      status: '待处理'
    })

    console.log(`   ✅ 创建内容1成功: ${testContent1.title}`)
    console.log(`   ✅ 创建内容2成功: ${testContent2.title}`)

    // 3. 为第一个内容创建AI分析
    console.log('\n3️⃣ 创建AI分析结果...')
    const aiAnalysis = await DatabaseService.createAIAnalysis({
      contentId: testContent1.id,
      sentimentLabel: 'positive',
      sentimentScore: 0.85,
      mainTopic: 'AI工具发布',
      keywords: ['AI', '创业', '工具', '机会分析'],
      businessRate: 88,
      contentRate: 92,
      finalRate: 'A',
      reason: '这是一个高质量的AI工具发布信息，具有很强的商业价值。内容提到了具体的用户数量和成功案例，非常适合创业者关注。',
      confidence: 0.91,
      analyzedAt: new Date()
    })
    console.log(`   ✅ 创建AI分析成功，评分: ${aiAnalysis.finalRate} (商业价值: ${aiAnalysis.businessRate})`)

    // 4. 更新第一个内容的状态
    console.log('\n4️⃣ 更新内容状态...')
    await DatabaseService.updateContentStatus(testContent1.id, '已分析')
    console.log(`   ✅ 内容状态更新为: 已分析`)

    // 5. 添加收藏
    console.log('\n5️⃣ 添加收藏...')
    const bookmark = await DatabaseService.addBookmark(
      testUser.id, 
      testContent1.id, 
      '这个AI工具看起来很有前景，值得深入研究'
    )
    console.log(`   ✅ 添加收藏成功`)

    // 6. 批量创建更多内容
    console.log('\n6️⃣ 批量创建更多测试内容...')
    const batchData = [
      {
        platform: 'hackernews' as const,
        originalUrl: 'https://news.ycombinator.com/item?id=123',
        title: 'Show HN: 我用React构建的SaaS项目月收入达到$10K',
        content: '经过8个月的开发，我的SaaS项目终于达到了月收入$10K的里程碑。分享一些经验和数据。',
        author: 'hnuser123',
        publishedAt: new Date('2024-01-17'),
        collectedAt: new Date(),
        likesCount: 234,
        sharesCount: 45,
        commentsCount: 87,
        viewCount: 5670,
        tags: 'SaaS,React,收入',
        status: '待处理' as const
      },
      {
        platform: 'producthunt' as const,
        originalUrl: 'https://producthunt.com/products/example',
        title: 'NoCode Database - 无代码数据库解决方案',
        content: '为非技术人员设计的数据库工具，拖拽即可创建复杂的数据结构。已有1000+用户使用。',
        author: 'nocode_maker',
        publishedAt: new Date('2024-01-18'),
        collectedAt: new Date(),
        likesCount: 156,
        sharesCount: 28,
        commentsCount: 52,
        viewCount: 3450,
        tags: 'NoCode,数据库,工具',
        status: '待处理' as const
      }
    ]

    const batchResult = await DatabaseService.createManyRawContent(batchData)
    console.log(`   ✅ 批量创建成功，创建了 ${batchResult.count} 条记录`)

    console.log('\n✅ 测试数据创建完成！')

    // 7. 验证数据
    console.log('\n7️⃣ 验证创建的数据...')
    const stats = await DatabaseService.getDashboardStats(testUser.id)
    console.log(`   总机会数: ${stats.totalOpportunities}`)
    console.log(`   已分析数: ${stats.analyzedOpportunities}`)
    console.log(`   收藏数: ${stats.bookmarkedOpportunities}`)
    console.log(`   平均评分: ${stats.averageScore}`)

    const platformStats = await DatabaseService.getPlatformStats()
    console.log(`   平台分布:`, platformStats)

  } catch (error) {
    console.error('❌ 创建测试数据时出现错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行测试
createTestData()