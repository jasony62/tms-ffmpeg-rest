const fs = require('fs')
const { BaseCtrl } = require('tms-koa/lib/controller/fs/base')
const { ResultData } = require('tms-koa/lib/response')

class Main extends BaseCtrl {
  /**
   * 保存测试流
   */
  test() {
    let pk = fs.readFileSync(__dirname + '/package.json')
    pk = JSON.parse(pk)
    return new ResultData(pk.version)
  }
}
module.exports = Main
