import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import { Builds } from './builds.js'
import { DefaultJobQueue } from '../jobs/jobs.js'
import { Examples } from '../examples/examples.js'

Meteor.methods({
  'builds.createJob'() {
    const doc = {
      jobIds: [],
      createdAt: new Date(),
    }

    const buildId = Builds.insert(doc)

    const job = new Job('default', 'start', { buildId })
    const jobId = job.save()

    Builds.update(buildId, { $set: { startJobId: jobId } })

    return buildId
  },
  'builds.destroy'({ buildId }) {
    check(buildId, String)

    const build = Builds.findOne(buildId)
    DefaultJobQueue.cancelJobs(build.jobIds || [])
    Examples.remove({ buildId })

    return Builds.remove(buildId)
  },
  'builds.cancel'({ buildId }) {
    check(buildId, String)

    const build = Builds.findOne(buildId)
    DefaultJobQueue.cancelJobs(build.jobIds || [])

    return Builds.update(buildId, { $set: { status: 'cancelled' } })
  },
  'builds.addTestFile'({ buildId, path }) {
    check(buildId, String)
    check(path, Match.OneOf(String, [String]))

    paths = _.flatten([path])

    const build = Builds.findOne(buildId)
    return paths.map(path => {
      const testJob = new Job('default', 'test', { path, buildId })

      const dependency = DefaultJobQueue.getJob(build.startJobId)
      const testJobId = testJob.depends([dependency])
        .retry({ wait: 5 * 1000 /* milliseconds */ })
        .save()

      return Builds.update(buildId, { $addToSet: { jobIds: testJobId } })
    })
  },
  'builds.addExamples'({ buildId, examples }) {
    check(buildId, String)
    check(examples, [Object])

    return examples.map(example => Examples.insert({ buildId, ...example }))
  },
  'builds.begin'({ buildId, criteria, metadata, testFilePaths }) {
    check(buildId, String)
    check(criteria, Object)
    check(metadata, Object)
    check(testFilePaths, [String])

    Meteor.call('builds.addTestFile', { buildId, path: testFilePaths })

    return Builds.update(buildId, { $set: { criteria, metadata } })
  },
  'builds.satisfied?'({ buildId }) {
    check(buildId, String)
    const build = Builds.findOne(buildId)

    return _.chain(build.criteria).map((value, key) => {
      return evaluateCriterion(build, key, value)
    })
    .flatten()
    .every()
    .value()
  }
})

const criteriaCollections = {
  Examples: Examples
}

const collectionCriteriaActions = {
  count(collection, build) {
    return collection.find({ buildId: build._id }).count()
  }
}

function evaluateCriterion(build, key, value) {
  if (key === 'Collections') return evaluateCollectionsCriteria(build, value)
  return build[key] === value
}

function evaluateCollectionsCriteria(build, criteria) {
  return _.chain(criteria).map((value, key) => {
    return evaluateCollectionsCriterion(build, key, value)
  })
  .every()
  .value()
}

function evaluateCollectionsCriterion(build, collectionName, criteria) {
  if (!criteriaCollections[collectionName]) return false

  return _.chain(criteria).map((value, key) => {
    const collection = criteriaCollections[collectionName]
    return evaluateCollectionCriteriaAction(build, collection, key, value)
  })
  .every()
  .value()
}

function evaluateCollectionCriteriaAction(build, collection, action, value) {
  if (!collectionCriteriaActions[action]) return false

  return collectionCriteriaActions[action](collection, build) === value
}
