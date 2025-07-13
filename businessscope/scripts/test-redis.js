const { Redis } = require('@upstash/redis');
const IORedis = require('ioredis');
require('dotenv').config({ path: '.env.local' });

async function testUpstashRedis() {
  console.log('\n=== 测试 Upstash Redis (REST API) ===');
  try {
    console.log(`KV_REST_API_URL存在: ${process.env.KV_REST_API_URL ? '是' : '否'}`);
    console.log(`KV_REST_API_TOKEN存在: ${process.env.KV_REST_API_TOKEN ? '是' : '否'}`);
    
    const redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });

    // 测试基本操作
    await redis.set('test-upstash', 'hello-upstash', { ex: 60 }); // 60秒过期
    const value = await redis.get('test-upstash');
    const ping = await redis.ping();
    await redis.del('test-upstash');
    
    console.log('✅ Upstash Redis 连接成功!');
    console.log(`测试值: ${value}`);
    console.log(`Ping响应: ${ping}`);
    return true;
  } catch (error) {
    console.error('❌ Upstash Redis 连接失败:');
    console.error(error.message);
    return false;
  }
}

async function testIORedis() {
  console.log('\n=== 测试 IORedis (REDIS_URL) ===');
  try {
    console.log(`REDIS_URL存在: ${process.env.REDIS_URL ? '是' : '否'}`);
    
    const redis = new IORedis(process.env.REDIS_URL);
    
    // 测试基本操作
    await redis.set('test-ioredis', 'hello-ioredis', 'EX', 60);
    const value = await redis.get('test-ioredis');
    const info = await redis.info();
    await redis.del('test-ioredis');
    await redis.quit();
    
    console.log('✅ IORedis 连接成功!');
    console.log(`测试值: ${value}`);
    console.log(`Redis信息长度: ${info ? info.length : 0} 字符`);
    return true;
  } catch (error) {
    console.error('❌ IORedis 连接失败:');
    console.error(error.message);
    return false;
  }
}

async function runTests() {
  console.log('开始测试 Redis 连接...\n');
  
  const upstashResult = await testUpstashRedis();
  const ioredisResult = await testIORedis();
  
  console.log('\n=== 测试结果汇总 ===');
  console.log(`Upstash Redis: ${upstashResult ? '✅ 成功' : '❌ 失败'}`);
  console.log(`IORedis: ${ioredisResult ? '✅ 成功' : '❌ 失败'}`);
  
  if (!upstashResult && !ioredisResult) {
    console.error('\n所有Redis连接测试都失败了！');
    process.exit(1);
  }
}

runTests();