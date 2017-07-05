import { Meteor } from 'meteor/meteor'
import { DefaultJobQueue } from '../../../api/jobs/jobs.js'
import './log.html'

Template.log.viewmodel({
  loaded: false,
  log: [],
  id() { return this.resource()._id },
  prettyLog() { return this.log().map(log => log.message).join('') },
  fetchLog() {
    Meteor.call('jobs.default.fetchLog', { jobId: this.id() }, (error, result) => {
      console.log(error, result)
      this.log(result.log)
      this.loaded(true)
    })
  },
  onCreated() {
    this.fetchLog()
  }
})
