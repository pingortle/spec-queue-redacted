import { Meteor } from 'meteor/meteor'
import { DefaultJobQueue } from '../../../api/jobs/jobs.js'
import './logs.html'

Template.logs.viewmodel({
  loaded: false,
  onRendered() {
    console.log(this.buildId())
    Meteor.BuildSubscriber.subscribe('jobs.default.forBuild', { buildId: this.buildId() }, () => {
      this.loaded(true)
    })
  }
})
