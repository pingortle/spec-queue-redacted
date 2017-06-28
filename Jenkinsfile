node('Kas') {
  checkout scm

  stage('Setup') {
    sh "docker-compose build"
  }

  stage('Deploy Infrastructure') {
    sh 'docker-compose run -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY -e AWS_REGION -e MIN_SIZE -e MAX_SIZE -e DESIRED_CAPACITY --rm deploy-infrastructure'
  }

  stage('Test Server') {
    sh 'docker-compose run --rm test-server'
  }

  stage('Deploy Server') {
  sh 'docker-compose run -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY -e AWS_DEFAULT_REGION=$AWS_REGION --rm get-server-secrets'
  sh 'docker-compose run --rm deploy-server'
  }

  stage('Test Worker') {
    // TODO
  }

  stage('Build Worker') {
    sh 'docker-compose run --rm build-worker'
  }

  stage('Deploy Worker') {
    sh 'docker-compose run --rm deploy-worker'
  }

  stage('Test CLI') {
    // TODO
  }

  stage('Build CLI') {
    sh 'docker-compose run --rm build-cli'
  }

  stage('Deploy CLI') {
    sh 'docker-compose run --rm deploy-cli'
  }
}
