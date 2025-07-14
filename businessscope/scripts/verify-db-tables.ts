import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyDatabaseTables() {
  try {
    console.log('🔍 验证数据库表结构...')
    
    // 测试连接
    await prisma.$connect()
    console.log('✅ 数据库连接成功')
    
    // 获取所有表名
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `
    
    console.log('\n📊 已创建的表:', tables)
    
    // 验证关键表是否存在
    const expectedTables = [
      'raw_content',
      'ai_analysis', 
      'users',
      'accounts',
      'sessions',
      'verification_tokens',
      'bookmarks',
      'user_activities',
      'system_configs'
    ]
    
    console.log('\n🎯 验证核心表是否存在:')
    for (const table of expectedTables) {
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${table}
        );
      `
      console.log(`  ${table}: ${(tableExists as any)[0].exists ? '✅' : '❌'}`)
    }
    
    // 测试基本查询操作
    console.log('\n🧪 测试基本查询操作:')
    
    // 查询RawContent表（应该为空）
    const contentCount = await prisma.rawContent.count()
    console.log(`  raw_content 表记录数: ${contentCount}`)
    
    // 查询User表（应该为空）
    const userCount = await prisma.user.count()
    console.log(`  users 表记录数: ${userCount}`)
    
    console.log('\n🎉 数据库表结构验证完成！')
    
  } catch (error) {
    console.error('❌ 数据库验证失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 执行验证
verifyDatabaseTables()
  .then(() => {
    console.log('\n✨ 验证成功完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 验证失败:', error.message)
    process.exit(1)
  })