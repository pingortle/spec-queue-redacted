import { Meteor } from 'meteor/meteor'
import { Builds } from '../../../api/builds/builds.js'
import './builds.html'
import './builds.less'

Template.builds.viewmodel({
  builds: () => Builds.find({}),
  displayStatus: status => (status || 'running'),
  destroy: function (subject) {
    Meteor.call('builds.destroy', { buildId: subject._id }, (error) => {
      if (error) console.error(error)
    })
  },
  autorun: function () {
    Meteor.subscribe('builds.all')
  }
})
