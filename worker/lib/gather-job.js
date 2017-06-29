const glob = require('glob')

const createGatherJobWorker = function ({ spawn, spawnSync, handleError, _, ddp }) {
  const gatherJob = function (job, callback) {
    const maxBuffer = 20000*1024
    const env = _.extend(process.env, { NO_COVERAGE: 'true' })
    const options = { maxBuffer, env, encoding: 'utf8' }
    const specOptions = ['spec']
    const runData = spawnSync('bin/rspec', specOptions.concat(['-fj', '--dry-run']), options)

    console.log('******************** spawned stdout:', runData.stdout)
    console.log('******************** spawned stderr:', runData.stderr)

    const results = JSON.parse(runData.stdout)

    const criteria = {
      Collections: {
        Examples: {
          count: Number(results.summary.example_count)
        }
      }
    }

    const requestSpecs = glob.sync('spec/requests/**/*_spec.rb')
    const nonRequestSpecs = glob.sync('spec/!(requests)/**/*_spec.rb')
    const testFilePaths = requestSpecs.concat(nonRequestSpecs)

    ddp.call('builds.begin', [{
      buildId: job.data.buildId,
      criteria,
      testFilePaths,
      totalExamples: Number(results.summary.example_count),
      metadata: results
    }], handleError)

    job.done('complete', handleError)
    callback()
  }

  return gatherJob
}

module.exports = createGatherJobWorker
