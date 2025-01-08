#!/usr/bin/env node
import { Command } from 'commander' // 命令行自定义指令
const program = new Command()
import ora from 'ora' // 控制台 loading 样式
import type { Ora } from 'ora'
import inquirer from 'inquirer' // 命令行询问用户问题，记录回答结果
import chalk from 'chalk' // 控制台输出内容样式美化
import gitPullOrClone from 'git-pull-or-clone'
import path from 'path'
import fs from 'fs-extra' // 引入fs-extra
import { getDateTimeNow, executeGitCommand, templates } from './utils.js'
import packageInfo from '../package.json' assert { type: 'json' }
// check version
program.version(`${packageInfo.version}`, '-v, --version', 'output the current version')
// create project
program
  .command('create [projectName]')
  .description('Create & init project')
  .option('-t, --template <template>', 'template name')
  .action(async (projectName, options) => {
    // 1. 从模版列表中找到对应的模版
    let project = templates.find((template) => template.name === options.template)
    // 2. 如果匹配到模版就赋值，没有匹配到就是 undefined
    let projectTemplate = project ? project.value : undefined
    if (!projectName) {
      // 用户没有传入名称就交互式输入
      const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Project name:',
        default: 'vue-project'
      })
      projectName = name // 赋值输入的项目名称
    }
    if (!projectTemplate) {
      // 用户没有传入模版就交互式输入
      const { template } = await inquirer.prompt({
        type: 'list',
        name: 'template',
        message: 'Template name:',
        choices: templates // 模版列表
      })
      projectTemplate = template // 赋值选择的项目对应的地址
    }
    const dest = path.join(process.cwd(), projectName)
    // 判断文件夹是否存在，存在就交互询问用户是否覆盖
    if (fs.existsSync(dest)) {
      const { force } = await inquirer.prompt({
        type: 'confirm',
        name: 'force',
        message: `Target directory "${projectName}" is not empty. Remove existing files and continue?`
      })
      // 如果覆盖就删除文件夹继续往下执行，否的话就退出进程
      force ? fs.removeSync(dest) : process.exit(1)
    }
    // 下载 loading
    const downloading = ora(`Downloading Template: ${projectTemplate}... 🚗🚗🚗`)
    downloading.start()
    // 下载模版
    gitPullOrClone(projectTemplate, dest, (err: any) => {
      if (err) {
        downloading.fail(`${chalk.red.bold('Download template fail')} 😫😫😫`) // 下载模板失败
        console.log()
        console.error(err)
      } else {
        downloading.succeed(`${chalk.green.bold('Download template success')} 🥳🥳🥳`) // 下载模板成功
        console.log(`\nDone. Now run:\n`)
        console.log(chalk.green.bold(`   cd ${projectName}`))
        console.log(chalk.green.bold('   pnpm i'))
        console.log(chalk.green.bold('   pnpm dev'))
        console.log()
        console.log(`⏰ ${getDateTimeNow()}`)
      }
    })
  })
// clear directory
program
  .command('delete [projectNameDir]')
  .description('Clear the target directory')
  .action(async (projectName, options) => {
    const dest = path.join(process.cwd(), projectName)
    // 判断文件夹是否存在，存在就交互询问用户是否覆盖
    if (fs.existsSync(dest)) {
      const { force } = await inquirer.prompt({
        type: 'confirm',
        name: 'force',
        message: `Are you sure you want to delete the "${chalk.green.bold(projectName)}" directory？`
      })
      // 如果覆盖就删除文件夹继续往下执行，否的话就退出进程
      force ? fs.removeSync(dest) : process.exit(1)
      console.log(`The "${chalk.green.bold(projectName)}" directory has been deleted successfully 🥳🥳🥳`)
    } else {
      console.log(`The "${chalk.green.bold(projectName)}" directory does not exist 😢😢😢`)
    }
  })
// git pull
const template = 'template'
program
  .command('pull')
  .option('-c, --currentBranch <currentBranch>', 'current project branch')
  .option('-t, --templateBranch <templateBranch>', 'template project branch')
  .helpOption('-h, --help', 'display help for command')
  .description(
    'Pull remote template specified branch (for example: main) to current project specified branch (for example: template)'
  )
  .action(async ({ currentBranch, templateBranch }) => {
    // 交互式选择模板，获取对应链接
    const { templateLink } = await inquirer.prompt({
      type: 'list',
      name: 'templateLink',
      message: 'Template name:',
      choices: templates // 模版列表
    })
    if (!currentBranch) {
      // 交互式获取当前项目分支
      const { cb } = await inquirer.prompt({
        type: 'input',
        name: 'cb',
        message: `Current project's branch:`,
        default: 'template'
      })
      currentBranch = cb
    }
    if (!templateBranch) {
      // 交互式获取模版项目分支
      const { tb } = await inquirer.prompt({
        type: 'input',
        name: 'tb',
        message: `Template project's branch:`,
        default: 'main'
      })
      templateBranch = tb
    }
    console.log(`${chalk.magenta.bold('❄︎')} Current project's branch: ${chalk.green.bold(currentBranch)}`)
    console.log(`${chalk.magenta.bold('❄︎')} Template project's branch: ${chalk.green.bold(templateBranch)}`)
    const fetchLoading = ora('Fetching remote template... 🚗🚗🚗')
    fetchLoading.start()
    // 拉取远程模板指定分支内容到本地
    executeGitCommand('git fetch')
      .then(() => {
        fetchLoading.succeed(`${chalk.green.bold('Fetch template success')} 🥳🥳🥳`)
        const gitLoading = ora('Let it be...')
        gitLoading.start()
        executeGitCommand(`git checkout ${currentBranch}`)
          .then(() => {
            gitLoading.succeed(`Successfully switched to branch: ${chalk.green.bold(currentBranch)} 🥳🥳🥳`)
            deleteTemplateBranch(templateLink, currentBranch, templateBranch, gitLoading)
          })
          .catch((err) => {
            gitLoading.fail(`Failed to switch to branch: $${chalk.green.bold(currentBranch)} 😫😫😫`)
            console.log()
            console.error(err)
          })
      })
      .catch((err) => {
        fetchLoading.fail(`${chalk.green.bold('Fetch template fail')} 😫😫😫`)
        console.log()
        console.error(err)
      })
  })
