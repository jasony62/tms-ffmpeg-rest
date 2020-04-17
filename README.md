# tms-ffmpeg-rest

`tms-koa`插件，增强文件服务，通过 rest 接口操作`ffmpeg`，处理文件服务管理的本地文件。

# 安装

在使用`tms-koa`框架的项目中安装。

> cnpm i tms-koa-ffmpeg

# 运行 demo

> cd demo

> cnmp i

> node demo/server

## 准备媒体文件

在`files/upload`目录下放一个`mp4`格式文件，例如：123.mp4。

## 启动 RTP 接收端

可以使用`vlc`播放器作为 RTP 接收端。

参照如下格式新建 sdp 文件，用`vlc`打开。

```
v=0
o=- 0 0 IN IP4 127.0.0.1
s=No Name
c=IN IP4 127.0.0.1
t=0 0
a=tool:libavformat 58.26.101
m=video 5014 RTP/AVP 96
b=AS:200
a=rtpmap:96 MP4V-ES/90000
a=fmtp:96 profile-level-id=1
```

## 播放文件

> curl "http://localhost:3003/ffmpeg/rtp/play?path=123.mp4&address=127.0.0.1&vport=5014"

# rtp

用 RTP 包将指定媒体发送到指定接收位置。

## 发送测试包

> curl "http://localhost:3003/ffmpeg/rtp/test?address=&vport=&aport="

| 参数    | 说明              |
| ------- | ----------------- |
| address | 接收 rtp 包的地址 |
| vport   | 接收视频包的端口  |
| aport   | 接收音频包的端口  |

## 发送文件包

> curl "http://localhost:3003/ffmpeg/rtp/play?path=&address=&vport=&aport="

| 参数    | 说明                                          |
| ------- | --------------------------------------------- |
| path    | 指定媒体文件路径（参考 tms-koa 文件管理服务） |
| address | 接收 rtp 包的地址                             |
| vport   | 接收视频包的端口                              |
| aport   | 接收音频包的端口                              |
