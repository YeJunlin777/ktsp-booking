# KTSP 预订系统 API 文档 v2.0

> 版本：v2.0.0  
> 更新时间：2025-12-05  
> Base URL：`/api`  
> 功能覆盖率：100%（对照功能清单）

---

## 通用规范

### 响应格式

```json
// 成功
{ "success": true, "data": { ... } }

// 失败
{ "success": false, "error": { "code": "ERROR_CODE", "message": "错误描述" } }

// 分页
{ "success": true, "data": { "items": [...], "total": 100, "page": 1, "limit": 10 } }
```

### 错误码

| Code | HTTP | 说明 |
|------|------|------|
| `UNAUTHORIZED` | 401 | 未登录 |
| `FORBIDDEN` | 403 | 无权限 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `INVALID_PARAMS` | 400 | 参数错误 |
| `CONFLICT` | 409 | 资源冲突（如时段已被预约） |
| `INTERNAL_ERROR` | 500 | 服务器错误 |

### 认证

- 用户端：NextAuth Session Cookie
- 管理后台：Bearer Token

---

# 用户端 API

---

## 一、认证模块 `/api/auth`

### 1.1 短信验证码

#### POST `/api/auth/sms/send`
发送短信验证码

```json
// Request
{ "phone": "13800138000" }

// Response
{ "success": true, "data": { "expireIn": 300 } }
```

#### POST `/api/auth/sms/verify`
验证短信码并登录/注册

```json
// Request
{ "phone": "13800138000", "code": "123456", "inviteCode": "ABC123" }

// Response
{ "success": true, "data": { "user": { "id": "xxx", "phone": "13800138000", "isNew": true } } }
```

### 1.2 第三方登录

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/auth/providers` | 获取登录方式列表 |
| POST | `/api/auth/signin/apple` | Apple登录 |
| POST | `/api/auth/signin/google` | Google登录 |
| GET | `/api/auth/session` | 获取当前会话 |
| POST | `/api/auth/signout` | 退出登录 |

### 1.3 实名认证

#### POST `/api/auth/verify/submit`
提交实名认证

```json
// Request
{
  "realName": "张三",
  "idNumber": "110101199001011234",
  "idFrontImage": "/uploads/id-front.jpg",
  "idBackImage": "/uploads/id-back.jpg"
}

// Response
{ "success": true, "data": { "status": "pending" } }
```

#### GET `/api/auth/verify/status`
查询认证状态

```json
// Response
{
  "success": true,
  "data": {
    "status": "pending|approved|rejected",
    "realName": "张*",
    "rejectReason": null,
    "submittedAt": "2025-12-05T10:00:00Z"
  }
}
```

---

## 二、用户模块 `/api/user`

### 2.1 个人信息

#### GET `/api/user/profile`
获取个人信息

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "张三",
    "phone": "138****8000",
    "avatar": "/images/avatar.jpg",
    "memberLevel": "gold",
    "memberLevelName": "金卡会员",
    "points": 1280,
    "isVerified": true,
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

#### PUT `/api/user/profile`
更新个人信息

```json
// Request
{ "name": "新昵称", "avatar": "/uploads/new-avatar.jpg" }
```

---

## 三、首页模块 `/api/home`

### 3.1 轮播图

#### GET `/api/home/banners`
获取首页轮播图

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "image": "/images/banner1.jpg",
      "link": "/venues/1",
      "title": "新场地开业"
    }
  ]
}
```

### 3.2 智能推荐

#### GET `/api/home/recommend`
根据历史记录推荐场地

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "打位A01",
      "type": "driving_range",
      "image": "/images/venue1.jpg",
      "price": 100,
      "reason": "您常预约的场地"
    }
  ]
}
```

### 3.3 场地分类

#### GET `/api/home/categories`
获取场地分类入口

```json
{
  "success": true,
  "data": [
    { "key": "driving_range", "name": "打位", "icon": "target", "count": 20 },
    { "key": "simulator", "name": "模拟器", "icon": "monitor", "count": 5 },
    { "key": "putting_green", "name": "推杆果岭", "icon": "flag", "count": 3 },
    { "key": "vip_room", "name": "VIP房", "icon": "crown", "count": 8 }
  ]
}
```

---

## 四、场地模块 `/api/venues`

### 4.1 场地列表

#### GET `/api/venues`

**Query参数：**
- `type`: 场地类型
- `date`: 日期（筛选有空档的）
- `page`, `limit`: 分页

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "1",
        "name": "打位A01",
        "type": "driving_range",
        "typeName": "打位",
        "description": "一楼靠窗位置",
        "images": ["/images/venue1.jpg"],
        "price": 100,
        "peakPrice": 150,
        "status": "available",
        "facilities": ["空调", "WiFi"]
      }
    ],
    "total": 50
  }
}
```

