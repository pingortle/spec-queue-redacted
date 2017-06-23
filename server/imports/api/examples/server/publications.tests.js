import { assert } from 'meteor/practicalmeteor:chai'
import { Examples } from '../examples.js'
import { PublicationCollector } from 'meteor/johanbrook:publication-collector'
import './publications.js'

describe('examples publications', function () {
  const buildId = 'testing123'

  beforeEach(function () {
    Examples.remove({})
    Examples.insert({
      buildId
    })
  })

  describe('examples.forBuild', function () {
    it('sends all examples for a build', function (done) {
      const collector = new PublicationCollector()
      collector.collect('examples.forBuild', { buildId }, (collections) => {
        assert.equal(collections.examples.length, 1)
        done()
      })
    })

    it('excludes examples for other builds', function (done) {
      const otherBuildId = 'otherBuildId'
      Examples.insert({ buildId: otherBuildId })

      const collector = new PublicationCollector()
      collector.collect('examples.forBuild', { buildId }, (collections) => {
        assert.equal(collections.examples.length, 1)
        done()
      })
    })
  })
})
