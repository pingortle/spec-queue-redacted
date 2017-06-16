import { Meteor } from 'meteor/meteor'
import { DefaultJobQueue } from '../../api/jobs/jobs.js'

Meteor.startup(() => {
  DefaultJobQueue.startJobServer()
})