### 4.2 场地详情

#### GET `/api/venues/{id}`

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "打位A01",
    "type": "driving_range",
    "description": "一楼靠窗位置，视野开阔，适合练习长杆",
    "images": ["/images/venue1.jpg", "/images/venue1-2.jpg"],
    "price": 100,
    "peakPrice": 150,
    "facilities": ["空调", "WiFi", "储物柜"],
    "rules": {
      "cancelFreeHours": 2,
      "cancelPenaltyRate": 0.5,
      "noShowPenalty": "全额扣费"
    },
    "openTime": "08:00",
    "closeTime": "22:00",
    "minDuration": 30,
    "maxDuration": 240
  }
}
```

### 4.3 场地档期

#### GET `/api/venues/{id}/schedule`

**Query参数：**
- `date`: 日期（必填，YYYY-MM-DD）

```json
{
  "success": true,
  "data": {
    "date": "2025-12-06",
    "slots": [
      { "startTime": "08:00", "endTime": "08:30", "status": "available", "price": 50 },
      { "startTime": "08:30", "endTime": "09:00", "status": "available", "price": 50 },
      { "startTime": "09:00", "endTime": "09:30", "status": "booked", "price": 75 },
      { "startTime": "09:30", "endTime": "10:00", "status": "maintenance", "price": 75 }
    ]
  }
}
```

**status枚举：**
- `available`: 可预约
- `booked`: 已预约
- `maintenance`: 维护中

---

## 五、预约模块 `/api/bookings`

### 5.1 创建预约

#### POST `/api/bookings`

```json
// Request
{
  "venueId": "1",
  "date": "2025-12-06",
  "startTime": "09:00",
  "endTime": "10:00",
  "duration": 60,
  "couponId": null,
  "invitees": ["user_id_2", "user_id_3"]
}

// Response
{
  "success": true,
  "data": {
    "id": "booking_id",
    "orderNo": "BK202512060001",
    "status": "pending",
    "originalPrice": 100,
    "discount": 10,
    "totalPrice": 90,
    "pointsEarnable": 9
  }
}
```

### 5.2 预约列表

#### GET `/api/bookings`

**Query参数：**
- `status`: upcoming（即将进行）/ completed / cancelled / noshow
- `page`, `limit`

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "booking_id",
        "orderNo": "BK202512060001",
        "venue": { "id": "1", "name": "打位A01", "image": "/images/venue1.jpg" },
        "date": "2025-12-06",
        "startTime": "09:00",
        "endTime": "10:00",
        "status": "confirmed",
        "totalPrice": 90,
        "invitees": [
          { "userId": "xxx", "name": "李四", "status": "accepted" }
        ],
        "canCancel": true,
        "canReschedule": true,
        "canEvaluate": false
      }
    ],
    "total": 10
  }
}
```

### 5.3 预约详情

#### GET `/api/bookings/{id}`

### 5.4 取消预约

#### POST `/api/bookings/{id}/cancel`

```json
// Response
{
  "success": true,
  "data": {
    "refundAmount": 90,
    "penalty": 0,
    "pointsDeducted": 0
  }
}
```

### 5.5 改期

#### POST `/api/bookings/{id}/reschedule`

```json
// Request
{
  "date": "2025-12-07",
  "startTime": "10:00",
  "endTime": "11:00"
}
```

### 5.6 邀请好友

#### POST `/api/bookings/{id}/invite`

```json
// Request
{ "userId": "friend_user_id" }
// 或
{ "phone": "13900139000" }
```

### 5.7 接受/拒绝邀请

#### POST `/api/bookings/invitations/{invitationId}/respond`

