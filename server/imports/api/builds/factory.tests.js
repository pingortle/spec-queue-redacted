import faker from 'faker'
import { Builds } from './builds.js'

Factory.define('build', Builds, {
  jobIds: [],
  examples: [],
  specOptions: [faker.hacker.ingverb(), faker.hacker.noun()],
  createdAt: () => faker.date.past()
})
