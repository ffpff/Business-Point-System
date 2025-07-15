# 数据库操作问题诊断与解决方案

## 🚨 问题总结

### 1. Prisma CLI 环境变量加载失败

**问题描述:**
```bash
Error: Environment variable not found: POSTGRES_PRISMA_URL
```

**根本原因:**
- Prisma CLI 默认只读取项目根目录的 `.env` 文件
- Next.js 项目的环境变量通常存储在 `.env.local` 文件中
- Prisma CLI 不会自动加载 `.env.local`

**解决方案:**
```bash
# 方案1: 使用 dotenv-cli 显式加载环境变量
npx dotenv -e .env.local -- npx prisma db push

# 方案2: 复制 .env.local 为 .env (不推荐，可能暴露敏感信息)
cp .env.local .env

# 方案3: 使用自定义脚本
node scripts/db-push.js
```

### 2. Supabase 连接超时问题

**问题描述:**
```bash
Command timed out after 2m 0.0s
Datasource "db": PostgreSQL database "postgres", schema "public" at "aws-0-us-east-1.pooler.supabase.com:6543"
```

**根本原因:**
- Supabase 连接池可能有连接数限制
- 网络延迟或连接不稳定
- 大型 schema 变更操作超时

**解决方案:**
1. 使用直连URL而非连接池URL
2. 增加操作超时时间
3. 将大型变更拆分为小步骤
4. 使用原生SQL执行变更

### 3. Schema 同步不一致

**问题描述:**
- 数据库实际结构与 Prisma schema 定义不匹配
- 需要手动添加缺失字段

**根本原因:**
- 多种方式管理数据库结构（Prisma + 手动SQL + Supabase面板）
- 缺乏统一的 migration 历史记录

**解决方案:**
1. 建立统一的 schema 管理流程
2. 使用 migration 而非 db push
3. 定期进行 schema 同步验证

## 🛠️ 推荐的数据库管理流程

### 开发环境
```bash
# 1. Schema 变更
# 编辑 prisma/schema.prisma

# 2. 生成并应用 migration
npm run db:migrate

# 3. 生成客户端
npm run db:generate

# 4. 验证变更
npm run db:verify
```

### 生产环境
```bash
# 1. 备份数据库
npm run db:backup

# 2. 应用 migration
npm run db:migrate:deploy

# 3. 验证部署
npm run db:verify
```

## ⚡ 快速修复命令

### 环境变量问题
```bash
# 安装必要工具
npm install dotenv-cli

# 测试连接
npx dotenv -e .env.local -- node scripts/test-connection.js

# 推送 schema
npx dotenv -e .env.local -- npx prisma db push
```

### Schema 同步问题
```bash
# 检查当前状态
node scripts/check-schema.js

# 手动同步
node scripts/sync-schema.js

# 验证结果
node scripts/verify-schema.js
```

## 📝 最佳实践

1. **环境变量管理**
   - 开发环境使用 `.env.local`
   - 生产环境使用环境变量或安全存储
   - 使用 `dotenv-cli` 进行显式加载

2. **Schema 变更**
   - 优先使用 `prisma migrate` 而非 `db push`
   - 保持 migration 历史记录
   - 每次变更前备份数据库

3. **连接管理**
   - 开发环境使用连接池URL
   - 大型操作使用直连URL
   - 设置合适的超时时间

4. **验证流程**
   - 变更后立即验证
   - 使用自动化脚本检查
   - 保持schema与代码同步

## 🔧 故障排除检查清单

- [ ] 环境变量是否正确加载
- [ ] 数据库连接是否正常
- [ ] Schema 定义是否与实际表结构匹配
- [ ] Migration 历史是否完整
- [ ] 权限设置是否正确
- [ ] 网络连接是否稳定

---

*最后更新: 2025-07-15*
*负责人: Claude AI Assistant*