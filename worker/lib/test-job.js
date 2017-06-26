const fs = require('fs')

const createTestJobWorker = function ({ spawn, spawnSync, handleError, _, ddp }) {
  const testJob = function (job, callback) {
    console.log(JSON.stringify(job))

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

    const handleJobError = (error, result) => {
      if (error) job.fail()
      handleError(error, result)
    }

    let progress = 0
    testRun.stdout.on('data', data => job.progress(progress, progress += 1, { echo: true }))
    testRun.stderr.on('data', data => job.log(data, { echo: true }))

    testRun.on('close', (code) => {
      console.log(`child process exited with code ${code}`)

      fs.readFile(resultFilePath, 'utf8', (error, data) => {
        let results = null

        if (error) {
          job.fail(error)
        } else {
          try {
            results = JSON.parse(data)
          } catch (error) {
            job.fail(error)
          }
        }

        if (results) {
          const buildId = job.data.buildId
          const examples = results.examples

          ddp.call('builds.addExamples', [{ buildId, examples }], (error, result) => {
            handleJobError(error, result)
            if (!error) job.done('complete', handleJobError)
          })
        }

        callback()
      })
    })

    testRun.on('error', (error) => {
      console.error(error)
      job.fail(error)
      callback()
    })
  }

  return testJob
}

module.exports = createTestJobWorker
