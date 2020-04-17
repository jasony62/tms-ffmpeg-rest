const { BaseCtrl } = require('tms-koa/lib/controller/fs/base')
const { ResultData, ResultFault } = require('tms-koa/lib/response')
const { LocalFS } = require('tms-koa/lib/model/fs/local')
var ffmpeg = require('fluent-ffmpeg')

class Main extends BaseCtrl {
  /**
   * 播放测试流
   */
  test() {
    const { address, aport, vport } = this.request.query

    ffmpeg()
      .input('testsrc=duration=300:size=320x240:rate=30')
      .inputFormat('lavfi')
      .output(`rtp://${address}:${vport}`)
      .format('rtp')
      .run()

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
