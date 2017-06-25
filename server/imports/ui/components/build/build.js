import { Meteor } from 'meteor/meteor'
import { Examples } from '/imports/api/examples/examples.js'
import './build.html'

Template.build.viewmodel({
  examples() {
    return Examples.find({ buildId: this.resource()._id })
  },
  prettyExamples() {
    return this.examples().map((example) => '\n' + JSON.stringify(example, null, '  '))
  },
  jobIds() {
    return this.resource().jobIds || []
  },
  prettyJobIds() {
    return this.jobIds().join(', ')
  },
  autorun() {
    const parameters = { buildId: this.resource()._id }
    const log = (error, result) => console.log('Error?:', error, `complete?: ${result}`)
    Meteor.call('builds.satisfied?', parameters, log)
  }
})
