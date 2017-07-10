import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import { DefaultJobQueue } from '../jobs/jobs.js'
import { Examples } from '../examples/examples.js'

Meteor.methods({
  'examples.rerun'({ exampleId }) {
    check(exampleId, String)

    const example = Examples.findOne(exampleId)
    const jobId = example.jobId
    const job = DefaultJobQueue.getJob(jobId)

    job.rerun({ wait: 5 * 1000 })
    return Examples.remove({ jobId })
  }
})
