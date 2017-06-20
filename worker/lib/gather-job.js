const createGatherJobWorker = function ({ spawn, spawnSync, handleError, _, ddp }) {
  const gatherJob = function (job, callback) {
    const maxBuffer = 20000*1024
    const env = _.extend(process.env, { NO_COVERAGE: 'true' })
    const options = { maxBuffer, env, encoding: 'utf8' }
    const runData = spawnSync('bin/rspec', ['spec/etl/transforms/default_value_transform_spec.rb', 'spec/etl/transforms/key_map_transform_spec.rb', '-fj', '--dry-run'], options)

    console.log('******************** spawned stdout:', runData.stdout)
    console.log('******************** spawned stderr:', runData.stderr)

    const results = JSON.parse(runData.stdout)
    const files = results.examples.map(result => result.file_path)
    const uniqueFiles = Array.from(new Set(files))
    const specFiles = uniqueFiles.filter(path => !path.startsWith('./spec/support'))

    job.log(`number of spec files: ${specFiles.length}`)

    specFiles.forEach((path) => {
      ddp.call('builds.addTestFile', [{ path, buildId: job.data.buildId }], handleError)
    })

    job.done('complete', handleError)
    callback()
  }

  return gatherJob
}

module.exports = createGatherJobWorker
