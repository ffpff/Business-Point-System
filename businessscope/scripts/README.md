# Scripts 目录功能文档

## 📋 脚本分类与功能说明

### 🗂️ 数据库管理类 (保留 - 核心工具)

#### `db-manager.js` ⭐ 主力工具
**功能**: 统一的数据库操作入口，解决环境变量和连接问题
**使用方式**: 
```bash
npm run db:push      # 推送schema变更
npm run db:generate  # 生成Prisma客户端
npm run db:verify    # 验证schema状态
npm run db:sync      # 手动同步schema
npm run db:deploy    # 完整部署流程
```
**特点**:
- 智能fallback机制（推送失败时自动手动同步）
- 完整的部署流程验证
- 环境变量自动加载

#### `schema-manager.js` ⭐ Schema管理专家
**功能**: 提供schema比较、同步、备份等高级功能
**使用方式**:
```bash
node scripts/schema-manager.js snapshot  # 生成schema快照
node scripts/schema-manager.js compare   # 比较schema差异
node scripts/schema-manager.js fix       # 自动修复schema
node scripts/schema-manager.js health    # 数据库健康检查
```
**特点**:
- Schema版本管理和快照
- 自动差异检测和修复
- 数据库健康检查

#### `add-lock-fields.js` (单次使用，已完成)
**功能**: 添加用户账户锁定相关字段
**字段**: login_failed_count, locked_at, lock_until
**状态**: 已执行完成，无需再次运行

---

### 🧪 连接测试类

#### `test-connections.ts` ⭐ 推荐使用
**功能**: 全面测试PostgreSQL和Redis连接
**测试内容**:
- PostgreSQL数据库连接和基本操作
- Upstash Redis (REST API) 连接测试
- IORedis (TCP) 连接测试
**使用**: `npm run test:connections`

#### 🗑️ 建议删除的重复脚本:
- `test-db-connection.js` - 功能被`test-connections.ts`覆盖
- `test-db.js` - 使用原生pg客户端，过时
- `test-prisma.ts` - 功能重复
- `test-redis.js` - 功能重复

---

### 🔍 验证检查类

#### `verify-db-tables.ts` ⭐ 保留
**功能**: 验证数据库表结构完整性
**检查内容**:
- 核心表是否存在 (raw_content, ai_analysis, users等)
- 基本查询操作测试
**使用**: 手动运行 `tsx scripts/verify-db-tables.ts`

#### `final-verification.js` ⭐ 保留
**功能**: 认证系统安全性最终验证
**验证内容**:
- 用户表结构完整性
- 安全字段存在性
- 认证系统功能清单确认
**使用**: `node scripts/final-verification.js`

#### 🗑️ 建议删除的重复脚本:
- `check-tables.js` - 功能已被`schema-manager.js`覆盖
- `check-user-table.js` - 过于具体，功能重复

---

### 🎯 功能测试类 (全部保留)

#### `test-db-operations.ts` ⭐ 核心功能测试
**功能**: 测试DatabaseService类中的各种方法
**测试内容**:
- 数据库健康检查
- 机会列表获取和分页
- 平台统计和评分分布
- 仪表板统计
- 筛选功能
**使用**: `npm run test:db`

#### `test-create-data.ts` ⭐ 测试数据生成
**功能**: 创建测试数据来验证数据库操作
**创建内容**:
- 测试用户
- 测试原始内容 (Twitter, Reddit, HackerNews, ProductHunt)
- AI分析结果
- 用户收藏
**使用**: 手动运行 `tsx scripts/test-create-data.ts`

#### `test-webhook.js` ⭐ API功能测试
**功能**: 测试 /api/webhooks/n8n 接口功能
**测试场景**:
- 健康检查
- 有效数据处理
- 无效数据验证
- 安全验证
- JSON格式验证
**使用**: `node scripts/test-webhook.js`

#### `verify-webhook-data.ts` ⭐ 数据验证
**功能**: 验证Webhook数据插入情况
**验证内容**:
- 数据插入状态
- 平台数据分布
- 数据库健康状态
**使用**: `tsx scripts/verify-webhook-data.ts`

---

## ✅ 清理完成状态

### 已删除的重复脚本 (2025-01-15):
1. `test-db-connection.js` ❌ 删除
2. `test-db.js` ❌ 删除
3. `test-prisma.ts` ❌ 删除
4. `test-redis.js` ❌ 删除
5. `check-tables.js` ❌ 删除
6. `check-user-table.js` ❌ 删除

### 当前活跃脚本 (9个):
1. `db-manager.js` ⭐ 数据库管理核心
2. `schema-manager.js` ⭐ Schema管理专家
3. `test-connections.ts` ⭐ 连接测试
4. `verify-db-tables.ts` ⭐ 表结构验证
5. `final-verification.js` ⭐ 最终验证
6. `test-db-operations.ts` ⭐ 功能测试
7. `test-create-data.ts` ⭐ 测试数据生成
8. `test-webhook.js` ⭐ API测试
9. `verify-webhook-data.ts` ⭐ 数据验证

### 归档文件:
- `archive/add-lock-fields.js` - 历史数据库更新脚本

### 优化建议:
1. **统一技术栈**: 新脚本优先使用TypeScript
2. **命名规范**: 采用动词+名词的命名方式
3. **功能合并**: 将相似功能的脚本合并
4. **文档完善**: 每个脚本添加详细的使用说明

---

## 📝 使用最佳实践

1. **开发环境设置**: 先运行 `npm run test:connections` 确保连接正常
2. **Schema变更**: 使用 `npm run db:deploy` 进行完整部署
3. **问题排查**: 使用 `node scripts/schema-manager.js health` 进行健康检查
4. **测试数据**: 使用 `tsx scripts/test-create-data.ts` 创建测试数据
5. **功能验证**: 运行对应的测试脚本验证功能正常