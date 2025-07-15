require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function addLockFields() {
  const prisma = new PrismaClient();
  
  try {
    console.log('正在添加账户锁定字段...');
    
    // 添加登录失败计数字段
    await prisma.$executeRaw`
      ALTER TABLE "public"."users" 
      ADD COLUMN IF NOT EXISTS "login_failed_count" INTEGER NOT NULL DEFAULT 0;
    `;
    console.log('✅ 添加 login_failed_count 字段');
    
    // 添加锁定时间字段
    await prisma.$executeRaw`
      ALTER TABLE "public"."users" 
      ADD COLUMN IF NOT EXISTS "locked_at" TIMESTAMP(3);
    `;
    console.log('✅ 添加 locked_at 字段');
    
    // 添加锁定结束时间字段
    await prisma.$executeRaw`
      ALTER TABLE "public"."users" 
      ADD COLUMN IF NOT EXISTS "lock_until" TIMESTAMP(3);
    `;
    console.log('✅ 添加 lock_until 字段');
    
    // 验证字段是否添加成功
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
      AND column_name IN ('login_failed_count', 'locked_at', 'lock_until')
      ORDER BY column_name;
    `;
    
    console.log('\n📋 新添加的字段:');
    console.table(columns);
    
    console.log('\n🎉 账户锁定字段添加完成！');
    
  } catch (error) {
    console.error('❌ 添加字段失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addLockFields();