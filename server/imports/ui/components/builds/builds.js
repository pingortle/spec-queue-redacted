import { Meteor } from 'meteor/meteor'
import { Builds } from '../../../api/builds/builds.js'
import './builds.html'
import './builds.less'

Template.builds.viewmodel({
  builds: () => Builds.find({}),
  submit: function (event) {
    event.preventDefault()
    const specOptions = this.specOptions()
    console.log(specOptions)
    Meteor.call('builds.createJob', { specOptions })
  },
  destroy: function (subject) {
    Meteor.call('builds.destroy', { buildId: subject._id }, (error) => {
      if (error) console.error(error)
    })
  },
  autorun: function () {
    Meteor.subscribe('builds.all')
  }
})
