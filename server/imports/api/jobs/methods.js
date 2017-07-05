import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import { DefaultJobQueue } from './jobs.js'

Meteor.methods({
  'jobs.default.fetchLog'({ jobId }) {
    check(jobId, String)
    return DefaultJobQueue.findOne(jobId, { fields: { log: 1 } })
  }
})
