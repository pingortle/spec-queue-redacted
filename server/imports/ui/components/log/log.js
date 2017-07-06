import { Meteor } from 'meteor/meteor'
import { reactiveInterval } from 'meteor/teamgrid:reactive-interval'
import { DefaultJobQueue } from '../../../api/jobs/jobs.js'
import './log.html'

Template.log.viewmodel({
  loaded: false,
  interval: 1000,
  autoReload: false,
  log: [],
  id() { return this.resource()._id },
  prettyLog() { return this.log().map(log => log.message).join('') },
  autoReloadClass() { return this.autoReload() ? 'btn-success' : 'btn-default' },
  fetchLog() {
    Meteor.call('jobs.default.fetchLog', { jobId: this.id() }, (error, result) => {
      if (error) return console.log(error)

      const delta = result.log.length - this.log().length
      console.log(`loaded ${delta} new logs`)
      this.log(result.log)
      this.loaded(true)
    })
  },
  onRendered() {
    this.fetchLog()
  },
  autorun() {
    reactiveInterval(this.interval())
    if (this.autoReload()) this.fetchLog()
  }
})
