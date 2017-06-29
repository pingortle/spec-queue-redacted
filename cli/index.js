const DDP = require('ddp')

const ddp = new DDP({
  host: process.env.METEOR_HOST || "127.0.0.1",
  port: process.env.METEOR_PORT || 3000,
  autoReconnect : true,
  useSockJs: true
})

let buildId = null

const buildObserver = ddp.observe('builds')
buildObserver.changed = (id, oldFields, clearedFields, newFields) => {
  const status = newFields.status
  if (!status) return;

  console.log(`Build result: ${status}`)
  if (status === 'passed') {
    process.exit(0)
  } else {
    process.exit(1)
  }
}

ddp.connect(function (error, isReconnected) {
  console.log('connected, waiting for build results...')

  if (buildId) ddp.subscribe('builds.one', [buildId])

  if (error || isReconnected) {
    if (error) console.error(error)
    return;
  }

  ddp.call('builds.createJob', [{ gitCommitId: process.env.GIT_COMMIT }], function (error, newBuildId) {
    buildId = newBuildId
    ddp.subscribe('builds.one', [buildId])
    console.log(`running build: ${buildId}`)
  })
})
