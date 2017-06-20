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

ddp.connect(function (error, isReconnecting) {
  handleDDPResponse(error, isReconnecting ? 'reconnecting...' : null)
  if (error || isReconnecting) return;

  const testJob = createTestJobWorker({ spawn, spawnSync, handleError: handleDDPResponse, _, ddp })
  const gatherJob = createGatherJobWorker({ spawn, spawnSync, handleError: handleDDPResponse, _, ddp })

  const workerOptions = {
    concurrency: 1,
    prefetch: 0,
  }

  const testWorkers = Job.processJobs('default', 'test', workerOptions, testJob)
  const gatherWorkers = Job.processJobs('default', 'start', workerOptions, gatherJob)

  console.log('Ready to process jobs...')
})

function handleError(error) {
  if (error) console.log(`******** Error: ${JSON.stringify(error)}`)
}

function handleDDPResponse(error, result) {
  if (error) console.error('******** Error:', error)
  if (result) console.log(`******** Result: ${JSON.stringify(result)}`)
}
