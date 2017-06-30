import { Meteor } from 'meteor/meteor'
import { Examples } from '/imports/api/examples/examples.js'
import { DefaultJobQueue } from '/imports/api/jobs/jobs.js'
import './build.html'
import './build.less'

Template.build.viewmodel({
  jobsLoaded: false,
  examplesLoaded: false,
  loaded() {
    return this.jobsLoaded() && this.examplesLoaded()
  },
  buildId() {
    return this.resource()._id
  },
  examples(selector = {}) {
    const buildId = this.buildId()
    return Examples.find(_.extend({ buildId }, selector))
  },
  examplesWithStatus(status) {
    return this.examples({ status })
  },
  pp(collection) {
    return collection.map((item) => '\n' + JSON.stringify(item, null, '  '))
  },
  stringify(data) {
    return JSON.stringify(data)
  },
  toFixed(number, precision) {
    return number.toFixed(precision)
  },
  jobIds() {
    return this.resource().jobIds || []
  },
  prettyJobIds() {
    return this.jobIds().join(', ')
  },
  jobStatuses() {
    return DefaultJobQueue.jobStatuses
  },
  jobs(selector = {}) {
    return DefaultJobQueue.find(_.extend({
        "data.buildId": this.buildId()
      }, selector))
  },
  jobsWithStatus(status) {
    return this.jobs({ status })
  },
  countOfJobsWithStatus(status) {
    return this.jobsWithStatus(status).count()
  },
  exampleStatuses() {
    return ['passed', 'failed', 'pending']
  },
  countOfExamplesWithStatus(status) {
    return this.examples({ status }).count()
  },
  cancel() {
    Meteor.call('builds.cancel', { buildId: this.buildId() })
  },
  failJob(job) {
    console.log(job)
    job = new Job(DefaultJobQueue, job)
    job.fail('Failed by user', (error, result) => {
      console.log(error, result)
    })
  },
  autorun: [
    function () {
      Meteor.subscribe('jobs.default.forBuild', { buildId: this.buildId() }, () => {
        this.jobsLoaded(true)
      })
    },
    function () {
      Meteor.subscribe('examples.withDetails', { buildId: this.buildId(), status: 'failed' }, () => {
        this.examplesLoaded(true)
      })
    }
  ]
})
