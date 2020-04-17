const { BaseCtrl } = require('tms-koa/lib/controller/fs/base')
const { ResultData } = require('tms-koa/lib/response')

class Main extends BaseCtrl {
  /**
   * 保存测试流
   */
  test() {
    return new ResultData('ok')
  }
}
module.exports = Main
