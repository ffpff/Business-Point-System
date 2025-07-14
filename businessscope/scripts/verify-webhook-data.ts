import { DatabaseService } from '../src/lib/db'

async function verifyWebhookData() {
  try {
    console.log('🔍 验证Webhook数据插入情况...\n')
    
    // 1. 获取最新数据
    const result = await DatabaseService.getOpportunities({ page: 1, limit: 10 })
    
    console.log('📊 数据库状态:')
    console.log(`- 总数据量: ${result.total}`)
    console.log(`- 当前页数据: ${result.opportunities.length}`)
    console.log('')
    
    // 2. 显示最新的几条数据
    if (result.opportunities.length > 0) {
      console.log('📝 最新数据（前5条）:')
      result.opportunities.slice(0, 5).forEach((item: any, index: number) => {
        console.log(`  ${index + 1}. 平台: ${item.platform}`)
        console.log(`     标题: ${item.title || '无标题'}`)
        console.log(`     作者: ${item.author || '无作者'}`)
        console.log(`     收集时间: ${item.collectedAt.toLocaleString()}`)
        console.log(`     点赞数: ${item.likesCount}, 分享数: ${item.sharesCount}`)
        console.log(`     状态: ${item.status}`)
        console.log('')
      })
    } else {
      console.log('📝 暂无数据')
    }
    
    // 3. 按平台统计
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30) // 30 days ago
    const endDate = new Date()
    const platformStats = await DatabaseService.getPlatformStats({ startDate, endDate })
    console.log('📈 平台统计:')
    Object.entries(platformStats).forEach(([platform, count]) => {
      console.log(`- ${platform}: ${count} 条`)
    })
    console.log('')
    
    // 4. 健康检查
    const healthCheck = await DatabaseService.healthCheck()
    console.log('💓 数据库健康状态:', healthCheck.healthy ? '✅ 正常' : '❌ 异常')
    if (!healthCheck.healthy) {
      console.log('错误信息:', healthCheck.message)
    }
    
  } catch (error) {
    console.error('❌ 验证失败:', error)
  }
}

verifyWebhookData()