const deleteTemplateBranch = (templateLink: string, currentBranch: string, templateBranch: string, gitLoading: Ora) => {
  // 查看本地是否存在 template 分支
  executeGitCommand(`git branch --list ${template}`).then((res) => {
    if (res) {
      // template 分支已存在
      gitLoading.warn(`local branch ${chalk.green.bold(template)} already exist 😢😢😢`)
      // 强制删除 template 分支
      executeGitCommand(`git branch -D ${template}`)
        .then(() => {
          gitLoading.succeed(`Successfully deleted local branch: ${chalk.green.bold(template)} 🥳🥳🥳`)
        })
        .catch((err) => {
          gitLoading.fail(`Failed to delete local branch: ${chalk.red.bold(template)} 😫😫😫`)
          console.log()
          console.error(err)
        })
      // 查看远程是否存在 template 分支
      executeGitCommand(`git branch -r --list ${template}`).then((res) => {
        if (res) {
          // template 分支已存在
          // 强制删除远程分支
          executeGitCommand(`git push origin -D ${template}`)
            .then(() => {
              gitLoading.succeed(`Successfully deleted remote branch: ${chalk.green.bold(template)} 🥳🥳🥳`)
            })
            .catch((err) => {
              gitLoading.fail(`Failed to delete remote branch: ${chalk.green.bold(template)} 😫😫😫`)
              console.log()
              console.error(err)
            })
            .finally(() => {
              // 创建并切换分支
              createPullFunc({ template, templateLink, templateBranch }, gitLoading)
            })
        } else {
          gitLoading.warn(`remote branch ${chalk.green.bold(template)} does not exist 😢😢😢`)
          // 创建并切换分支
          createPullFunc({ template, templateLink, templateBranch }, gitLoading)
        }
      })
    } else {
      gitLoading.warn(`local branch ${chalk.green.bold(template)} does not exist 😢😢😢`)
      // 创建并切换分支
      createPullFunc({ template, templateLink, templateBranch }, gitLoading)
    }
  })
}
const createPullFunc = (
  params: { template: string; templateLink: string; templateBranch: string },
  gitLoading: Ora
) => {
  const { template, templateLink, templateBranch } = params
  // 创建并切换到分支
  executeGitCommand(`git checkout -b ${template}`)
    .then(() => {
      gitLoading.succeed(`Successfully created branch: ${chalk.green.bold(template)} 🥳🥳🥳`)
    })
    .catch(() => {
      gitLoading.fail(`Failed to create branch: ${chalk.green.bold(template)} 😫😫😫`)
    })
  // 拉取模版分支
  executeGitCommand(`git pull ${templateLink} ${templateBranch}`)
    .then((res) => {
      gitLoading.succeed(
        `Successfully pulled remote template: ${chalk.green.bold(templateLink)} branch: ${chalk.green.bold(templateBranch)} 🥳🥳🥳`
      )
      // 合并
      executeGitCommand(`git merge ${templateLink}/${templateBranch}`)
        .then(() => {
          gitLoading.succeed(`Successfully merged remote template into branch: ${chalk.green.bold(template)} 🥳🥳🥳`)
        })
        .catch(() => {
          gitLoading.fail(`Failed to merge remote template into branch: ${chalk.red.bold(template)} 😫😫😫`)
          console.log(`git merge ${templateLink}/${templateBranch}`)
          console.log(
            `There might be conflicts. Please resolve them manually and commit to the ${chalk.green.bold(template)} branch.`
          )
        })
    })
    .catch((err) => {
      gitLoading.fail(
        `Failed to pull remote template: ${chalk.green.bold(templateLink)} branch: ${chalk.green.bold(templateBranch)} 😫😫😫`
      )
      console.log()
      console.error(err)
    })
  gitLoading.stop()
}
program.on('--help', () => {}) // 添加 --help
program.parse(process.argv)
