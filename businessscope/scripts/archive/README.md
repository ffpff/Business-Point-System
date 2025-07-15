# Archive 归档目录

## 📁 已归档的脚本

### `add-lock-fields.js`
**状态**: 已完成，无需再次执行
**功能**: 为用户表添加账户锁定相关字段
**添加字段**:
- `login_failed_count` - 登录失败次数计数
- `locked_at` - 账户锁定时间
- `lock_until` - 锁定过期时间

**执行时间**: 2024年初
**说明**: 此脚本是一次性执行的数据库Schema更新脚本，已完成其历史使命。
保留在归档中作为变更记录，方便将来查看数据库结构演进历史。

## 📋 已删除的重复脚本

以下脚本因功能重复已被删除：

1. `check-tables.js` - 功能已被 `schema-manager.js` 覆盖
2. `check-user-table.js` - 功能已被 `schema-manager.js` 覆盖
3. `test-db-connection.js` - 功能已被 `test-connections.ts` 覆盖
4. `test-db.js` - 使用过时的pg客户端，已被 `test-connections.ts` 替代
5. `test-prisma.ts` - 功能已被 `test-connections.ts` 包含
6. `test-redis.js` - 功能已被 `test-connections.ts` 包含

删除日期: 2025-01-15