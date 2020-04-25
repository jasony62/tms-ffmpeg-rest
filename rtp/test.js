const { Ctrl, ResultData, ResultFault } = require('tms-koa')
const FfmpegStatck = require('../utils/stack')
const RTPBase = require('./base')

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
    const { address, aport, vport } = this.request.query

    if (!parseInt(aport) && !parseInt(vport))
      return new ResultFault('没有指定有效的RTP接收端口')

    const cmd = FfmpegStatck.createCommand()

    if (parseInt(aport))
      cmd
        .input('sine')
        .inputFormat('lavfi')
        .output(`rtp://${address}:${aport}`)
        .noVideo()
        .audioCodec('libopus')
        .format('rtp')

    if (parseInt(vport))
      cmd
        .input('smptebars')
        .inputFormat('lavfi')
        .output(`rtp://${address}:${vport}`)
        .noAudio()
        .videoCodec('libvpx')
        .format('rtp')

    cmd
      .on('start', (commandLine) => {
        logger.debug('Spawned Ffmpeg with command: ' + commandLine)
      })
      .on('codecData', (data) => {
        logger.debug(
          'Input is ' + data.audio + ' audio ' + 'with ' + data.video + ' video'
        )
      })
      .on('end', () => {
        logger.debug('RTP Finished processing')
        FfmpegStatck.removeCommand(cmd.uuid)
      })
      .on('error', (err) => {
        if (err.message !== 'ffmpeg was killed with signal SIGKILL')
          logger.error('Cannot process video: ' + err.message)
      })
      .run()

    return new ResultData({ cid: cmd.uuid })
  }
}

Object.assign(RTPTest.prototype, RTPBase)

module.exports = RTPTest
