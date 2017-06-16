import { assert } from 'meteor/practicalmeteor:chai'
import { DefaultJobQueue } from '../jobs.js'
import { PublicationCollector } from 'meteor/johanbrook:publication-collector'
import './publications.js'

describe('builds publications', function () {
  beforeEach(function () {
    DefaultJobQueue.remove({})
    const job = new Job('default', 'example', {})
    job.save()
  })

  describe('jobs.default', function () {
    it('sends all default jobs', function (done) {
      const collector = new PublicationCollector()
      collector.collect('jobs.default', (collections) => {
        assert.equal(collections['default.jobs'].length, 1)
        done()
      })
    })
  })
})
