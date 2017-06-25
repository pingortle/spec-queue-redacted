import { _ } from 'meteor/underscore'
import { Meteor } from 'meteor/meteor'
import { expect } from 'chai'
import sinon from 'sinon'
import { Template } from 'meteor/templating'
import StubCollections from 'meteor/hwillson:stub-collections'
import { Builds } from '/imports/api/builds/builds.js'
import { Examples } from '/imports/api/examples/examples.js'

import '/imports/api/builds/factory.tests.js'
import '/imports/api/examples/factory.tests.js'
import '../build.js'

const sandbox = sinon.sandbox.create()

describe('Build', function () {
  let builds = null

  beforeEach(function () {
    StubCollections.stub(Builds)
    builds = _(3).times(() => Factory.create('build'))
  })

  afterEach(function () {
    StubCollections.restore()
    sandbox.restore()
  })

  describe('ViewModel', function () {
    let subject = null
    let resource = null
    let examples = null

    beforeEach(function () {
      resource = _(builds).first()
      subject = Template.build.createViewModel({ resource })
      subject.resource = sinon.spy(() => resource)

      StubCollections.stub(Examples)
      examples = _(3).times(() => Factory.create('example', { buildId: resource._id }))
    })

    describe('#examples', function () {
      it('should return examples associated with the resource', function () {
        expect(subject.examples().fetch()).to.eql(examples)
      })
    })
  })
})
