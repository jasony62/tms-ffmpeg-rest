const fs = require('fs')
const { Upload } = require('tms-koa/lib/model/fs/upload')
const { LocalFS } = require('tms-koa/lib/model/fs/local')

const { BaseCtrl } = require('tms-koa/lib/controller/fs/base')
const { ResultData, ResultFault } = require('tms-koa')
const FfmpegStatck = require('../utils/stack')
const { CtrlBase, attachBaseEvent } = require('../base')

const log4js = require('@log4js-node/log4js-api')
const logger = log4js.getLogger('tms-koa-ffmpeg-save-rtp')

class SaveRTP extends BaseCtrl {
  constructor(...args) {
    super(...args)
  }
  /**
   * 将RTP包保存为媒体文件
   */
  receive() {
    let { path, ext } = this.request.query
    if (!path && !ext)
      return new ResultFault('没有指定要保存文件的路径或扩展名')

    const localFS = new LocalFS(this.domain, this.bucket)

    if (ext) {
      /* 如果指定的是扩展名，自动生成文件名 */
      const upload = new Upload(localFS)
      path = upload.storename(ext)
    } else {
      /* 不允许覆盖已经存在的文件 */
      if (localFS.existsSync(path)) return new ResultFault('指定的文件已经存在')
    }
    localFS.write(path, '')

    let { sdpfile } = this.request.query

    let cmd

    if (sdpfile) {
      if (!fs.existsSync(sdpfile)) return new ResultFault('指定sdp文件不存在')

      cmd = FfmpegStatck.createCommand()
    } else {
      const { aport, apt, artpmap, vport, vpt, vrtpmap } = this.request.query

      if (!parseInt(aport) && !parseInt(vport))
        return new ResultFault('没有指定接收端口')

      if (parseInt(aport)) {
        if (!apt) return new ResultFault('没有指定音频媒体payload_type参数')
        if (!artpmap) return new ResultFault('没有音频指定媒体rtpmap参数')
      }

      if (parseInt(vport)) {
        if (!vpt) return new ResultFault('没有指定视频媒体payload_type参数')
        if (!vrtpmap) return new ResultFault('没有视频指定媒体rtpmap参数')
      }

      cmd = FfmpegStatck.createCommand()
      sdpfile = FfmpegStatck.createPlayingSdpfile(cmd)

      const sdpStream = fs.createWriteStream(sdpfile)

      sdpStream.write('v=0\n')
      sdpStream.write('c=IN IP4 0.0.0.0\n')
      sdpStream.write('t=0 0\n')

      if (parseInt(aport)) {
        sdpStream.write(`m=audio ${aport} RTP/AVP ${apt}\n`)
        sdpStream.write(`a=rtpmap:${apt} ${artpmap}\n`)
      }
      if (parseInt(vport)) {
        sdpStream.write(`m=video ${vport} RTP/AVP ${vpt}\n`)
        sdpStream.write(`a=rtpmap:${vpt} ${vrtpmap}\n`)
      }
      sdpStream.end()
    }

    /* 控制器添加公共方法 */
    attachBaseEvent(this, cmd, logger)

    const fullpath = localFS.fullpath(path)

    cmd.input(sdpfile)
    cmd.inputOptions('-protocol_whitelist file,udp,rtp')
    cmd.output(fullpath)
    cmd.run()

    return new ResultData({ cid: cmd.uuid })
  }
}

Object.assign(SaveRTP.prototype, CtrlBase)

module.exports = SaveRTP
