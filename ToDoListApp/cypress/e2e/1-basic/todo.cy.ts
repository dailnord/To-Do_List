/// <reference types="cypress" />

describe('Interacción básica - ToDo App', () => {
  it('Añade una tarea nueva y la muestra en la lista', () => {
    const taskName = 'Tarea de prueba'

    // Abre la aplicación
    cy.visit('/')

    // Intenta encontrar el primer campo de entrada y escribir la tarea
    // Nota: usamos un selector amplio para mayor compatibilidad con distintas UIs
    cy.get('input, textarea')
      .first()
      .should('be.visible')
      .type(`${taskName}{enter}`)

    // Verifica que la tarea aparezca en la UI
    cy.contains(taskName).should('exist')
  })
})
