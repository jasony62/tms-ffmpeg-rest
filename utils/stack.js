/**
 * 管理所有ffmpeg命令
 */
const { v4: uuidv4 } = require('uuid')
const ffmpeg = require('fluent-ffmpeg')

const RunningCommands = new Map()

class CommandStack {
  /**
   *
   */
  static createCommand() {
    const cmd = ffmpeg()
    cmd.uuid = uuidv4()
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
    return RunningCommands.delete(uuid)
  }
}

module.exports = CommandStack
