const { BaseCtrl } = require('tms-koa/lib/controller/fs/base')
const { ResultData, ResultFault } = require('tms-koa/lib/response')
const { LocalFS } = require('tms-koa/lib/model/fs/local')
const FfmpegStatck = require('./utils/stack')
var ffmpeg = require('fluent-ffmpeg')

class Main extends BaseCtrl {
  /**
   * 播放测试流
   */
  test() {
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
  /**
   * 结束播放
   */
  stop() {
    const { uuid } = this.request.query
    const cmd = FfmpegStatck.getCommand(uuid)
    cmd.kill()

    return new ResultData('ok')
  }
  /**
   * 播放指定的文件
   */
  play() {
    const { path, address, aport, vport } = this.request.query

    const localFS = new LocalFS(this.domain, this.bucket)

    const fullpath = localFS.fullpath(path)

    ffmpeg()
      .input(fullpath)
      .output(`rtp://${address}:${vport}`)
      .format('rtp')
      .run()

    return new ResultData(`path：${fullpath}`)
  }
}
module.exports = Main
