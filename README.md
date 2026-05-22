# Mendix OnlyOffice Widget

这个组件用于在 Mendix Web 页面中嵌入 OnlyOffice Docs 编辑器。组件会加载你部署的 OnlyOffice Document Server API：

```text
{Document server URL}/web-apps/apps/api/documents/api.js
```

然后使用 `DocsAPI.DocEditor` 打开文档。

## 使用前准备

1. 在 Mendix Studio Pro 中导入 `dist/1.0.0/mendix.OnlyOffice.mpk`。
2. 将 `OnlyOffice` 组件拖到需要展示文档的页面中。
3. 页面需要有对象上下文，因为组件的主要配置项推荐绑定为表达式。
4. 确保 `Document URL` 和 `Callback URL` 是 OnlyOffice Document Server 可以访问到的公网或内网地址。

## 最简配置

通常只需要配置这些字段：

```text
Document server URL: 'https://office.example.com'
Document URL: $currentObject/DocumentUrl
Callback URL: $currentObject/CallbackUrl
Language: 'zh-CN'
```

组件会尽量从 `Document URL` 自动推导：

| 自动项 | 规则 |
| --- | --- |
| Document title | 从 URL 最后一段文件名推导，例如 `/files/test.docx` 得到 `test.docx`。 |
| File type | 从文件名扩展名推导，例如 `test.docx` 得到 `docx`。 |
| Document type | 根据扩展名自动选择 `Word`、`Spreadsheet`、`Presentation` 或 `PDF`。 |
| Document key | 如果未配置，则根据 `Document URL` 和扩展名生成一个稳定 key。 |

URL 如果不是直接以文件名结尾，也可以通过查询参数提供文件名：

```text
https://app.example.com/rest/files/download?id=123&filename=test.docx
```

组件会识别 `filename`、`fileName` 或 `name` 参数。

## 组件配置

### OnlyOffice Server

| 属性 | 必填 | 说明 | 示例 |
| --- | --- | --- | --- |
| Document server URL | 是 | OnlyOffice Document Server 的基础地址，不要填写 `/web-apps/...` 后缀。 | `https://office.example.com` |
| JWT token | 否 | 如果 Document Server 开启 JWT，需要由 Mendix 后端生成 token 后传入。 | `$currentObject/OnlyOfficeToken` |

### Document

| 属性 | 必填 | 说明 | 示例 |
| --- | --- | --- | --- |
| Document URL | 是 | 文档下载地址。OnlyOffice 服务端会通过这个地址拉取文件。必须是绝对 URL。 | `https://app.example.com/rest/files/test.docx` |
| Document key | 否 | 文档唯一版本 key。留空时组件会根据 URL 自动生成。文件内容更新后建议主动传入新 key。 | `$currentObject/DocumentKey` |
| Document title | 否 | OnlyOffice 中显示的文件名。留空时从 URL 自动推导。 | `合同.docx` |
| File type | 否 | 文件扩展名，不带点。留空时从文件名自动推导。 | `docx`、`xlsx`、`pptx`、`pdf` |
| Document type | 是 | 兜底文档类型。只要识别到扩展名，组件会自动覆盖为正确类型。 | `Word` |

### Editor

| 属性 | 必填 | 说明 | 推荐值 |
| --- | --- | --- | --- |
| Mode | 是 | 编辑器模式。`Edit` 可编辑，`View` 只读查看。 | `Edit` |
| Editor type | 是 | OnlyOffice UI 类型。桌面 Web 页面通常用 `Desktop`。 | `Desktop` |
| Language | 否 | 编辑器语言代码。 | `zh-CN` |
| Callback URL | 否 | OnlyOffice 保存回调地址。编辑文档时通常需要配置。 | `https://app.example.com/rest/onlyoffice/callback/123` |
| Height | 是 | 编辑器高度，单位 px。 | `720` |

### User

| 属性 | 必填 | 说明 | 示例 |
| --- | --- | --- | --- |
| User ID | 否 | 当前用户唯一标识，会传给 OnlyOffice。 | `[%CurrentUser%]` 或用户对象 ID |
| User name | 否 | 当前用户显示名称，会传给 OnlyOffice。 | `$currentUser/Name` |

### Permissions

| 属性 | 说明 |
| --- | --- |
| Edit | 是否允许编辑。`Mode` 为 `View` 时会被忽略。 |
| Download | 是否允许下载。关闭后 OnlyOffice 会隐藏下载入口。 |
| Print | 是否允许打印。 |
| Review | 是否允许审阅修订。 |
| Comment | 是否允许评论。 |

### Events

| 事件 | 触发时机 | 用途 |
| --- | --- | --- |
| On ready | OnlyOffice 编辑器加载完成。 | 记录日志、更新页面状态。 |
| On document state change | 文档修改状态变化。 | 标记有未保存修改。 |
| On error | OnlyOffice 初始化或运行时报错。 | 弹出错误提示、记录异常。 |

## 注意事项

- `Document URL` 必须能被 OnlyOffice Document Server 访问，不只是浏览器能访问。
- 如果 Mendix 应用需要登录才能下载文件，建议提供一个带签名或临时 token 的下载 URL。
- 自动生成的 `Document key` 只和 URL 有关。如果同一个 URL 的文件内容会更新，建议你显式配置 `Document key`，并在文件版本变化时同步变化。
- 只允许编辑和查看、不允许下载时，把 `Download` 关闭；如果还要限制内容外流，建议同时关闭 `Print`。
- 开启 OnlyOffice JWT 后，`JWT token` 必须由 Mendix 后端按 OnlyOffice 配置生成，不能在前端硬编码密钥。
- 编辑保存需要后端实现 `Callback URL`，接收 OnlyOffice 回调中的文件地址并保存回 Mendix。

## 开发

安装依赖：

```powershell
npm install
```

构建：

```powershell
npm.cmd run build
```

发布 mpk：

```powershell
npm.cmd run release
```

生成文件位于：

```text
dist/1.0.0/mendix.OnlyOffice.mpk
```
