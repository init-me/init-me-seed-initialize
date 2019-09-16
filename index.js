const inquirer = require('inquirer')
const extOs = require('yyl-os')
const fs = require('fs')
const path = require('path')
const rp = require('yyl-replacer')
const print = require('yyl-print')

const lang = {
  QUEATION_SELECT_TYPE: '请选择构建方式',
  QUESTION_NAME: '项目名称',
  QUESTION_ANCHOR: '作者',
  QUESTION_VERSION: '项目版本',
  TYPE_ERROR: 'env.type 不存在',
  FORMAT_FILE_START: '正在格式化文件',
  FORMAT_FILE_FINISHED: '格式化文件 完成',
  NPM_INSTALL_START: '正在安装依赖',
  NPM_INSTALL_FINISHED: '安装依赖 完成'
}
const SEED_PATH = path.join(__dirname, './seeds')

let initData = {
  name: '',
  type: '',
  version: ''
}

const config = {
  path: './seeds/base',
  hooks: {
    async beforeStart({ env, targetPath }) {
      const types = fs.readdirSync(SEED_PATH).filter((iPath) => {
        return !(/^\./.test(iPath))
      })

      const questions = []

      // type
      if (types.length === 1) {
        initData.type = types[0]
      } else {
        if (env && env.type) {
          if (types.indexOf(env.type) !== -1) {
            initData.type = env.type
          } else {
            throw new Error(`${lang.TYPE_ERROR}: ${env.type}`)
          }
        } else {
          questions.push({
            type: 'list',
            name: 'type',
            message: `${lang.QUEATION_SELECT_TYPE}:`,
            default: types[0],
            choices: types
          })
        }
      }

      // name
      if (env && env.name) {
        initData.name = env.name
      } else {
        questions.push({
          type: 'input',
          name: 'name',
          default: path.dirname(targetPath).split(/[\\/]/).pop(),
          message: `${lang.QUESTION_NAME}:`
        })
      }

      if (questions.length) {
        const r = await inquirer.prompt(questions)
        if (r.name) {
          initData = Object.assign(initData, r)
        }
      }

      // version
      if (env && env.version) {
        initData.version = env.version
      } else {
        questions.push({
          name: 'version',
          type: 'input',
          default: '0.1.0',
          message: `${lang.QUESTION_VERSION}`
        })
      }

      config.path = path.join(SEED_PATH, initData.type)
    },
    beforeCopy({ fileMap, targetPath }) {
      fileMap[path.join(config.path, 'gitignore')] = [
        path.join(targetPath, '.gitignore')
      ]

      fileMap[path.join(config.path, 'npmignore')] = [
        path.join(targetPath, '.npmignore')
      ]

      fileMap[path.join(config.path, 'test/index.js')] = [
        path.join(targetPath, 'test/test.js')
      ]

      return Promise.resolve(fileMap)
    },
    async afterCopy({ targetPath, env }) {
      print.log.info(lang.FORMAT_FILE_START)
      const rPaths = [
        path.join(targetPath, 'package.json')
      ]
      rPaths.forEach((iPath) => {
        let cnt = fs.readFileSync(iPath).toString()
        fs.writeFileSync(iPath, rp.dataRender(cnt, initData))
        print.log.update(iPath)
      })
      print.log.success(lang.FORMAT_FILE_FINISHED)

      if (!env || !env.noinstall) {
        print.log.info(lang.NPM_INSTALL_START)
        await extOs.runCMD('npm install', targetPath)
        print.log.success(lang.NPM_INSTALL_FINISHED)
      }
    }
  }
}

module.exports = config