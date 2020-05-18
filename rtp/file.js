const { BaseCtrl } = require('tms-koa/lib/controller/fs/base')
const { LocalFS } = require('tms-koa/lib/model/fs/local')
const { ResultData, ResultFault } = require('tms-koa')
const FfmpegStatck = require('../utils/stack')
const { CtrlBase, attachBaseEvent } = require('./base')

const log4js = require('@log4js-node/log4js-api')
const logger = log4js.getLogger('tms-koa-ffmpeg-file')

function ffprobe(cmd, filepath) {
  return new Promise((resolve) => {
    cmd.input(filepath).ffprobe((err, metadata) => {
      resolve(metadata)
    })
  })
}

class RTPFile extends BaseCtrl {
  constructor(...args) {
    super(...args)
  }
  /**
   * 播放指定的文件
   */
  async play() {
    const {
      path,
      address,
      aport,
      vport,
      acodec,
      vcodec,
      seek,
    } = this.request.query

    if (!parseInt(aport) && !parseInt(vport))
      return new ResultFault('没有指定有效的RTP接收端口')

    const localFS = new LocalFS(this.domain, this.bucket)

    if (!localFS.existsSync(path)) return new ResultFault('指定的文件不存在')

    const fullpath = localFS.fullpath(path)

    const cmd = FfmpegStatck.createCommand()
    attachBaseEvent(this, cmd, logger)

    const metadata = await ffprobe(cmd, fullpath)

    let hasAudio, hasVideo
    metadata.streams.forEach((stream) => {
      if (stream.codec_type === 'video') hasVideo = true
      else if (stream.codec_type === 'audio') hasAudio = true
    })
    cmd.inputOptions('-re')

    if (seek) cmd.seekInput(seek)

    if (hasAudio && parseInt(aport))
      cmd
        .output(`rtp://${address}:${aport}`)
        .noVideo()
        .audioCodec('libopus')
        .format('rtp')

    if (hasVideo && parseInt(vport)) {
      cmd.output(`rtp://${address}:${vport}`).noAudio()
      if (/vp8/i.test(vcodec)) {
        cmd.videoCodec('libvpx')
      } else {
        cmd.videoCodec('libx264').outputOptions('-profile:v baseline')
      }
      cmd.format('rtp')
    }
    cmd.run()

    return new ResultData({ cid: cmd.uuid, format: metadata.format })
  }
}

Object.assign(RTPFile.prototype, CtrlBase)

module.exports = RTPFile
