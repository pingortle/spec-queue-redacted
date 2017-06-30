import { Meteor } from 'meteor/meteor'
import './body.html'

Template.App_body.viewmodel({
  autorun() {
    Meteor.subscribe('builds.all')
  }
})
