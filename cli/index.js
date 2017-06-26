const DDP = require('ddp')

const ddp = new DDP({
  host: "127.0.0.1",
  port: 8888,
  use_ejson: true
})

ddp.connect(function (error) {
  throwIf(error)

  ddp.call('builds.createJob', [], function (error, result) {
    throwIf(error)
    console.log(result)
    process.exit()
  })
})

function throwIf(thing) {
  if (thing) throw thing
}
