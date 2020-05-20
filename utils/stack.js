/**
 * 管理所有ffmpeg命令
 */
const os = require('os')
const fs = require('fs')
const path = require('path')
const tmp = require('tmp')
const { nanoid } = require('nanoid')
const ffmpeg = require('fluent-ffmpeg')

const RunningCommands = new Map()

// 当前正在播放文件的软链接
const PLAYING_SYMLINK = Symbol('playing_symlink')

// 接收RTP进行录制时的临时SDP文件
const PLAYING_SDPFILE = Symbol('playing_sdpfile')

let playingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tms-koa-ffmpeg-'))

class CommandStack {
  /**
   *
   */
  static createCommand() {
    const cmd = ffmpeg()
    cmd.uuid = nanoid()
    RunningCommands.set(cmd.uuid, cmd)

    return cmd
  }
  /**
   *
   * @param {*} uuid
   */
  static getCommand(uuid) {
    return RunningCommands.get(uuid)
  }
  /**
   *
   * @param {string} uuid
   */
  static removeCommand(uuid) {
    const cmd = RunningCommands.get(uuid)
    if (cmd) {
      if (cmd[PLAYING_SYMLINK]) {
        if (fs.existsSync(cmd[PLAYING_SYMLINK]))
          fs.unlinkSync(cmd[PLAYING_SYMLINK])
      }
      if (cmd[PLAYING_SDPFILE] && cmd[PLAYING_SDPFILE].name) {
        if (fs.existsSync(cmd[PLAYING_SDPFILE].name)) {
          fs.unlinkSync(cmd[PLAYING_SDPFILE].name)
        }
      }
    }

    return RunningCommands.delete(uuid)
  }
  /**
   * 创建播放文件软链接
   *
   * @param {*} cmd
   * @param {*} fullpath
   */
  static createPlayingSymlink(cmd, fullpath) {
    if (!fs.existsSync(playingDir))
      playingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tms-koa-ffmpeg-'))

    const ext = fullpath.split('.').pop()
    let link = path.join(playingDir, `${nanoid(10)}.${ext}`)

    fs.symlinkSync(path.resolve(fullpath), path.resolve(link))

    cmd[PLAYING_SYMLINK] = link

    return link
  }
  /**
   *
   * @param {*} cmd
   * @param {*} fullpath
   */
  static shiftPlayingSymlink(cmd, fullpath) {
    const link = cmd[PLAYING_SYMLINK]
    if (fs.existsSync(link)) fs.unlinkSync(link)

    fs.symlinkSync(path.resolve(fullpath), path.resolve(link))

    return link
  }
  /**
   *
   * @param {*} cmd
   */
  static getPlayingSymlink(cmd) {
    return cmd[PLAYING_SYMLINK]
  }
  /**
   * 创建临时sdp文件
   *
   * @param {*} cmd
   * @param {*} fullpath
   */
  static createPlayingSdpfile(cmd) {
    const tmpSdp = tmp.fileSync()

    cmd[PLAYING_SDPFILE] = tmpSdp

    return tmpSdp.name
  }
  /**
   *
   * @param {*} cmd
   */
  static getPlayingSdpfile(cmd) {
    return cmd[PLAYING_SDPFILE] ? cmd[PLAYING_SDPFILE].name : null
  }
}

module.exports = CommandStack
