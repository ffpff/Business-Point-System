/**
 * Webhook API测试脚本
 * 用于测试 /api/webhooks/n8n 接口的功能
 */

// 测试数据
const testData = {
  platform: 'twitter',
  data: [
    {
      originalUrl: 'https://twitter.com/test/status/123',
      title: '这是一个测试推文标题',
      content: '这是一个测试推文内容，用于验证webhook API功能。包含一些商业相关的关键词如：创业、投资、商机等。',
      author: 'TestUser',
      publishedAt: '2025-01-14T10:00:00Z',
      likesCount: 42,
      sharesCount: 8,
      commentsCount: 15,
      viewCount: 150,
      tags: '创业,投资,商机'
    },
    {
      originalUrl: 'https://twitter.com/test/status/124',
      title: '另一个测试推文',
      content: '这是第二条测试数据，用于测试批量数据处理功能。',
      author: 'TestUser2',
      publishedAt: '2025-01-14T11:00:00Z',
      likesCount: 28,
      sharesCount: 5,
      commentsCount: 12,
      viewCount: 95,
      tags: '测试,API'
    }
  ],
  source: 'test-script',
  timestamp: new Date().toISOString()
}

// 无效数据测试
const invalidData = {
  platform: 'invalid_platform',
  data: [
    {
      originalUrl: 'invalid-url',
      likesCount: -5, // 负数，应该被拒绝
      sharesCount: 'invalid', // 字符串，应该被拒绝
    }
  ],
  timestamp: 'invalid-timestamp'
}

// 空数据测试
const emptyData = {
  platform: 'twitter',
  data: [
    {
      // 没有title和content，应该被过滤
      author: 'EmptyUser',
      likesCount: 0,
      sharesCount: 0,
      commentsCount: 0,
      viewCount: 0
    }
  ],
  timestamp: new Date().toISOString()
}

async function testWebhookAPI() {
  const baseURL = 'http://localhost:3000'
  
  console.log('🚀 开始测试 Webhook API...\n')
  
  // 1. 测试健康检查
  console.log('1. 测试健康检查 GET /api/webhooks/n8n')
  try {
    const response = await fetch(`${baseURL}/api/webhooks/n8n`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    console.log('✅ 健康检查成功:', result)
    console.log('   - 数据库状态:', result.database)
    console.log('   - 安全配置:', result.security)
  } catch (error) {
    console.error('❌ 健康检查失败:', error.message)
  }
  console.log('')
  
  // 2. 测试有效数据
  console.log('2. 测试有效数据 POST /api/webhooks/n8n')
  try {
    const response = await fetch(`${baseURL}/api/webhooks/n8n`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-Source': 'test-script',
        'User-Agent': 'Test-Script/1.0'
      },
      body: JSON.stringify(testData)
    })
    
    const result = await response.json()
    if (result.success) {
      console.log('✅ 有效数据处理成功:', result)
      console.log('   - 接收数据:', result.data.received)
      console.log('   - 处理数据:', result.data.processed)
      console.log('   - 插入数据:', result.data.inserted)
      console.log('   - 处理耗时:', result.data.processingTime + 'ms')
    } else {
      console.error('❌ 有效数据处理失败:', result.error)
    }
  } catch (error) {
    console.error('❌ 有效数据测试异常:', error.message)
  }
  console.log('')
  
  // 3. 测试无效数据
  console.log('3. 测试无效数据验证')
  try {
    const response = await fetch(`${baseURL}/api/webhooks/n8n`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-Source': 'test-script',
        'User-Agent': 'Test-Script/1.0'
      },
      body: JSON.stringify(invalidData)
    })
    
    const result = await response.json()
    if (!result.success) {
      console.log('✅ 无效数据正确被拒绝:', result.error)
      if (result.details) {
        console.log('   - 验证错误详情:', result.details.length + '个错误')
      }
    } else {
      console.error('❌ 无效数据未被拒绝:', result)
    }
  } catch (error) {
    console.error('❌ 无效数据测试异常:', error.message)
  }
  console.log('')
  
  // 4. 测试空内容数据
  console.log('4. 测试空内容数据过滤')
  try {
    const response = await fetch(`${baseURL}/api/webhooks/n8n`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-Source': 'test-script',
        'User-Agent': 'Test-Script/1.0'
      },
      body: JSON.stringify(emptyData)
    })
    
    const result = await response.json()
    if (!result.success && result.error.includes('没有有效的内容数据')) {
      console.log('✅ 空内容数据正确被过滤:', result.error)
    } else {
      console.error('❌ 空内容数据未正确处理:', result)
    }
  } catch (error) {
    console.error('❌ 空内容数据测试异常:', error.message)
  }
  console.log('')
  
  // 5. 测试安全验证
  console.log('5. 测试安全验证')
  try {
    const response = await fetch(`${baseURL}/api/webhooks/n8n`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain', // 错误的Content-Type
      },
      body: JSON.stringify(testData)
    })
    
    const result = await response.json()
    if (!result.success && result.error.includes('application/json')) {
      console.log('✅ Content-Type验证正确工作:', result.error)
    } else {
      console.error('❌ Content-Type验证失败:', result)
    }
  } catch (error) {
    console.error('❌ 安全验证测试异常:', error.message)
  }
  console.log('')
  
  // 6. 测试错误的JSON格式
  console.log('6. 测试错误的JSON格式')
  try {
    const response = await fetch(`${baseURL}/api/webhooks/n8n`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-Source': 'test-script',
        'User-Agent': 'Test-Script/1.0'
      },
      body: 'invalid json content'
    })
    
    const result = await response.json()
    if (!result.success && result.error.includes('JSON格式')) {
      console.log('✅ JSON格式验证正确工作:', result.error)
    } else {
      console.error('❌ JSON格式验证失败:', result)
    }
  } catch (error) {
    console.error('❌ JSON格式测试异常:', error.message)
  }
  
  console.log('\n🎉 Webhook API测试完成！')
}

// 运行测试
if (require.main === module) {
  testWebhookAPI().catch(console.error)
}

module.exports = { testWebhookAPI }