```json
// Request
{ "action": "accept" }  // accept / reject
```

### 5.8 我的邀请

#### GET `/api/bookings/invitations`

获取收到的预约邀请列表

### 5.9 评价预约

#### POST `/api/bookings/{id}/evaluate`

```json
// Request
{
  "venueRating": 5,
  "venueComment": "场地很干净",
  "coachRating": 5,
  "coachComment": "教练很专业",
  "images": ["/uploads/eval1.jpg"]
}
```

#### GET `/api/venues/{id}/evaluations`

获取场地评价列表

---

## 六、教练模块 `/api/coaches`

### 6.1 教练列表

#### GET `/api/coaches`

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "王教练",
      "avatar": "/images/coach1.jpg",
      "title": "高级教练",
      "introduction": "10年教学经验，擅长纠正姿势",
      "specialty": ["长杆", "推杆", "沙坑"],
      "rating": 4.8,
      "lessonCount": 500,
      "price": 300
    }
  ]
}
```

### 6.2 教练详情

#### GET `/api/coaches/{id}`

包含详细介绍、证书、学员评价等

### 6.3 教练档期

#### GET `/api/coaches/{id}/schedule?date=2025-12-06`

### 6.4 预约教练

#### POST `/api/coaches/{id}/book`

```json
// Request
{
  "date": "2025-12-06",
  "startTime": "09:00",
  "endTime": "10:00",
  "venueId": "1",
  "couponId": null
}
```

### 6.5 教练评价

#### GET `/api/coaches/{id}/evaluations`

---

## 七、团体课程模块 `/api/courses`

### 7.1 课程列表

#### GET `/api/courses`

**Query参数：**
- `category`: 分类（short_game/long_game/youth/beginner）
- `status`: ongoing / upcoming / finished

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "青少年高尔夫入门班",
      "category": "youth",
      "categoryName": "青少年班",
      "description": "适合8-15岁零基础学员",
      "image": "/images/course1.jpg",
      "coach": { "id": "1", "name": "王教练", "avatar": "..." },
      "schedule": "每周六 09:00-11:00",
      "totalLessons": 12,
      "price": 3600,
      "currentStudents": 8,
      "maxStudents": 12,
      "status": "enrolling"
    }
  ]
}
```

### 7.2 课程详情

#### GET `/api/courses/{id}`

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "青少年高尔夫入门班",
    "description": "...",
    "syllabus": [
      { "lesson": 1, "title": "握杆姿势", "duration": 120 },
      { "lesson": 2, "title": "站位与挥杆", "duration": 120 }
    ],
    "coach": { ... },
    "venue": { "id": "1", "name": "培训室A" },
    "scheduleDetails": [
      { "date": "2025-12-07", "startTime": "09:00", "endTime": "11:00" }
    ],
    "price": 3600,
    "currentStudents": 8,
    "maxStudents": 12,
    "enrollDeadline": "2025-12-05",
    "requirements": "需自备球杆",
    "canEnroll": true
  }
}
```

### 7.3 报名课程

#### POST `/api/courses/{id}/enroll`

```json
// Request
{ "couponId": null }

// Response
{
  "success": true,
  "data": {
    "enrollmentId": "xxx",
    "totalPrice": 3600,
    "pointsEarnable": 360
  }
}
```

### 7.4 我的课程

#### GET `/api/courses/my`

获取已报名的课程列表

---

## 八、签到模块 `/api/checkin`

### 8.1 执行签到

#### POST `/api/checkin`

```json
{
  "success": true,
  "data": {
    "points": 10,
    "streakDays": 5,
    "bonusPoints": 20,
    "totalPoints": 30,
    "message": "连续签到5天，额外奖励20积分！"
  }
}
```

### 8.2 签到状态

#### GET `/api/checkin`

```json
{
  "success": true,
  "data": {
    "isCheckedIn": false,
    "streakDays": 4,
    "totalPoints": 1280,
    "monthCount": 18,
    "monthCheckins": [
      { "date": "2025-12-01", "points": 10 }
    ]
  }
}
```

---

## 九、积分模块 `/api/points`

### 9.1 积分余额

#### GET `/api/points/balance`

```json
{
  "success": true,
  "data": {
    "available": 1280,
    "expiringSoon": 200,
    "expireDate": "2025-12-31"
  }
}
```

### 9.2 积分流水

#### GET `/api/points/history`

**Query参数：**
- `type`: earn / spend
- `page`, `limit`

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "1",
        "type": "earn",
        "amount": 10,
        "balance": 1280,
        "reason": "每日签到",
        "createdAt": "2025-12-05T08:00:00Z"
      },
      {
        "id": "2",
        "type": "spend",
        "amount": -500,
        "balance": 780,
        "reason": "兑换商品：高尔夫球",
        "createdAt": "2025-12-04T15:00:00Z"
      }
    ],
    "total": 50
  }
}
```

