const fs = require('fs')
const { BaseCtrl } = require('tms-koa/lib/controller/fs/base')
const { LocalFS } = require('tms-koa/lib/model/fs/local')
const { ResultData, ResultFault } = require('tms-koa')
const FfmpegStatck = require('../utils/stack')
const { CtrlBase, attachBaseEvent } = require('./base')

const log4js = require('@log4js-node/log4js-api')
const logger = log4js.getLogger('tms-koa-ffmpeg-image')

class RTPImage extends BaseCtrl {
  constructor(...args) {
    super(...args)
  }
  /**
   * 播放指定的图片
   */
  play() {
    const { path, address, vport } = this.request.query

    if (!parseInt(vport)) return new ResultFault('没有指定有效的RTP接收端口')

    const localFS = new LocalFS(this.domain, this.bucket)

    if (!localFS.existsSync(path)) return new ResultFault('指定的文件不存在')

    const fullpath = localFS.fullpath(path)

    const cmd = FfmpegStatck.createCommand()
    const playingSymlink = FfmpegStatck.createPlayingSymlink(cmd, fullpath)
    if (!fs.existsSync(playingSymlink))
      return new ResultFault(`无法创建播放文件: ${playingSymlink}`)

    cmd
      .input(playingSymlink)
      .inputFormat('image2')
      .loop()
      .output(`rtp://${address}:${vport}`)
      .noAudio()
      .videoCodec('libvpx')
      .format('rtp')

    attachBaseEvent(this, cmd, logger)

    cmd.run()

    return new ResultData({ cid: cmd.uuid })
  }
  /**
   * 切换图片
   */
  shift() {
    const { cid, path } = this.request.query
    const cmd = FfmpegStatck.getCommand(cid)
    if (!cmd) return new ResultFault('指定的Ffmpeg命令不存在')

    const localFS = new LocalFS(this.domain, this.bucket)

    if (!localFS.existsSync(path)) return new ResultFault('指定的文件不存在')

    const fullpath = localFS.fullpath(path)

    /*替换链接文件*/
    FfmpegStatck.shiftPlayingSymlink(cmd, fullpath)

    return new ResultData('ok')
  }
}

Object.assign(RTPImage.prototype, CtrlBase)

module.exports = RTPImage
