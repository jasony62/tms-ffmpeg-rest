const { Ctrl, ResultData, ResultFault } = require('tms-koa')
const FfmpegStatck = require('../utils/stack')
const { CtrlBase, attachBaseEvent } = require('./base')

const log4js = require('@log4js-node/log4js-api')
const logger = log4js.getLogger('tms-koa-ffmpeg-test')

class RTPTest extends Ctrl {
  constructor(...args) {
    super(...args)
  }
  /**
   * 播放测试流
   */
  play() {
    const { address, aport, vport, duration } = this.request.query

    if (!parseInt(aport) && !parseInt(vport))
      return new ResultFault('没有指定有效的RTP接收端口')

    const cmd = FfmpegStatck.createCommand()

    if (parseInt(aport)) {
      const sine = parseInt(duration) ? `sine=d=${duration}` : 'sine'
      cmd
        .input(sine)
        .inputOptions('-re')
        .inputFormat('lavfi')
        .output(`rtp://${address}:${aport}`)
        .noVideo()
        .audioCodec('libopus')
        .format('rtp')
    }

    if (parseInt(vport)) {
      const smptebars = parseInt(duration)
        ? `smptebars=d=${duration}`
        : 'smptebars'
      cmd
        .input(smptebars)
        .inputOptions('-re')
        .inputFormat('lavfi')
        .output(`rtp://${address}:${vport}`)
        .noAudio()
        .videoCodec('libvpx')
        .format('rtp')
    }

    attachBaseEvent(this, cmd, logger)

    cmd.run()

    return new ResultData({ cid: cmd.uuid })
  }
}

Object.assign(RTPTest.prototype, CtrlBase)

module.exports = RTPTest
