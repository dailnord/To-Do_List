/// <reference types="cypress" />

describe('Smoke test - ToDo App', () => {
  it('Servidor responde y app-root está presente', () => {
    // Comprueba que la ruta raíz responde (status 200)
    cy.request('/').its('status').should('eq', 200)

    // Abre la app en la baseUrl configurada y valida que el componente raíz existe
    cy.visit('/')
    cy.get('app-root').should('exist')
  })
})
