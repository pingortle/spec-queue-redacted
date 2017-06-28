const fs = require('fs')

const createTestJobWorker = function ({ spawn, spawnSync, handleError, _, ddp, hostInfo }) {
  const testJob = function (job, callback) {
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

    console.log(JSON.stringify(job))
    job.log(JSON.stringify(hostInfo))

    const resultFilePath = `results-${job.doc._id}.json`
    const command = `bin/rspec ${job.data.path} -fj --out ${resultFilePath} --format progress`
    console.log(`executing "${command}"`)

    const env = _.extend(process.env, { NO_COVERAGE: 'true' })
    const options = {
      encoding: 'utf8',
      shell: true,
      env
    }

    const rootCommand = command.split(' ')[0]
    const args = command.split(' ').slice(1)
    const testRun = spawn(command, args, options)

    let progress = 0
    testRun.stdout.on('data', data => job.progress(progress, progress += 1, { echo: true }, handleError))
    testRun.stderr.on('data', data => invokeOnConnection(handleError => job.log(data.toString(), { echo: true }, handleError)))

    testRun.on('close', (code) => {
      console.log(`child process exited with code ${code}`)

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

        if (failure) {
          invokeOnConnection(handleError => {
            job.fail(failure, handleError)
            callback()
          })
        }

        if (results) {
          const buildId = job.data.buildId
          const examples = results.examples

          invokeOnConnection(handleError => {
            ddp.call('builds.addExamples', [{ jobId: job.doc._id, buildId, examples, hostInfo }], (error, result) => {
              handleError(error, result)
              job.done({ result }, (error, result) => {
                handleError(error, result)
                callback()
              })
            })
          })
        }
      })
    })

    testRun.on('error', (error) => {
      console.error(error)
      invokeOnConnection(handleError => {
        job.fail(error, handleError)
        callback()
      })
    })
  }

  return testJob
}

module.exports = createTestJobWorker
