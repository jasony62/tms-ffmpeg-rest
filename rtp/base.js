const { ResultData, ResultObjectNotFound } = require('tms-koa')
const FfmpegStatck = require('../utils/stack')
/**
 * 控制RTP的公共方法
 */
const CtrlBase = {
  /**
   * 结束播放
   */
  stop() {
    const { cid } = this.request.query
    const cmd = FfmpegStatck.getCommand(cid)
    if (!cmd) return new ResultObjectNotFound()

    cmd.kill()

    return new ResultData('ok')
  },
  /**
   * 暂停播放
   */
  pause() {
    const { cid } = this.request.query
    const cmd = FfmpegStatck.getCommand(cid)
    if (!cmd) return new ResultObjectNotFound()
    cmd.kill('SIGSTOP')

    return new ResultData('ok')
  },
  /**
   * 恢复播放
   */
  resume() {
    const { cid } = this.request.query
    const cmd = FfmpegStatck.getCommand(cid)
    if (!cmd) return new ResultObjectNotFound()
    cmd.kill('SIGCONT')

    return new ResultData('ok')
  },
}
/**
 * ffmpeg事件的公共方法
 */
class EventBase {
  constructor(host, cmd, logger) {
    this.host = host
    this.cmd = cmd
    this.logger = logger
    this.cid = cmd.uuid
  }
  start(commandLine) {
    this.logger.debug(`开始播放[${this.cid}]：` + commandLine)
    if (this.host.socket) {
      this.host.socket.emit('tms-koa-ffmpeg', {
        status: 'started',
      })
    }
  }
  end() {
    this.logger.debug(`播放结束[${this.cid}]`)
    FfmpegStatck.removeCommand(this.cid)
    if (this.host.socket) {
      this.host.socket.emit('tms-koa-ffmpeg', {
        status: 'ended',
      })
    }
  }
  error(err) {
    if (err.message === 'ffmpeg was killed with signal SIGKILL') {
      if (this.host.socket) {
        this.host.socket.emit('tms-koa-ffmpeg', {
          status: 'killed',
        })
      }
    } else this.logger.error(`发生错误[${this.cid}]：` + err.message)

    FfmpegStatck.removeCommand(this.cid)
  }
}

function attachBaseEvent(host, cmd, logger) {
  const evt = new EventBase(host, cmd, logger)
  cmd
    .on('start', evt.start.bind(evt))
    .on('end', evt.end.bind(evt))
    .on('error', evt.error.bind(evt))

  return cmd
}

module.exports = { CtrlBase, attachBaseEvent }
