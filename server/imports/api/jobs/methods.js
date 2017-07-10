import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import { DefaultJobQueue } from './jobs.js'

Meteor.methods({
  'jobs.default.fetchLog'({ jobId, skip, limit }) {
    check(jobId, String)
    check(skip, Match.Optional(Number))
    check(limit, Match.Optional(Number))

    skip = skip || 0
    limit = limit || 25
    limit = Math.min(limit, 50)

    return DefaultJobQueue.findOne(jobId, { fields: { log: { $slice: [skip, limit] } } })
  }
})
