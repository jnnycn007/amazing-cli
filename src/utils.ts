import { exec } from 'child_process'
// 执行 Git 命令的函数
export const executeGitCommand = (command: string) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
        return
      }
      resolve(stdout.trim())
    })
  })
}
export const getDateTimeNow = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0') // getMonth() 返回 0-11，表示 1-12 月
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
// 预置模版
export const templates = [
  {
    name: 'web-vue',
    value: 'git@github.com:themusecatcher/web-vue.git'
  },
  {
    name: 'taro-vue',
    value: 'git@github.com:themusecatcher/taro-vue.git'
  },
  {
    name: 'naive-ui-admin',
    value: 'git@github.com:jekip/naive-ui-admin.git'
  },
  {
    name: 'vue-vben-admin',
    value: 'git@github.com:vbenjs/vue-vben-admin.git'
  }
]