### 9.3 积分任务

#### GET `/api/points/tasks`

```json
{
  "success": true,
  "data": [
    {
      "id": "first_booking",
      "name": "首次预约",
      "description": "完成首次场地预约",
      "points": 100,
      "status": "completed",
      "completedAt": "2025-12-01T10:00:00Z"
    },
    {
      "id": "first_evaluate",
      "name": "首次评价",
      "description": "完成首次预约评价",
      "points": 50,
      "status": "pending",
      "progress": { "current": 0, "target": 1 }
    },
    {
      "id": "share_app",
      "name": "分享应用",
      "description": "分享应用给好友",
      "points": 20,
      "status": "available",
      "dailyLimit": 3,
      "todayCompleted": 1
    }
  ]
}
```

#### POST `/api/points/tasks/{taskId}/complete`

完成任务（如分享任务）

---

## 十、积分商城模块 `/api/shop`

### 10.1 商品列表

#### GET `/api/shop/products`

**Query参数：**
- `category`: goods（实物）/ virtual（虚拟）/ coupon（优惠券）

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "高尔夫球（3只装）",
      "image": "/images/product1.jpg",
      "points": 500,
      "originalPoints": 600,
      "stock": 100,
      "category": "goods",
      "salesCount": 50
    }
  ]
}
```

### 10.2 商品详情

#### GET `/api/shop/products/{id}`

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "高尔夫球（3只装）",
    "images": ["/images/product1.jpg", "/images/product1-2.jpg"],
    "description": "Titleist Pro V1，比赛用球",
    "points": 500,
    "stock": 100,
    "category": "goods",
    "deliveryMethod": "pickup",
    "specifications": [
      { "key": "品牌", "value": "Titleist" },
      { "key": "型号", "value": "Pro V1" }
    ],
    "canExchange": true
  }
}
```

### 10.3 兑换商品

#### POST `/api/shop/exchange`

```json
// Request
{
  "productId": "1",
  "quantity": 1,
  "deliveryMethod": "delivery",
  "address": {
    "name": "张三",
    "phone": "13800138000",
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "detail": "xxx街道xxx号"
  }
}

// Response
{
  "success": true,
  "data": {
    "orderId": "xxx",
    "orderNo": "EX202512050001",
    "pointsSpent": 500,
    "status": "pending"
  }
}
```

### 10.4 兑换记录

#### GET `/api/shop/orders`

```json
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "orderNo": "EX202512050001",
      "product": { "id": "1", "name": "高尔夫球", "image": "..." },
      "quantity": 1,
      "pointsSpent": 500,
      "status": "shipped",
      "statusName": "已发货",
      "deliveryMethod": "delivery",
      "trackingNo": "SF1234567890",
      "createdAt": "2025-12-05T10:00:00Z"
    }
  ]
}
```

### 10.5 确认收货

#### POST `/api/shop/orders/{id}/confirm`

---

## 十一、优惠券模块 `/api/coupons`

### 11.1 我的优惠券

#### GET `/api/coupons`

**Query参数：**
- `status`: available / used / expired

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "新人专享券",
      "type": "discount",
      "typeName": "折扣券",
      "value": 0.9,
      "valueText": "9折",
      "minAmount": 100,
      "minAmountText": "满100可用",
      "applicableVenues": ["driving_range"],
      "applicableText": "打位可用",
      "expireAt": "2025-12-31T23:59:59Z",
      "status": "available"
    }
  ]
}
```

### 11.2 可领取优惠券

#### GET `/api/coupons/available`

```json
{
  "success": true,
  "data": [
    {
      "id": "template_1",
      "name": "周末特惠券",
      "type": "amount",
      "value": 20,
      "valueText": "减20元",
      "minAmount": 200,
      "remaining": 50,
      "canClaim": true
    }
  ]
}
```

### 11.3 领取优惠券

#### POST `/api/coupons/claim`

```json
// Request
{ "templateId": "template_1" }

