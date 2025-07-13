import { Client } from 'pg';

export async function testConnection() {
  try {
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    });

    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    return { success: true, message: '数据库连接成功' };
  } catch (error) {
    return { 
      success: false, 
      message: `数据库连接失败: ${error instanceof Error ? error.message : '未知错误'}` 
    };
  }
}