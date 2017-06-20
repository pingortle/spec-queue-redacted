import './build.html'

Template.build.viewmodel({
  examples() {
    const resource = this.resource() || {}
      return resource.examples || []
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
})
