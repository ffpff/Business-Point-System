#!/usr/bin/env node

/**
 * Schema 管理工具
 * 提供schema比较、同步、备份等高级功能
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

class SchemaManager {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async connect() {
    await this.prisma.$connect();
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }

  // 获取当前数据库的schema信息
  async getCurrentSchema() {
    const tables = await this.prisma.$queryRaw`
      SELECT 
        t.table_name,
        json_agg(
          json_build_object(
            'column_name', c.column_name,
            'data_type', c.data_type,
            'is_nullable', c.is_nullable,
            'column_default', c.column_default
          ) ORDER BY c.ordinal_position
        ) as columns
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c 
        ON t.table_name = c.table_name 
        AND t.table_schema = c.table_schema
      WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
      GROUP BY t.table_name
      ORDER BY t.table_name;
    `;

    return tables;
  }

  // 生成schema快照
  async generateSnapshot() {
    console.log('📸 生成 Schema 快照...');
    
    const schema = await this.getCurrentSchema();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `schema-snapshot-${timestamp}.json`;
    const filepath = path.join(__dirname, '..', 'snapshots', filename);

    // 确保snapshots目录存在
    const snapshotsDir = path.dirname(filepath);
    if (!fs.existsSync(snapshotsDir)) {
      fs.mkdirSync(snapshotsDir, { recursive: true });
    }

    fs.writeFileSync(filepath, JSON.stringify(schema, null, 2));
    console.log(`✅ Schema 快照已保存: ${filename}`);
    
    return filepath;
  }

  // 比较schema差异
  async compareWithPrismaSchema() {
    console.log('🔍 比较当前数据库与 Prisma Schema...');
    
    const currentSchema = await this.getCurrentSchema();
    
    // 解析Prisma schema文件（简化版，实际应该用Prisma的API）
    const expectedTables = [
      {
        name: 'users',
        requiredColumns: [
          'id', 'email', 'name', 'image', 'hashed_password',
          'subscription_type', 'daily_usage_count', 'monthly_usage_count',
          'usage_limit', 'last_active_at', 'login_failed_count', 
          'locked_at', 'lock_until', 'created_at', 'updated_at'
        ]
      },
      {
        name: 'raw_content',
        requiredColumns: [
          'id', 'platform', 'original_url', 'title', 'content',
          'author', 'published_at', 'collected_at', 'likes_count',
          'shares_count', 'comments_count', 'view_count', 'tags',
          'status', 'created_at', 'updated_at'
        ]
      },
      {
        name: 'ai_analysis',
        requiredColumns: [
          'id', 'content_id', 'sentiment_label', 'sentiment_score',
          'main_topic', 'keywords', 'business_rate', 'content_rate',
          'final_rate', 'reason', 'confidence', 'analyzed_at',
          'created_at', 'updated_at'
        ]
      }
    ];

    const issues = [];

    for (const expectedTable of expectedTables) {
      const currentTable = currentSchema.find(t => t.table_name === expectedTable.name);
      
      if (!currentTable) {
        issues.push({
          type: 'missing_table',
          table: expectedTable.name,
          message: `表 ${expectedTable.name} 不存在`
        });
        continue;
      }

      const currentColumns = currentTable.columns.map(c => c.column_name);
      const missingColumns = expectedTable.requiredColumns.filter(
        col => !currentColumns.includes(col)
      );

      if (missingColumns.length > 0) {
        issues.push({
          type: 'missing_columns',
          table: expectedTable.name,
          columns: missingColumns,
          message: `表 ${expectedTable.name} 缺少字段: ${missingColumns.join(', ')}`
        });
      }
    }

    if (issues.length === 0) {
      console.log('✅ Schema 完全匹配');
    } else {
      console.log('❌ 发现 Schema 差异:');
      issues.forEach(issue => {
        console.log(`  - ${issue.message}`);
      });
    }

    return issues;
  }

  // 自动修复schema差异
  async autoFixSchema() {
    console.log('🔧 自动修复 Schema 差异...');
    
    const issues = await this.compareWithPrismaSchema();
    let fixedCount = 0;

    for (const issue of issues) {
      try {
        if (issue.type === 'missing_columns' && issue.table === 'users') {
          for (const column of issue.columns) {
            const sql = this.generateAddColumnSQL('users', column);
            if (sql) {
              await this.prisma.$executeRawUnsafe(sql);
              console.log(`  ✅ 添加字段: users.${column}`);
              fixedCount++;
            }
          }
        }
      } catch (error) {
        console.log(`  ❌ 修复失败: ${issue.message} - ${error.message}`);
      }
    }

    console.log(`🎉 修复完成，共修复 ${fixedCount} 个问题`);
    return fixedCount;
  }

  // 生成添加列的SQL
  generateAddColumnSQL(tableName, columnName) {
    const columnDefinitions = {
      'login_failed_count': 'INTEGER NOT NULL DEFAULT 0',
      'locked_at': 'TIMESTAMP(3)',
      'lock_until': 'TIMESTAMP(3)',
      'hashed_password': 'TEXT',
      'subscription_type': 'TEXT NOT NULL DEFAULT \'free\'',
      'daily_usage_count': 'INTEGER NOT NULL DEFAULT 0',
      'monthly_usage_count': 'INTEGER NOT NULL DEFAULT 0',
      'usage_limit': 'INTEGER NOT NULL DEFAULT 1000',
      'last_active_at': 'TIMESTAMP(3)',
      'created_at': 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
      'updated_at': 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP'
    };

    const definition = columnDefinitions[columnName];
    if (!definition) {
      console.log(`  ⚠️  未知字段定义: ${columnName}`);
      return null;
    }

    return `ALTER TABLE "public"."${tableName}" ADD COLUMN IF NOT EXISTS "${columnName}" ${definition}`;
  }

  // 健康检查
  async healthCheck() {
    console.log('🏥 执行数据库健康检查...');
    
    const checks = [];

    try {
      // 1. 连接检查
      await this.prisma.$queryRaw`SELECT 1`;
      checks.push({ name: '数据库连接', status: 'pass' });
    } catch (error) {
      checks.push({ name: '数据库连接', status: 'fail', error: error.message });
    }

    try {
      // 2. 表存在检查
      const tables = ['users', 'raw_content', 'ai_analysis', 'bookmarks'];
      for (const table of tables) {
        await this.prisma.$queryRawUnsafe(`SELECT 1 FROM "public"."${table}" LIMIT 1`);
      }
      checks.push({ name: '核心表存在性', status: 'pass' });
    } catch (error) {
      checks.push({ name: '核心表存在性', status: 'fail', error: error.message });
    }

    try {
      // 3. Schema一致性检查
      const issues = await this.compareWithPrismaSchema();
      if (issues.length === 0) {
        checks.push({ name: 'Schema一致性', status: 'pass' });
      } else {
        checks.push({ name: 'Schema一致性', status: 'fail', error: `${issues.length}个问题` });
      }
    } catch (error) {
      checks.push({ name: 'Schema一致性', status: 'fail', error: error.message });
    }

    // 输出结果
    console.log('\n📋 健康检查结果:');
    checks.forEach(check => {
      const icon = check.status === 'pass' ? '✅' : '❌';
      const error = check.error ? ` (${check.error})` : '';
      console.log(`  ${icon} ${check.name}${error}`);
    });

    const allPassed = checks.every(check => check.status === 'pass');
    console.log(`\n📊 总体状态: ${allPassed ? '✅ 健康' : '❌ 需要注意'}`);

    return checks;
  }
}

// CLI 接口
async function main() {
  const command = process.argv[2];
  const schemaManager = new SchemaManager();

  await schemaManager.connect();

  try {
    switch (command) {
      case 'snapshot':
        await schemaManager.generateSnapshot();
        break;
        
      case 'compare':
        await schemaManager.compareWithPrismaSchema();
        break;
        
      case 'fix':
        await schemaManager.autoFixSchema();
        break;
        
      case 'health':
        await schemaManager.healthCheck();
        break;
        
      default:
        console.log(`
Schema 管理工具使用说明:

node scripts/schema-manager.js snapshot  - 生成 schema 快照
node scripts/schema-manager.js compare   - 比较 schema 差异
node scripts/schema-manager.js fix       - 自动修复 schema
node scripts/schema-manager.js health    - 健康检查
        `);
    }
  } finally {
    await schemaManager.disconnect();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SchemaManager;