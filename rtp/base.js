const { ResultData } = require('tms-koa')
const FfmpegStatck = require('../utils/stack')
/**
 * 控制RTP基本方法
 */
const RTPBase = {
  /**
   * 结束播放
   */
  stop() {
    const { cid } = this.request.query
    const cmd = FfmpegStatck.getCommand(cid)
    cmd.kill()

    return new ResultData('ok')
  },
  /**
   * 暂停播放
   */
  pause() {
    const { cid } = this.request.query
    const cmd = FfmpegStatck.getCommand(cid)
    cmd.kill('SIGSTOP')

    return new ResultData('ok')
  },
  /**
   * 恢复播放
   */
  resume() {
    const { cid } = this.request.query
    const cmd = FfmpegStatck.getCommand(cid)
    cmd.kill('SIGCONT')

    return new ResultData('ok')
  },
}
module.exports = RTPBase
