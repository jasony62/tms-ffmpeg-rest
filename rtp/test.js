const { Ctrl, ResultData } = require('tms-koa')
const FfmpegStatck = require('../utils/stack')
const RTPBase = require('./base')

class RTPTest extends Ctrl {
  constructor(...args) {
    super(...args)
  }
  /**
   * 播放测试流
   */
  play() {
    const { address, aport, vport } = this.request.query

    const cmd = FfmpegStatck.createCommand()
    cmd
      .input('smptebars')
      .inputFormat('lavfi')
      .output(`rtp://${address}:${vport}`)
      .videoCodec('libvpx')
      .format('rtp')
      .on('start', (commandLine) => {
        console.log('Spawned Ffmpeg with command: ' + commandLine)
      })
      .on('codecData', (data) => {
        console.log(
          'Input is ' + data.audio + ' audio ' + 'with ' + data.video + ' video'
        )
      })
      // .on('progress', function (progress) {
      //   console.log('Processing: ' + progress.percent + '% done')
      // })
      .on('end', () => {
        console.log('tms-koa-ffmpeg RTP Finished processing')
        FfmpegStatck.removeCommand(cmd.uuid)
      })
      .on('error', (err, stdout, stderr) => {
        console.log('tms-koa-ffmpeg Cannot process video: ' + err.message)
      })
      .run()

    return new ResultData(cmd.uuid)
  }
}

Object.assign(RTPTest.prototype, RTPBase)

module.exports = RTPTest
