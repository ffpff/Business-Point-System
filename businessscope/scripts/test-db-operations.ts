#!/usr/bin/env tsx

/**
 * 数据库操作功能测试脚本
 * 测试新增的DatabaseService类中的各种方法
 */

// 加载环境变量
import { config } from 'dotenv'
import { resolve } from 'path'

// 加载 .env.local 文件
config({ path: resolve(process.cwd(), '.env.local') })

import { DatabaseService, prisma } from '../src/lib/db'

async function testDatabaseOperations() {
  console.log('🧪 开始测试数据库操作功能...\n')

  try {
    // 1. 测试健康检查
    console.log('1️⃣ 测试数据库健康检查...')
    const healthResult = await DatabaseService.healthCheck()
    console.log(`   结果: ${healthResult.healthy ? '✅' : '❌'} ${healthResult.message}`)

    // 2. 测试获取机会列表（分页）
    console.log('\n2️⃣ 测试获取机会列表...')
    const opportunities = await DatabaseService.getOpportunities({
      page: 1,
      limit: 5
    })
    console.log(`   获取到 ${opportunities.opportunities.length} 条记录，总计 ${opportunities.total} 条`)
    console.log(`   总页数: ${opportunities.totalPages}`)

    // 3. 测试平台统计
    console.log('\n3️⃣ 测试平台分布统计...')
    const platformStats = await DatabaseService.getPlatformStats()
    console.log(`   平台统计:`, platformStats)

    // 4. 测试评分分布统计
    console.log('\n4️⃣ 测试评分分布统计...')
    const rateStats = await DatabaseService.getRateDistribution()
    console.log(`   评分统计:`, rateStats)

    // 5. 测试仪表板统计
    console.log('\n5️⃣ 测试仪表板统计...')
    const dashboardStats = await DatabaseService.getDashboardStats()
    console.log(`   仪表板统计:`, dashboardStats)

    // 6. 测试获取待分析内容
    console.log('\n6️⃣ 测试获取待分析内容...')
    const pendingContent = await DatabaseService.getPendingContent(3)
    console.log(`   待分析内容数量: ${pendingContent.length}`)

    // 7. 测试筛选功能
    console.log('\n7️⃣ 测试筛选功能...')
    const filteredOpportunities = await DatabaseService.getOpportunities({
      page: 1,
      limit: 3,
      filters: {
        hasAnalysis: false  // 筛选未分析的内容
      }
    })
    console.log(`   未分析内容数量: ${filteredOpportunities.opportunities.length}`)

    // 8. 如果有数据，测试获取单个机会详情
    if (opportunities.opportunities.length > 0) {
      console.log('\n8️⃣ 测试获取单个机会详情...')
      const firstOpportunity = opportunities.opportunities[0]
      const opportunityDetail = await DatabaseService.getOpportunityById(firstOpportunity.id)
      console.log(`   获取详情成功: ${opportunityDetail ? '✅' : '❌'}`)
      if (opportunityDetail) {
        console.log(`   标题: ${opportunityDetail.title || '无标题'}`)
        console.log(`   平台: ${opportunityDetail.platform}`)
        console.log(`   是否有分析: ${opportunityDetail.analysis ? '是' : '否'}`)
      }
    }

    console.log('\n✅ 数据库操作功能测试完成！')

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行测试
testDatabaseOperations()