import { Meteor } from 'meteor/meteor'
import { Examples } from '/imports/api/examples/examples.js'
import { DefaultJobQueue } from '/imports/api/jobs/jobs.js'
import './build.html'
import './build.less'

Template.build.viewmodel({
  jobsLoaded: false,
  examplesLoaded: false,
  showAllExamples: false,
  loaded() {
    return Meteor.BuildSubscriber.ready()
  },
  buildId() {
    return this.resource()._id
  },
  examples(selector = {}) {
    const buildId = this.buildId()
    const options = this.showAllExamples() ? {} : { limit: 5 }
    return Examples.find(_.extend({ buildId }, selector), options)
  },
  examplesWithStatus(status) {
    return this.examples({ status })
  },
  pp(item) {
    return JSON.stringify(item, null, '  ')
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
    return this.resource().jobCounts[status] || 0
  },
  exampleStatuses() {
    return ['passed', 'failed', 'pending']
  },
  countOfExamplesWithStatus(status) {
    return this.resource().exampleCounts[status] || 0
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
  rerunExample(example) {
    Meteor.call('examples.rerun', { exampleId: example._id }, (error, result) => {
      if (error) console.error(error)
      if (result) console.log(result)
    })
  },
  autorun: [
    function () {
      if (!this.buildId()) return;

      Meteor.BuildSubscriber.subscribe('jobs.default.forBuild', { buildId: this.buildId() }, () => {
        this.jobsLoaded(true)
      })
    },
    function () {
      if (!this.buildId()) return;

      Meteor.BuildSubscriber.subscribe('examples.withDetails', { buildId: this.buildId(), status: 'failed' }, () => {
        this.examplesLoaded(true)
      })
    }
  ]
})
