import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
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
  fetchLog(options = {}) {
    const { limit, all } = options
    Meteor.call('jobs.default.fetchLog', { jobId: this.id(), skip: this.log().length, limit }, (error, result) => {
      if (error) return console.log(error)

      const delta = result.log.length
      console.log(`loaded ${delta} new logs`)
      result.log.forEach(entry => this.log().push(entry))

      if (all && delta) {
        this.fetchLog({ limit, all })
      } else {
        this.loaded(true)
      }
    })
  },
  onRendered() {
    this.fetchLog({ all: true })
  },
  autorun() {
    reactiveInterval(this.interval())
    if (this.autoReload())
      Tracker.nonreactive(() => this.fetchLog())
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
