import { assert } from 'meteor/practicalmeteor:chai'
import { Examples } from '../examples.js'
import { PublicationCollector } from 'meteor/johanbrook:publication-collector'
import StubCollections from 'meteor/hwillson:stub-collections'
import './publications.js'

describe('examples publications', function () {
  const buildId = 'testing123'

  beforeEach(function () {
    StubCollections.add([Examples._name])
    StubCollections.stub()
    Examples.insert({
      buildId
    })
  })

  afterEach(function () {
    StubCollections.restore()
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
      collector.collect('examples.forBuild', { buildId: otherBuildId }, (collections) => {
        assert.equal(collections.examples.length, 1)
        done()
      })
    })
  })
})
