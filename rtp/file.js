const { BaseCtrl } = require('tms-koa/lib/controller/fs/base')
const { ResultData } = require('tms-koa')
const FfmpegStatck = require('../utils/stack')
const RTPBase = require('./base')

class RTPFile extends BaseCtrl {
  constructor(...args) {
    super(...args)
  }
  /**
   * 播放指定的文件
   */
  play() {
    const { path, address, aport, vport } = this.request.query

    const localFS = new LocalFS(this.domain, this.bucket)

    const fullpath = localFS.fullpath(path)

    const cmd = FfmpegStatck.createCommand()
    cmd
      .input(fullpath)
      .inputOptions('-re')
      .noAudio()
      .output(`rtp://${address}:${vport}`)
      .videoCodec('libvpx')
      .format('rtp')
      .on('start', (commandLine) => {
        console.log('Spawned Ffmpeg with command: ' + commandLine)
      })
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

module.exports = RTPFile
