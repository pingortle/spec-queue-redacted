const DDP = require('ddp')
const DDPLogin = require('ddp-login')
const Job = require('meteor-job')
const execSync = require('child_process').execSync
const execFileSync = require('child_process').execFileSync
const exec = require('child_process').exec
const spawnSync = require('child_process').spawnSync
const spawn = require('child_process').spawn
const fs = require('fs')
const _ = require('underscore')

const createTestJobWorker = require('./lib/test-job.js')
const createGatherJobWorker = require('./lib/gather-job.js')

const ddp = new DDP({
  host: process.env.METEOR_HOST || "127.0.0.1",
  port: process.env.METEOR_PORT || 3000,
  autoReconnect : true,
  useSockJs: true,
})

Job.setDDP(ddp)

const hostInfo = {
  containerId: process.env.HOSTNAME,
  ec2PublicDNS: process.env.EC2_HOSTNAME
}

const workerOptions = {
  concurrency: 1,
  prefetch: 0,
  workTimeout: Number(process.env.WORKER_TIMEOUT_MILLISECONDS) || (void 0),
}

const testJob = createTestJobWorker({ spawn, spawnSync, handleError: handleDDPResponse, _, ddp, hostInfo })
const gatherJob = createGatherJobWorker({ spawn, spawnSync, handleError: handleDDPResponse, _, ddp, hostInfo })

const testWorkers = Job.processJobs('default', 'test', workerOptions, testJob).pause()
const gatherWorkers = Job.processJobs('default', 'start', workerOptions, gatherJob).pause()

ddp.connect(function (error, isReconnected) {
  if (error) {
    testWorkers.pause()
    gatherWorkers.pause()
    return console.log('******** DDP Error:', error)
  }

  testWorkers.resume()
  gatherWorkers.resume()
  console.log('Ready to process jobs...')
})

if (process.env.DEBUG) {
  ddp.on('message', message => console.log(`ddp: ${message}`))
  ddp.on('socket-close', (code, message) => {
    testWorkers.pause()
    gatherWorkers.pause()
    console.log(`ddp close: ${code} - "${message}"`)
  })
  ddp.on('socket-error', (error) => {
    console.log(`ddp error: ${error}`)
  })
}

function handleDDPResponse(error, result) {
  if (error) console.error('******** Error:', error)
  if (result) console.log(`******** Result: ${JSON.stringify(result)}`)
}
