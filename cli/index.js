const DDP = require('ddp')

const ddp = new DDP({
  host: process.env.METEOR_HOST || "127.0.0.1",
  port: process.env.METEOR_PORT || 3000,
  autoReconnect : true,
  useSockJs: true,
})

ddp.connect(function (error) {
  console.error(error)

  ddp.call('builds.createJob', [], function (error, buildId) {
    throwIf(error)
    console.log(`running build: ${buildId}`)

    const buildSubscription = ddb.subscribe('builds.one', [buildId])

    const buildObserver = ddp.observe('builds')
    buildObserver.changed = (id, oldFields, clearedFields, newFields) => {
      const status = newFields.status
      if (!status || status === 'passed') {
        process.exit(0)
      } else {
        process.exit(1)
      }
    }
  })
})
