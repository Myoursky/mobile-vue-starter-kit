// 导入路由
const http = require('http')
const express = require('express')
const cors = require('cors')

const app = express()
const data = require('./data')
// 跨域
app.use(cors())

app.use('/api', data)
// 启动服务
http.createServer(app).listen(3001)
