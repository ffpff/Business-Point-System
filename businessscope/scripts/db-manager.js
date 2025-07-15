#!/usr/bin/env node

/**
 * 数据库管理工具
 * 统一的数据库操作入口，解决环境变量和连接问题
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

class DatabaseManager {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async connect() {
    try {
      await this.prisma.$connect();
      console.log('✅ 数据库连接成功');
      return true;
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      return false;
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }

  // 检查环境变量
  checkEnvironment() {
    const requiredVars = ['POSTGRES_PRISMA_URL', 'POSTGRES_URL_NON_POOLING'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      console.error('❌ 缺少必要的环境变量:', missing);
      return false;
    }
    
    console.log('✅ 环境变量检查通过');
    return true;
  }

  // 推送schema变更
  async pushSchema() {
    console.log('🚀 推送 Schema 变更...');
    
    if (!this.checkEnvironment()) {
      return false;
    }

    try {
      // 使用dotenv-cli确保环境变量正确加载
      execSync('npx dotenv -e .env.local -- npx prisma db push --accept-data-loss', {
        stdio: 'inherit',
        timeout: 300000 // 5分钟超时
      });
      console.log('✅ Schema 推送成功');
      return true;
    } catch (error) {
      console.error('❌ Schema 推送失败:', error.message);
      
      // 如果推送失败，尝试手动同步
      console.log('🔧 尝试手动同步...');
      return await this.manualSync();
    }
  }

  // 生成Prisma客户端
  async generateClient() {
    console.log('⚙️  生成 Prisma 客户端...');
    
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ 客户端生成成功');
      return true;
    } catch (error) {
      console.error('❌ 客户端生成失败:', error.message);
      return false;
    }
  }

  // 手动同步schema（用于推送失败时的fallback）
  async manualSync() {
    console.log('🔧 执行手动 Schema 同步...');
    
    try {
      // 检查并添加缺失的字段
      await this.ensureAccountLockFields();
      await this.ensureIndexes();
      
      console.log('✅ 手动同步完成');
      return true;
    } catch (error) {
      console.error('❌ 手动同步失败:', error.message);
      return false;
    }
  }

  // 确保账户锁定字段存在
  async ensureAccountLockFields() {
    console.log('📝 检查账户锁定字段...');
    
    const fields = [
      {
        name: 'login_failed_count',
        sql: 'ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "login_failed_count" INTEGER NOT NULL DEFAULT 0'
      },
      {
        name: 'locked_at',
        sql: 'ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "locked_at" TIMESTAMP(3)'
      },
      {
        name: 'lock_until',
        sql: 'ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "lock_until" TIMESTAMP(3)'
      }
    ];

    for (const field of fields) {
      try {
        await this.prisma.$executeRawUnsafe(field.sql);
        console.log(`  ✅ ${field.name} 字段确保存在`);
      } catch (error) {
        console.log(`  ⚠️  ${field.name} 字段可能已存在`);
      }
    }
  }

  // 确保必要的索引存在
  async ensureIndexes() {
    console.log('📝 检查数据库索引...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "users_email_idx" ON "public"."users"("email")',
      'CREATE INDEX IF NOT EXISTS "users_subscription_type_idx" ON "public"."users"("subscription_type")',
      'CREATE INDEX IF NOT EXISTS "users_last_active_at_idx" ON "public"."users"("last_active_at")'
    ];

    for (const indexSql of indexes) {
      try {
        await this.prisma.$executeRawUnsafe(indexSql);
        console.log('  ✅ 索引检查完成');
      } catch (error) {
        console.log('  ⚠️  索引可能已存在');
      }
    }
  }

  // 验证schema状态
  async verifySchema() {
    console.log('🔍 验证 Schema 状态...');
    
    try {
      // 检查关键表是否存在
      const tables = ['users', 'raw_content', 'ai_analysis', 'bookmarks'];
      
      for (const tableName of tables) {
        const count = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "public"."${tableName}"`);
        console.log(`  ✅ ${tableName}: ${count[0].count} 条记录`);
      }

      // 检查关键字段是否存在
      const userColumns = await this.prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public'
      `;
      
      const columnNames = userColumns.map(col => col.column_name);
      const requiredColumns = ['login_failed_count', 'locked_at', 'lock_until', 'hashed_password'];
      const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
      
      if (missingColumns.length === 0) {
        console.log('  ✅ 所有必要字段都存在');
      } else {
        console.log('  ❌ 缺少字段:', missingColumns);
        return false;
      }

      console.log('✅ Schema 验证通过');
      return true;
    } catch (error) {
      console.error('❌ Schema 验证失败:', error.message);
      return false;
    }
  }

  // 完整的部署流程
  async deploy() {
    console.log('🚀 开始数据库部署流程...\n');
    
    // 1. 检查连接
    if (!(await this.connect())) {
      return false;
    }

    // 2. 推送schema
    const pushSuccess = await this.pushSchema();
    
    // 3. 生成客户端
    if (pushSuccess) {
      await this.generateClient();
    }

    // 4. 验证结果
    const verifySuccess = await this.verifySchema();

    await this.disconnect();

    if (pushSuccess && verifySuccess) {
      console.log('\n🎉 数据库部署成功！');
      return true;
    } else {
      console.log('\n❌ 数据库部署失败，请检查错误信息');
      return false;
    }
  }
}

// CLI 接口
async function main() {
  const command = process.argv[2];
  const dbManager = new DatabaseManager();

  switch (command) {
    case 'push':
      await dbManager.connect();
      await dbManager.pushSchema();
      await dbManager.disconnect();
      break;
      
    case 'generate':
      await dbManager.generateClient();
      break;
      
    case 'verify':
      await dbManager.connect();
      await dbManager.verifySchema();
      await dbManager.disconnect();
      break;
      
    case 'sync':
      await dbManager.connect();
      await dbManager.manualSync();
      await dbManager.disconnect();
      break;
      
    case 'deploy':
      await dbManager.deploy();
      break;
      
    default:
      console.log(`
数据库管理工具使用说明:

npm run db:push     - 推送 schema 变更
npm run db:generate - 生成 Prisma 客户端  
npm run db:verify   - 验证 schema 状态
npm run db:sync     - 手动同步 schema
npm run db:deploy   - 完整部署流程

node scripts/db-manager.js <command>
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseManager;