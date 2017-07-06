import { Meteor } from 'meteor/meteor'
import { reactiveInterval } from 'meteor/teamgrid:reactive-interval'
import { DefaultJobQueue } from '../../../api/jobs/jobs.js'
import './log.html'

Template.log.viewmodel({
  loaded: false,
  interval: 5000,
  autoReload: false,
  prettyMode: true,
  log: [],
  id() { return this.resource()._id },
  prettyLog() { return this.log().map(log => log.message).join('') },
  detailedLog() {
    const log = this.log()
    return log.map((entry, index) => {
      entry.nextEntry = log[index + 1]
      return entry
    })
  },
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

Template.log_entry.viewmodel({
  durationMilliseconds() {
    const nextEntry = this.nextEntry()
    if (nextEntry) return nextEntry.time - this.time()

    reactiveInterval(1000)
    return new Date() - this.time()
  },
  formatDuration(duration) {
    return `${moment.duration(duration).humanize()} (${moment.duration(duration).asSeconds()} seconds)`
  }
})
