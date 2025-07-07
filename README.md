# 企业知识库文档上传 Chrome 插件

一个功能完整的Chrome扩展，用于企业知识库文档的批量上传管理。

## 功能特性

### 📁 批次管理
- **多批次支持**：创建多个独立的上传批次
- **批次状态跟踪**：未提交/已提交/失败状态管理
- **批次编辑**：随时编辑批次内容和文件
- **批次删除**：支持删除不需要的批次

### 📝 分步表单
- **步骤1**：基础信息（员工ID、姓名、部门、公司）
- **步骤2**：文件上传（支持拖拽、多选）
- **步骤3**：文档详情（流程、客户、零售商、描述）
- **步骤4**：确认提交（预览所有信息）

### 📎 文件管理
- **多文件上传**：支持同时上传多个文件
- **拖拽上传**：直接拖拽文件到上传区域
- **文件类型限制**：支持PDF、Word、Excel、图片等格式
- **文件大小限制**：单个文件最大10MB
- **文件预览**：显示文件名、大小、类型图标

### 💾 数据持久化
- **本地存储**：使用Chrome Storage API
- **断点续传**：关闭插件后数据不丢失
- **自动保存**：实时保存表单数据

### 🎨 用户界面
- **现代化设计**：美观的渐变色和卡片布局
- **响应式设计**：适配不同分辨率
- **动画效果**：平滑的过渡和交互
- **错误提示**：实时表单验证和错误显示

## 安装说明

### 开发者模式安装

1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `marketplace_kb` 文件夹
6. 插件安装完成，在工具栏中可见

### 文件结构

```
marketplace_kb/
├── manifest.json          # 插件配置文件
├── popup.html             # 主页面HTML
├── styles/
│   └── popup.css          # 样式文件
├── js/
│   └── popup.js          # 主要逻辑
├── icons/
│   ├── icon16.png        # 16x16图标
│   ├── icon48.png        # 48x48图标
│   └── icon128.png       # 128x128图标
└── README.md             # 说明文档
```

## 使用指南

### 1. 创建新批次
1. 点击工具栏中的插件图标
2. 点击"+ 新建上传批次"按钮
3. 按照分步表单填写信息

### 2. 填写基础信息
- **员工ID**：必填，输入员工编号
- **姓名**：必填，输入员工姓名
- **部门**：必填，从下拉列表选择
- **公司**：可选，输入公司名称

### 3. 上传文件
- 点击上传区域选择文件
- 或直接拖拽文件到上传区域
- 支持多个文件同时上传
- 可以删除已选择的文件

### 4. 填写文档详情
- **关联流程**：必填，选择文档相关的业务流程
- **客户**：必填，选择相关客户
- **零售商**：可选，选择相关零售商
- **描述**：可选，添加文档描述

### 5. 确认和保存
- 预览所有填写的信息
- 确认无误后点击"保存批次"
- 返回批次列表页面

### 6. 提交批次
- 在批次列表中查看所有批次
- 点击"全部提交"一次性提交所有批次
- 或编辑单个批次后单独提交

## 技术特性

### 前端技术
- **纯JavaScript**：无框架依赖，轻量级
- **现代CSS**：使用Flexbox布局和CSS3动画
- **Chrome Extension API**：使用Storage API进行数据持久化

### 数据验证
- **前端验证**：实时表单验证
- **文件类型检查**：支持的文件格式验证
- **文件大小限制**：防止上传过大文件
- **必填字段检查**：确保关键信息完整

### 错误处理
- **友好提示**：Toast通知系统
- **错误恢复**：支持失败批次重试
- **数据备份**：本地存储防止数据丢失

## 自定义配置

### 修改下拉选项
在 `js/popup.js` 中找到对应的渲染函数，修改选项数组：

```javascript
// 部门选项
<option value="IT">IT部</option>
<option value="HR">人事部</option>
// 添加更多部门...

// 流程选项
<option value="招聘流程">招聘流程</option>
<option value="员工入职">员工入职</option>
// 添加更多流程...
```

### 修改文件限制
在 `validateFile` 函数中修改：

```javascript
const maxSize = 10 * 1024 * 1024; // 修改最大文件大小
const allowedTypes = [
  'application/pdf',
  // 添加或删除支持的文件类型
];
```

### 修改样式
在 `styles/popup.css` 中自定义：

```css
/* 修改主题色 */
.btn-primary {
  background: linear-gradient(135deg, #your-color1, #your-color2);
}

/* 修改尺寸 */
body {
  width: 480px;  /* 修改插件宽度 */
  height: 640px; /* 修改插件高度 */
}
```

## API集成

当前版本使用模拟API。要集成真实的后端API：

1. 修改 `submitBatch` 函数：

```javascript
async submitBatch(batch) {
  const formData = new FormData();
  
  // 添加基础信息
  Object.keys(batch.formData.basicInfo).forEach(key => {
    formData.append(key, batch.formData.basicInfo[key]);
  });
  
  // 添加文档详情
  Object.keys(batch.formData.documentDetails).forEach(key => {
    formData.append(key, batch.formData.documentDetails[key]);
  });
  
  // 添加文件
  batch.files.forEach(file => {
    formData.append('files[]', file);
  });
  
  // 发送请求
  const response = await fetch('https://your-api-endpoint.com/upload', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': 'Bearer your-token'
    }
  });
  
  if (!response.ok) {
    throw new Error('Upload failed');
  }
  
  return response.json();
}
```

2. 在 `manifest.json` 中添加API域名权限：

```json
"host_permissions": [
  "https://your-api-domain.com/*"
]
```

## 故障排除

### 插件无法加载
- 检查是否开启了开发者模式
- 确认文件路径正确
- 查看Chrome扩展页面的错误信息

### 文件上传失败
- 检查文件大小是否超过限制
- 确认文件类型是否支持
- 查看浏览器控制台错误信息

### 数据丢失
- 检查Chrome存储权限
- 确认没有清除浏览器数据
- 查看chrome://settings/content/all中的存储设置

## 版本历史

### v1.0 (当前版本)
- 基础批次管理功能
- 四步表单流程
- 文件上传和验证
- 本地数据存储
- 现代化UI设计

## 贡献指南

1. Fork此项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 许可证

MIT License - 详见LICENSE文件

## 联系方式

如有问题或建议，请联系开发团队。 