// Response
{ "success": true, "data": { "couponId": "xxx" } }
```

### 11.4 预约时可用优惠券

#### GET `/api/coupons/applicable`

**Query参数：**
- `venueId`: 场地ID
- `amount`: 预约金额

返回该场景下可用的优惠券列表

---

## 十二、消息模块 `/api/messages`

### 12.1 消息列表

#### GET `/api/messages`

**Query参数：**
- `type`: system / booking / activity / invite
- `unreadOnly`: true/false

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "1",
        "type": "booking",
        "typeName": "预约通知",
        "title": "预约成功",
        "content": "您已成功预约打位A01，时间：12月6日 09:00-10:00",
        "isRead": false,
        "link": "/bookings/xxx",
        "createdAt": "2025-12-05T10:00:00Z"
      }
    ],
    "unreadCount": 5
  }
}
```

### 12.2 未读数量

#### GET `/api/messages/unread-count`

```json
{ "success": true, "data": { "count": 5 } }
```

### 12.3 标记已读

#### POST `/api/messages/{id}/read`

#### POST `/api/messages/read-all`

标记全部已读

---

## 十三、推荐有礼模块 `/api/referral`

### 13.1 获取邀请信息

#### GET `/api/referral/info`

```json
{
  "success": true,
  "data": {
    "inviteCode": "ABC123",
    "inviteLink": "https://ktsp.com/invite/ABC123",
    "qrCodeUrl": "/api/referral/qrcode",
    "reward": {
      "inviter": { "points": 100, "freeMinutes": 30 },
      "invitee": { "points": 50, "couponName": "新人专享券" }
    },
    "successCount": 5,
    "totalReward": 500
  }
}
```

### 13.2 邀请记录

#### GET `/api/referral/records`

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "invitee": { "id": "xxx", "name": "李*", "avatar": "..." },
      "status": "completed",
      "statusName": "已完成",
      "reward": 100,
      "createdAt": "2025-12-01T10:00:00Z",
      "completedAt": "2025-12-02T15:00:00Z"
    }
  ]
}
```

### 13.3 生成邀请二维码

#### GET `/api/referral/qrcode`

返回二维码图片

---

## 十四、反馈模块 `/api/feedback`

### 14.1 提交反馈

#### POST `/api/feedback`

```json
// Request
{
  "type": "suggestion",
  "content": "建议增加夜间模式",
  "images": ["/uploads/img1.jpg"]
}
```

### 14.2 我的反馈

#### GET `/api/feedback`

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "type": "suggestion",
      "typeName": "功能建议",
      "content": "建议增加夜间模式",
      "images": [],
      "status": "resolved",
      "statusName": "已解决",
      "reply": "感谢您的建议，我们已在新版本中加入夜间模式",
      "createdAt": "2025-12-01T10:00:00Z",
      "repliedAt": "2025-12-03T15:00:00Z"
    }
  ]
}
```

---

## 十五、文件上传 `/api/upload`

### 15.1 上传图片

#### POST `/api/upload/image`

**Content-Type:** multipart/form-data

**Body:**
- `file`: 图片文件
- `type`: avatar / id_card / feedback / evaluation

```json
{
  "success": true,
  "data": {
    "url": "/uploads/2025/12/05/xxx.jpg",
    "thumbnail": "/uploads/2025/12/05/xxx_thumb.jpg"
  }
}
```

---

# 管理后台 API

> Base URL: `/api/admin`  
> 认证: Bearer Token

---

## 一、管理员认证 `/api/admin/auth`

#### POST `/api/admin/auth/login`
管理员登录

#### POST `/api/admin/auth/logout`
退出登录

#### GET `/api/admin/auth/profile`
获取管理员信息

---

