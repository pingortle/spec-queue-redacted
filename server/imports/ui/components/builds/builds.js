import { Meteor } from 'meteor/meteor'
import { Builds } from '../../../api/builds/builds.js'
import './builds.html'
import './builds.less'

Template.builds.viewmodel({
  builds: () => Builds.find({}),
  submit: function (event) {
    event.preventDefault()
    const archiveUrl = this.archiveUrl()
    console.log(archiveUrl)
    Meteor.call('builds.createJob', { archiveUrl })
  },
  autorun: function () {
    Meteor.subscribe('builds.all')
  }
})
