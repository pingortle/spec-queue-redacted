const createGatherJobWorker = function ({ spawn, spawnSync, throwIf, _, ddp }) {

  const gatherJob = function (job, callback) {
    const maxBuffer = 20000*1024
    const env = _.extend(process.env, { NO_COVERAGE: 'true' })
    const options = { cwd: '/Users/kaleblape/Dev/***REMOVED***/***REMOVED***-web', maxBuffer, env }
    const runData = spawnSync('bin/rspec', ['spec/etl', '-fj', '--dry-run'], options)

    console.log(`********************spawned stdout: \n\n\n${runData.stdout}`)
    console.log(`********************spawned stderr: \n\n\n${runData.stderr}`)

    const results = JSON.parse(runData.stdout)
    const files = results.examples.map(result => result.file_path)
    const uniqueFiles = Array.from(new Set(files))
    const specFiles = uniqueFiles.filter(path => !path.startsWith('./spec/support'))

    job.log(`number of spec files: ${specFiles.length}`)

    const ddpCallback = ((error, result) => throwIf(error) || console.log(`ddp result: ${result}`))
    specFiles.forEach((path) => {
      ddp.call('builds.addTestFile', [{ path, buildId: job.data.buildId }], ddpCallback)
    })

    job.done('complete', error => throwIf(error))
    callback()
  }

  return gatherJob
}

module.exports = createGatherJobWorker