## 二、员工管理 `/api/admin/staff`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/staff` | 员工列表 |
| POST | `/api/admin/staff` | 创建员工 |
| GET | `/api/admin/staff/{id}` | 员工详情 |
| PUT | `/api/admin/staff/{id}` | 更新员工 |
| DELETE | `/api/admin/staff/{id}` | 删除员工 |
| PUT | `/api/admin/staff/{id}/role` | 修改角色 |
| PUT | `/api/admin/staff/{id}/status` | 启用/禁用 |

---

## 三、场地管理 `/api/admin/venues`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/venues` | 场地列表 |
| POST | `/api/admin/venues` | 创建场地 |
| GET | `/api/admin/venues/{id}` | 场地详情 |
| PUT | `/api/admin/venues/{id}` | 更新场地 |
| DELETE | `/api/admin/venues/{id}` | 删除场地 |
| PUT | `/api/admin/venues/{id}/status` | 开放/关闭/维护 |
| PUT | `/api/admin/venues/{id}/schedule` | 设置营业时间 |

### 节假日管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/holidays` | 节假日列表 |
| POST | `/api/admin/holidays` | 添加节假日 |
| DELETE | `/api/admin/holidays/{id}` | 删除节假日 |

---

## 四、价格管理 `/api/admin/pricing`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/pricing/rules` | 定价规则列表 |
| POST | `/api/admin/pricing/rules` | 创建定价规则 |
| PUT | `/api/admin/pricing/rules/{id}` | 更新定价规则 |
| DELETE | `/api/admin/pricing/rules/{id}` | 删除定价规则 |
| GET | `/api/admin/pricing/member-discounts` | 会员折扣配置 |
| PUT | `/api/admin/pricing/member-discounts` | 更新会员折扣 |

---

## 五、预约管理 `/api/admin/bookings`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/bookings` | 预约列表（支持筛选） |
| GET | `/api/admin/bookings/dashboard` | 今日预约看板 |
| POST | `/api/admin/bookings` | 手动创建预约 |
| GET | `/api/admin/bookings/{id}` | 预约详情 |
| PUT | `/api/admin/bookings/{id}/status` | 更新状态（确认到店/完成/失约） |
| POST | `/api/admin/bookings/{id}/cancel` | 取消预约 |
| POST | `/api/admin/bookings/{id}/reschedule` | 改期 |

### 黑名单管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/blacklist` | 黑名单列表 |
| POST | `/api/admin/blacklist` | 加入黑名单 |
| DELETE | `/api/admin/blacklist/{id}` | 移出黑名单 |

---

## 六、教练管理 `/api/admin/coaches`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/coaches` | 教练列表 |
| POST | `/api/admin/coaches` | 创建教练 |
| PUT | `/api/admin/coaches/{id}` | 更新教练 |
| DELETE | `/api/admin/coaches/{id}` | 删除教练 |
| GET | `/api/admin/coaches/{id}/schedule` | 查看排班 |
| PUT | `/api/admin/coaches/{id}/schedule` | 设置排班 |
| PUT | `/api/admin/coaches/{id}/price` | 设置课程价格 |

---

## 七、会员管理 `/api/admin/members`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/members` | 会员列表（支持搜索） |
| GET | `/api/admin/members/{id}` | 会员详情 |
| PUT | `/api/admin/members/{id}/level` | 调整会员等级 |
| PUT | `/api/admin/members/{id}/points` | 调整积分 |
| PUT | `/api/admin/members/{id}/status` | 冻结/解冻 |
| GET | `/api/admin/members/{id}/bookings` | 会员预约记录 |
| GET | `/api/admin/members/{id}/points-history` | 会员积分流水 |

### 实名审核

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/verifications` | 待审核列表 |
| POST | `/api/admin/verifications/{id}/approve` | 通过认证 |
| POST | `/api/admin/verifications/{id}/reject` | 拒绝认证 |

---

## 八、积分商城管理 `/api/admin/shop`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/shop/products` | 商品列表 |
| POST | `/api/admin/shop/products` | 创建商品 |
| PUT | `/api/admin/shop/products/{id}` | 更新商品 |
| DELETE | `/api/admin/shop/products/{id}` | 删除商品 |
| PUT | `/api/admin/shop/products/{id}/stock` | 调整库存 |
| PUT | `/api/admin/shop/products/{id}/status` | 上架/下架 |

