const { BaseCtrl } = require('tms-koa/lib/controller/fs/base')
const { ResultData } = require('tms-koa/lib/response')

class Main extends BaseCtrl {
  /**
   * 保存测试流
   */
  test() {
    let pkg = require(__dirname + '/package.json')
    return new ResultData(pkg.version)
  }
}
module.exports = Main
