const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  try {
    console.log('正在测试PostgreSQL数据库连接...');
    console.log(`POSTGRES_URL存在: ${process.env.POSTGRES_URL ? '是' : '否'}`);
    console.log(`SUPABASE_URL存在: ${process.env.SUPABASE_URL ? '是' : '否'}`);
    
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    });

    await client.connect();
    const result = await client.query('SELECT 1 as test, current_database() as db_name, version() as version');
    await client.end();
    
    console.log('✅ 数据库连接成功!');
    console.log('测试查询结果:', result.rows);
  } catch (error) {
    console.error('❌ 数据库连接失败:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();