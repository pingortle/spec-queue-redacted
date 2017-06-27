import { Meteor } from 'meteor/meteor'
import { Examples } from '/imports/api/examples/examples.js'
import { DefaultJobQueue } from '/imports/api/jobs/jobs.js'
import './build.html'
import './build.less'

Template.build.viewmodel({
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
  countOfJobsWithStatus(status) {
    return this.jobs({ status }).count()
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
  autorun:[
    function () { Meteor.subscribe('jobs.default.forBuild', { buildId: this.buildId() }) },
    function () {
      const ids = this.examplesWithStatus('failed').map(example => example._id)
      Meteor.subscribe('examples.withDetails', ids)
    }
  ]
})
