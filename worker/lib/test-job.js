const createTestJobWorker = function ({ spawnSync, throwIf, _, ddp }) {
  const testJob = function (job, callback) {

    console.log(JSON.stringify(job))

    const command = `bin/rspec ${job.data.path} -fj`
    console.log(`executing "${command}"`)

    const env = _.extend(process.env, { TEST_ENV_NUMBER: `${process.argv[2]}`, NO_COVERAGE: 'true' })
    const options = {
      cwd: '/Users/kaleblape/Dev/***REMOVED***/***REMOVED***-web',
      shell: true,
      env
    }

    const rootCommand = command.split(' ')[0]
    const args = command.split(' ').slice(1)
    const runData = spawnSync(command, args, options)
    const results = JSON.parse(runData.stdout)

    const ddpCallback = ((error, result) => throwIf(error) || console.log(`ddp result: ${result}`))
    const buildId = job.data.buildId
    const examples = results.examples
    ddp.call('builds.addExamples', [{ buildId, examples }], ddpCallback)

    job.done('complete', error => throwIf(error))
    callback()
  }

  return testJob
}

module.exports = createTestJobWorker
