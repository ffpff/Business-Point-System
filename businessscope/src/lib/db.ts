import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 原有的pg连接测试函数保留
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

// Prisma连接测试函数
export async function testPrismaConnection() {
  try {
    await prisma.$connect()
    const result = await prisma.$queryRaw`SELECT 1 as test`
    await prisma.$disconnect()
    return { 
      success: true, 
      message: 'Prisma数据库连接成功',
      result 
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Prisma连接失败: ${error instanceof Error ? error.message : '未知错误'}` 
    };
  }
}