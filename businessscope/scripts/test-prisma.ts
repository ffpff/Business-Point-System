import { config } from 'dotenv'
import { testPrismaConnection } from '../src/lib/db'

// 加载环境变量
config({ path: '.env.local' })

async function testPrisma() {
  console.log('🔍 开始测试Prisma连接...\n')

  const result = await testPrismaConnection()
  
  if (result.success) {
    console.log('✅', result.message)
    if (result.result) {
      console.log('查询结果:', result.result)
    }
  } else {
    console.log('❌', result.message)
    process.exit(1)
  }
}

testPrisma().catch((error) => {
  console.error('💥 测试过程中发生错误:', error)
  process.exit(1)
})