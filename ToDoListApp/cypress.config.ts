import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    viewportWidth: 1280,
    viewportHeight: 720,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    retries: { runMode: 2, openMode: 0 },
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 60000,
    screenshotOnRunFailure: true,
    video: true,
    videoCompression: 32,
    env: {
      apiUrl: 'http://localhost:5000/api',
      username: 'testuser',
      password: 'testpass'
    },
    setupNodeEvents(on, config) {
      // Plugins y entorno según config.env
      if (config.env.environment === 'staging') {
        config.baseUrl = 'https://staging.miapp.com'
      }
      if (config.env.environment === 'production') {
        config.baseUrl = 'https://miapp.com'
      }
      return config
    }
  }
})
