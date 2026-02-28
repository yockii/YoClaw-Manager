# YoClaw Web Admin

独立的Web管理程序，提供Web界面和REST API。

## 功能特性

- 💬 实时聊天界面
- 📋 会话管理
- 📝 任务管理
- ⏰ 定时任务管理
- ⚙️ 配置管理
- 🔌 完整的REST API

## 快速开始

### 编译

```bash
go build -o yoclaw-web-admin
```

### 运行

```bash
# 默认配置（监听8080端口，使用默认token）
./yoclaw-web-admin

# 自定义配置
./yoclaw-web-admin -addr :9000 -token my-secret-token -yoclaw-path ~/.yoClaw
```

### 访问

打开浏览器访问 `http://localhost:8080?token=my-secret-token`

## API文档

### 认证

所有API请求都需要在URL参数或HTTP Header中提供token：

```bash
# URL参数
curl http://localhost:8080/api/sessions?token=my-secret-token

# HTTP Header
curl -H "Authorization: my-secret-token" http://localhost:8080/api/sessions
```

### WebSocket

**连接：**

```javascript
const ws = new WebSocket('ws://localhost:8080/ws?token=my-secret-token');

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log(data);
};

ws.send(JSON.stringify({
    type: 'message',
    content: 'Hello, YoClaw!'
}));
```

### REST API

#### 1. 会话管理

**获取会话列表**

```bash
GET /api/sessions
```

**响应：**

```json
{
    "sessions": [
        {
            "id": "session-1",
            "channel": "web",
            "sender_id": "user-1",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
    ]
}
```

**获取会话详情**

```bash
GET /api/sessions/:id
```

**删除会话**

```bash
DELETE /api/sessions/:id
```

#### 2. 任务管理

**获取任务列表**

```bash
GET /api/tasks
```

**响应：**

```json
{
    "tasks": [
        {
            "id": "task-1",
            "name": "任务名称",
            "description": "任务描述",
            "priority": "high",
            "status": "running",
            "created_at": "2024-01-01T00:00:00Z"
        }
    ]
}
```

**获取任务详情**

```bash
GET /api/tasks/:id
```

**创建任务**

```bash
POST /api/tasks
Content-Type: application/json

{
    "name": "任务名称",
    "description": "任务描述",
    "priority": "high"
}
```

**删除任务**

```bash
DELETE /api/tasks/:id
```

#### 3. 定时任务管理

**获取定时任务列表**

```bash
GET /api/cron
```

**响应：**

```json
{
    "cron_jobs": [
        {
            "id": "cron-1",
            "name": "定时任务名称",
            "schedule": "0 9 * * *",
            "description": "任务描述",
            "status": "enabled"
        }
    ]
}
```

**创建定时任务**

```bash
POST /api/cron
Content-Type: application/json

{
    "name": "定时任务名称",
    "schedule": "0 9 * * *",
    "description": "任务描述"
}
```

**更新定时任务**

```bash
PUT /api/cron/:id
Content-Type: application/json

{
    "status": "paused"
}
```

**删除定时任务**

```bash
DELETE /api/cron/:id
```

#### 4. 配置管理

**获取配置**

```bash
GET /api/config
```

**响应：**

```json
{
    "config": {
        "agents": {...},
        "providers": {...},
        "channels": {...}
    }
}
```

**更新配置**

```bash
PUT /api/config
Content-Type: application/json

{
    "agents": {...},
    "providers": {...}
}
```

## 命令行参数

```
-addr string
    监听地址（默认: :8080）
-token string
    认证token（默认: default）
-yoclaw-path string
    YoClaw数据目录路径（默认: ~/.yoClaw）
```

## 架构说明

Web管理程序作为独立的服务运行：

1. **WebSocket服务器** - 接收来自YoClaw Web Channel的连接
2. **HTTP API** - 提供管理功能
3. **静态文件服务** - 提供Web界面

与YoClaw主程序的交互：

```
YoClaw主程序 (Web Channel)
    ↓ WebSocket
Web管理程序
    ↓ HTTP/WebSocket
浏览器/第三方客户端
```

## 开发自己的界面

Web管理程序提供完整的REST API和WebSocket接口，你可以：

1. 使用REST API获取和管理数据
2. 使用WebSocket进行实时通信
3. 开发自己的前端界面（React、Vue、移动端等）

示例代码：

```javascript
// 连接WebSocket
const ws = new WebSocket('ws://localhost:8080/ws?token=my-token');

// 发送消息
ws.send(JSON.stringify({
    type: 'message',
    content: 'Hello'
}));

// 接收消息
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data);
};

// 获取会话列表
fetch('http://localhost:8080/api/sessions?token=my-token')
    .then(res => res.json())
    .then(data => console.log(data));
```

## 许可证

MIT License
