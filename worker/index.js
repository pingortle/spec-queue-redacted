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
  host: "127.0.0.1",
  port: 3000,
  use_ejson: true
})

Job.setDDP(ddp)

ddp.connect(function (error) {
  throwIf(error)

  const testJob = createTestJobWorker({ spawnSync, throwIf, _, ddp })
  const gatherJob = createGatherJobWorker({ spawn, spawnSync, throwIf, _, ddp })

  const testWorkers = Job.processJobs('default', 'test', { concurrency: 1 }, testJob)
  const gatherWorkers = Job.processJobs('default', 'start', { concurrency: 1 }, gatherJob)
})

function throwIf(thing) {
  if (thing) throw thing
}
