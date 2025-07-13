import { Redis } from '@upstash/redis';

export async function testRedisConnection() {
  try {
    const redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });

    // 测试基本操作
    await redis.set('test-key', 'test-value');
    const value = await redis.get('test-key');
    await redis.del('test-key');

    return { 
      success: true, 
      message: 'Redis连接成功',
      testResult: value 
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Redis连接失败: ${error instanceof Error ? error.message : '未知错误'}` 
    };
  }
}

// 备用方案：使用REDIS_URL的ioredis连接
export async function testRedisConnectionAlt() {
  try {
    const { default: Redis } = await import('ioredis');
    const redis = new Redis(process.env.REDIS_URL!);

    await redis.set('test-key', 'test-value');
    const value = await redis.get('test-key');
    await redis.del('test-key');
    await redis.quit();

    return { 
      success: true, 
      message: 'Redis(ioredis)连接成功',
      testResult: value 
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Redis(ioredis)连接失败: ${error instanceof Error ? error.message : '未知错误'}` 
    };
  }
}