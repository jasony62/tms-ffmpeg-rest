# tms-ffmpeg-rest

`tms-koa`插件，通过接口操作`ffmpeg`，增强文件服务，实现播放媒体文件。

支持将媒体文件转为`RTP`流播放。

# 安装

在使用`tms-koa`框架的项目中安装。参见`tms-koa`框架中“用 npm 包作为控制器”的相关内容。

> cnpm i tms-koa-ffmpeg

# 运行 demo

> cd demo

## 安装并启动

若要在本地运行，需安装 ffmpeg。

> cnmp i

> node demo/server

---

或在 docker 中运行。

> docker-compose up

---

检查是否正常运行

> curl "http://localhost:3000/ffmpeg/test"

## 准备媒体文件

在`files/upload`目录下放一个`mp4`格式文件，例如：123.mp4。

## 启动 RTP 接收端

可以使用`vlc`播放器作为 RTP 接收端。

参照如下格式新建 sdp 文件（或使用 demo/test.sdp），音频端口为 5002，视频端口为 5004，用`vlc`打开。

```
v=0
o=- 0 0 IN IP4 127.0.0.1
s=No Name
t=0 0
a=tool:libavformat 58.26.101
m=audio 5002 RTP/AVP 97
c=IN IP4 127.0.0.1
b=AS:64
a=rtpmap:97 opus/48000/2
m=video 5004 RTP/AVP 96
c=IN IP4 127.0.0.1
b=AS:200
a=rtpmap:96 H264/90000
```

## 播放文件

> curl "http://localhost:3000/ffmpeg/rtp/file/play?path=123.mp4&address=127.0.0.1&aport=5002&vport=5004"

# API 说明

用 RTP 包将指定媒体发送到指定接收位置。

## 播放测试流

> curl "http://localhost:3000/ffmpeg/rtp/test/play?address=127.0.0.1&vport=5002&aport=5004&duration=10"

| 参数     | 说明                                 |
| -------- | ------------------------------------ |
| address  | 接收 rtp 包的地址                    |
| vport    | 接收视频包的端口                     |
| vcodec   | H264 或 VP8                          |
| aport    | 接收音频包的端口                     |
| duration | 播放持续时长（秒）。默认一直播放。   |
| socketid | 传送接收推送消息的`socket.io`实例 id |

返回命令 id

```
{"cid":"13592d22-9102-403b-84e6-d425431ad82c"}
```

音频和视频端口至少指定一个。

## 播放文件

> curl "http://localhost:3000/ffmpeg/rtp/file/play?path=&address=&vport=&aport="

| 参数     | 说明                                          | 必填 |
| -------- | --------------------------------------------- | ---- |
| socketid | 传送接收推送消息的`socket.io`实例 id          | 是   |
| path     | 指定媒体文件路径（参考 tms-koa 文件管理服务） | 是   |
| address  | 接收 rtp 包的地址                             | 是   |
| vport    | 接收视频包的端口                              | 否   |
| vcodec   | H264 或 VP8                                   | 否   |
| aport    | 接收音频包的端口                              | 否   |
| seek     | 从指定位置开始播放                            | 否   |

`vport`和`aport`至少要指定一个。

返回命令 id

```
{"cid":"13592d22-9102-403b-84e6-d425431ad82c","format":"通过ffprobe获得的文件信息"}
```

## 播放图片

> curl "http://localhost:3000/ffmpeg/rtp/image/play?path=&address=&vport="

| 参数     | 说明                                          |
| -------- | --------------------------------------------- |
| path     | 指定图片文件路径（参考 tms-koa 文件管理服务） |
| address  | 接收 rtp 包的地址                             |
| vport    | 接收视频包的端口                              |
| vcodec   | H264 或 VP8                                   |
| socketid | 传送接收推送消息的`socket.io`实例 id          |

返回命令 id

```
{"cid":"13592d22-9102-403b-84e6-d425431ad82c"}
```

## 停止播放

> curl "http://localhost:3003/ffmpeg/rtp/image/shift?path=&cid="

| 参数 | 说明                                          |
| ---- | --------------------------------------------- |
| path | 指定图片文件路径（参考 tms-koa 文件管理服务） |
| cid  | 命令 Id                                       |

## 停止播放

> curl "http://localhost:3003/ffmpeg/rtp/test/stop?cid="

> curl "http://localhost:3003/ffmpeg/rtp/file/stop?cid="

> curl "http://localhost:3003/ffmpeg/rtp/image/stop?cid="

| 参数 | 说明    |
| ---- | ------- |
| cid  | 命令 Id |

## 暂停播放

> curl "http://localhost:3003/ffmpeg/rtp/test/pause?cid="

> curl "http://localhost:3003/ffmpeg/rtp/file/pause?cid="

| 参数 | 说明    |
| ---- | ------- |
| cid  | 命令 Id |

## 恢复播放

> curl "http://localhost:3003/ffmpeg/rtp/test/resume?cid="

> curl "http://localhost:3003/ffmpeg/rtp/file/resume?cid="

| 参数 | 说明    |
| ---- | ------- |
| cid  | 命令 Id |

# 事件推送

如果`tms-koa`框架启动了推送服务，`tms-koa-ffmpeg`会推送媒体流处理事件。

| 事件  | 说明             |
| ----- | ---------------- |
| start | 启动`ffmpeg`命令 |
| end   | 结束`ffmpeg`命令 |

参见：`public/index.html`
