import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Builds } from './builds.js'
import { DefaultJobQueue } from '../jobs/jobs.js'

Meteor.methods({
  'builds.createJob'({ archiveUrl }) {
    check(archiveUrl, String)

    const doc = {
      archiveUrl,
      examples: [],
      jobIds: [],
      createdAt: new Date(),
    }

    const buildId = Builds.insert(doc)

    const job = new Job('default', 'start', { buildId })
    const jobId = job.save()

    Builds.update(buildId, { $set: { startJobId: jobId } })

    return buildId
  },
  'builds.addTestFile'({ buildId, path }) {
    check(buildId, String)
    check(path, String)

    const build = Builds.findOne(buildId)
    const testJob = new Job('default', 'test', { path, buildId })

    const dependency = new Job('default', DefaultJobQueue.findOne(build.startJobId))
    const testJobId = testJob.depends([dependency]).save()

    return Builds.update(buildId, { $addToSet: { jobIds: testJobId } })
  },
  'builds.addExamples'({ buildId, examples }) {
    check(buildId, String)
    check(examples, [Object])

    return Builds.update(buildId, { $push: { examples: { $each: examples } }, $inc: { examplesCount: examples.length } })
  }
})
