import faker from 'faker'
import { Builds } from './builds.js'

Factory.define('build', Builds, {
  jobIds: [],
  examples: [],
  createdAt: () => faker.date.past()
})
