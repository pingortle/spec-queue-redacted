const fs = require('fs')
const kill = require('tree-kill')
const { execFile } = require('child_process')

const createTestJobWorker = function ({ spawn, spawnSync, handleError, _, ddp, hostInfo }) {
  const testJob = function (job, callback) {
    let failedExternally = false

    const invokeOnConnection = (handle) => {
      invokeOn = (listener) => {
        handle(error => {
          console.log('removing new ddp connection listener...')
          ddp.removeListener('connected', listener)
        })
      }

      const connect = () => {
        invokeOn(connect)
      }

      console.log('subscribing to new ddp connection...')
      ddp.on('connected', connect)
      invokeOn(connect)
    }

    let subscription = null
    invokeOnConnection(handle => {
      subscription = ddp.subscribe('jobs.default.in', [[job._doc._id]], () => {
        console.log('Subscribed to job changes...')
        handle()
      })
    })

    console.log(JSON.stringify(job))
    job.log(JSON.stringify(hostInfo))

    const resultFilePath = `results-${job.doc._id}.json`
    const command = `bin/rspec ${job.data.path} -fj --out ${resultFilePath} --format progress`
    console.log(`executing "${command}"`)

    const env = _.extend(process.env, { NO_COVERAGE: 'true' })
    const options = {
      encoding: 'utf8',
      shell: true,
      timeout: Number(process.env.CHILD_PROCESS_TIMEOUT_MILLISECONDS),
      killSignal: 9,
      env
    }

    const rootCommand = command.split(' ')[0]
    const args = command.split(' ').slice(1)
    const testRun = execFile(command, args, options, (error, stdout, stderr) => {
      ddp.unsubscribe(subscription)
      observer.stop()

      if (failedExternally) {
        console.log('Failed externally. Skipping results...')
        return callback()
      }

      fs.readFile(resultFilePath, 'utf8', (error, data) => {
        let results = null
        let failure = null

        if (error) {
          failure = error
        } else {
          try {
            results = JSON.parse(data)
          } catch (error) {
            failure = error
          }
        }

        if (failure) console.error(failure)

        if (results) {
          const buildId = job.data.buildId
          const examples = results.examples

          invokeOnConnection(handleError => {
            ddp.call('builds.addExamples', [{ jobId: job.doc._id, buildId, examples, hostInfo }], (error, result) => {
              job.done({ result }, (error, result) => {
                handleError(error, result)
                callback()
              })
            })
          })
        } else {
          invokeOnConnection(handleError => {
            job.fail(failure, error => {
              handleError(error)
              throw failure
            })
          })
        }
      })
    })

    const observer = ddp.observe('default.jobs')
    observer.changed = (id, oldFields, clearedFields, newFields) => {
      if (newFields.status && newFields.status !== 'running') {
        ddp.unsubscribe(subscription)
        observer.stop()

        job.log('Killing task...', { echo: true })
        failedExternally = true
        kill(testRun.pid, 'SIGKILL', function (error) {
          console.error(error)
        })
      }
    }

    let progress = 0
    testRun.stdout.on('data', data => {
      job.progress(progress, progress += 1, { echo: true }, handleError)
      invokeOnConnection(handleError => job.log(data.toString(), { echo: true }, handleError))
    })
    testRun.stderr.on('data', data => invokeOnConnection(handleError => job.log(data.toString(), { echo: true }, handleError)))

    testRun.on('close', (code) => {
      console.log(`child process exited with code ${code}`)
    })
  }

  return testJob
}

module.exports = createTestJobWorker
