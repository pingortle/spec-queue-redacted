const DDP = require('ddp')
const DDPLogin = require('ddp-login')
const Job = require('meteor-job')
const execSync = require('child_process').execSync
const execFileSync = require('child_process').execFileSync
const exec = require('child_process').exec
const spawnSync = require('child_process').spawnSync
const spawn = require('child_process').spawn
const fs = require('fs')
const _ = require('underscore')

const ddp = new DDP({
  host: "127.0.0.1",
  port: 8888,
  use_ejson: true
})

Job.setDDP(ddp)

const dbMutex = {
  1: {},
  2: {},
  3: {},
  4: {},
}

ddp.connect(function (error) {
  throwIf(error)

  // TODO: Wrap with DDPLogin when auth is implemented
  // DDPLogin(ddp, function (error, token) {
  //   throwIf(error)
      const testJob = function (job, callback) {
        let selectedKey = null
        Object.keys(dbMutex).forEach((key) => {
          const mutexId = dbMutex[key]._taskId
          if (!dbMutex[key]._taskId) {
            dbMutex[key] = job
            selectedKey = key
          }
        })

        console.log(JSON.stringify(job))
        const command = `bundle exec rspec ${job.data.path} -fj`
        console.log(`executing "${command}"`)
        const env = _.extend(process.env, { TEST_ENV_NUMBER: `${process.argv[2]}` })
        const options = {
          cwd: '/Users/kaleblape/Dev/***REMOVED***/***REMOVED***-web',
          env
        }

        const rootCommand = command.split(' ')[0]
        const args = command.split(' ').slice(1)
        const stdout = spawnSync(command, args, options) //, (error, stdout, stderr) => {
          const results = JSON.parse(stdout)

          const ddpCallback = ((error, result) => throwIf(error) || console.log(`ddp result: ${result}`))
          const buildId = job.data.buildId
          const examples = results.examples
          ddp.call('builds.addExamples', [{ buildId, examples }], ddpCallback)

          dbMutex[selectedKey] = {}
          job.done('complete', error => throwIf(error))
          callback()
        // })
      }

      const testWorkers = Job.processJobs('default', 'test', { concurrency: dbMutex.length }, testJob)

      const prepareJob = function (job, callback) {
        // const cwd = '/Users/kaleblape/Dev/***REMOVED***/***REMOVED***-web'
        // console.log(execSync('bundle install', { cwd, encoding: 'utf8' }))
        // for (key in dbMutex) {
        //   const env = _.extend(process.env, { TEST_ENV_NUMBER: `_${key}` })
        //   const options = { cwd, env, encoding: 'utf8' }
        //   console.log(JSON.stringify(options))
        //   console.log(execSync('zeus rake db:setup RAILS_ENV=test', options))
        // }

        const options = { cwd: '/Users/kaleblape/Dev/***REMOVED***/***REMOVED***-web', maxBuffer: 20000*1024 }
        const stdout = spawnSync('bundle', ['exec', 'rspec', 'spec/etl', '-fj', '--dry-run'], options)
        // const stdout = fs.readFileSync(`${options.cwd}/rspec-list.json`)
        const results = JSON.parse(stdout)
        const files = results.examples.map(result => result.file_path)
        const uniqueFiles = Array.from(new Set(files))
        const specFiles = uniqueFiles.filter(path => !path.startsWith('./spec/support'))

        job.log(`number of spec files: ${specFiles.length}`)
        console.log(`number of spec files: ${specFiles.length} ${stdout}`)

        const ddpCallback = ((error, result) => throwIf(error) || console.log(`ddp result: ${result}`))
        specFiles.forEach((path) => {
          ddp.call('builds.addTestFile', [{ path, buildId: job.data.buildId }], ddpCallback)
        })

        job.done('complete', error => throwIf(error))
        callback()
      }

      const startWorkers = Job.processJobs('default', 'start', { concurrency: 1 }, prepareJob)
  // })
})

function throwIf(thing) {
  if (thing) throw thing
}
