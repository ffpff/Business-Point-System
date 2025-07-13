import { config } from 'dotenv'
import { testConnection as testDB } from '../src/lib/db'
import { testRedisConnection, testRedisConnectionAlt } from '../src/lib/redis'

// 加载环境变量
config({ path: '.env.local' })

async function runAllTests() {
  console.log('🔍 开始测试所有数据库连接...\n')

  // 测试PostgreSQL
  console.log('=== PostgreSQL 数据库测试 ===')
  const dbResult = await testDB()
  if (dbResult.success) {
    console.log('✅', dbResult.message)
  } else {
    console.log('❌', dbResult.message)
  }

  console.log('\n=== Redis 连接测试 ===')
  
  // 测试Upstash Redis
  console.log('📡 测试 Upstash Redis (REST API)...')
  const upstashResult = await testRedisConnection()
  if (upstashResult.success) {
    console.log('✅', upstashResult.message, `(值: ${upstashResult.testResult})`)
  } else {
    console.log('❌', upstashResult.message)
  }

  // 测试IORedis
  console.log('🔗 测试 IORedis (TCP)...')
  const ioredisResult = await testRedisConnectionAlt()
  if (ioredisResult.success) {
    console.log('✅', ioredisResult.message, `(值: ${ioredisResult.testResult})`)
  } else {
    console.log('❌', ioredisResult.message)
  }

  // 总结
  console.log('\n=== 测试结果汇总 ===')
  const allSuccess = dbResult.success && (upstashResult.success || ioredisResult.success)
  console.log(`PostgreSQL: ${dbResult.success ? '✅ 成功' : '❌ 失败'}`)
  console.log(`Upstash Redis: ${upstashResult.success ? '✅ 成功' : '❌ 失败'}`)
  console.log(`IORedis: ${ioredisResult.success ? '✅ 成功' : '❌ 失败'}`)
  console.log(`\n总体状态: ${allSuccess ? '🎉 所有连接正常' : '⚠️ 部分连接失败'}`)

  if (!allSuccess) {
    process.exit(1)
  }
}

runAllTests().catch((error) => {
  console.error('💥 测试过程中发生错误:', error)
  process.exit(1)
})