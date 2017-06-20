const createTestJobWorker = function ({ spawn, spawnSync, handleError, _, ddp }) {
  const testJob = function (job, callback) {
    console.log(JSON.stringify(job))

    const command = `bin/rspec ${job.data.path} -fj`
    console.log(`executing "${command}"`)

    const env = _.extend(process.env, { NO_COVERAGE: 'true' })
    const options = {
      encoding: 'utf8',
      shell: true,
      env
    }

    const rootCommand = command.split(' ')[0]
    const args = command.split(' ').slice(1)
    const runData = spawnSync(command, args, options)
    const testRun = spawn(command, args, options)

    const handleJobError = (error, result) => {
      if (error) job.fail()
      handleError(error, result)
    }

    testRun.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`)
      const results = JSON.parse(runData.stdout)

      const buildId = job.data.buildId
      const examples = results.examples

      ddp.call('builds.addExamples', [{ buildId, examples }], (error, result) => {
        handleJobError(error, result)
        if (!error) job.done('complete', handleJobError)
      })
    })

    testRun.on('close', (code) => {
      console.log(`child process exited with code ${code}`)
      callback()
    })

    testRun.on('error', (error) => {
      console.error(error)
      job.error(error)
      job.fail()
    })
  }

  return testJob
}

module.exports = createTestJobWorker