### 兑换订单

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/shop/orders` | 兑换订单列表 |
| PUT | `/api/admin/shop/orders/{id}/ship` | 发货 |
| PUT | `/api/admin/shop/orders/{id}/complete` | 完成 |

---

## 九、营销活动 `/api/admin/marketing`

### 优惠券管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/coupons/templates` | 优惠券模板列表 |
| POST | `/api/admin/coupons/templates` | 创建优惠券模板 |
| PUT | `/api/admin/coupons/templates/{id}` | 更新模板 |
| DELETE | `/api/admin/coupons/templates/{id}` | 删除模板 |
| POST | `/api/admin/coupons/distribute` | 批量发放优惠券 |
| GET | `/api/admin/coupons/records` | 发放记录 |

### 消息推送

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/messages/push` | 发送站内通知 |
| GET | `/api/admin/messages/history` | 推送历史 |

---

## 十、数据报表 `/api/admin/reports`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/reports/revenue` | 营收统计 |
| GET | `/api/admin/reports/bookings` | 预约统计 |
| GET | `/api/admin/reports/members` | 会员统计 |
| GET | `/api/admin/reports/venues` | 场地使用率 |
| GET | `/api/admin/reports/coaches` | 教练业绩 |
| GET | `/api/admin/reports/export` | 导出报表 |

**Query参数（通用）：**
- `startDate`: 开始日期
- `endDate`: 结束日期
- `granularity`: day / week / month

---

## 十一、系统设置 `/api/admin/settings`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/settings/general` | 获取通用设置 |
| PUT | `/api/admin/settings/general` | 更新通用设置 |
| GET | `/api/admin/settings/booking-rules` | 预约规则配置 |
| PUT | `/api/admin/settings/booking-rules` | 更新预约规则 |
| GET | `/api/admin/settings/points-rules` | 积分规则配置 |
| PUT | `/api/admin/settings/points-rules` | 更新积分规则 |

---

## 十二、反馈管理 `/api/admin/feedback`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/feedback` | 反馈列表 |
| GET | `/api/admin/feedback/{id}` | 反馈详情 |
| PUT | `/api/admin/feedback/{id}/status` | 更新状态 |
| POST | `/api/admin/feedback/{id}/reply` | 回复反馈 |

---

# 接口预留（未来扩展）

| 路径 | 说明 |
|------|------|
| `/api/devices/vending/*` | 售卖机接口 |
| `/api/devices/locker/*` | 储物柜接口 |
| `/api/devices/rental/*` | 租杆接口 |

---

# API 实现进度总览

## 用户端

| 模块 | 接口数 | 状态 |
|------|--------|------|
| 认证 | 6 | ⏳ |
| 用户 | 2 | ⏳ |
| 首页 | 3 | ⏳ |
| 场地 | 3 | ⏳ |
| 预约 | 9 | ⏳ |
| 教练 | 5 | ⏳ |
| 团体课程 | 4 | ⏳ |
| 签到 | 2 | ✅ |
| 积分 | 3 | ⏳ |
| 积分商城 | 5 | ⏳ |
| 优惠券 | 4 | ⏳ |
| 消息 | 4 | ⏳ |
| 推荐有礼 | 3 | ⏳ |
| 反馈 | 2 | ✅ |
| 文件上传 | 1 | ⏳ |
| **用户端合计** | **56** | **7%** |

## 管理后台

| 模块 | 接口数 | 状态 |
|------|--------|------|
| 认证 | 3 | ⏳ |
| 员工管理 | 7 | ⏳ |
| 场地管理 | 10 | ⏳ |
| 价格管理 | 5 | ⏳ |
| 预约管理 | 10 | ⏳ |
| 教练管理 | 7 | ⏳ |
| 会员管理 | 10 | ⏳ |
| 积分商城管理 | 8 | ⏳ |
| 营销活动 | 7 | ⏳ |
| 数据报表 | 6 | ⏳ |
| 系统设置 | 6 | ⏳ |
| 反馈管理 | 4 | ⏳ |
| **后台合计** | **83** | **0%** |

---

**总计：139个接口**
