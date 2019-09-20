/// <reference types="Cypress" />

context('green-state ioc', () => {

  ['inject', 'withDependencies', 'useInstance'].forEach(strategy => {
    
    context(`with ${strategy} strategy`, () => {

      it(`can get things out of the container`, () => {
        cy.visit(`localhost:1234/${strategy}`);
        cy.get('#value').should('have.text', strategy);
      });

    });
  });

  it('must have a root IOC provider', () => {
    cy.visit('localhost:1234/noRootProvider');
    cy.get('#error').should('contain', 'Cannot read property \'get\' of null');
    cy.get('#value').should('not.exist');
  });

  it('can inject from a hierarchical container', () => {
    cy.visit('localhost:1234/injectFromChild');
    cy.get('h1').should('have.text', 'Inject from Child');
    cy.get('#value').should('have.text', 'child');
  });

  it('can inject from a hierarchical container overriding a parent container', () => {
    cy.visit('localhost:1234/overrideParent');
    cy.get('h1').should('have.text', 'Override Parent');
    cy.get('#value').should('have.text', 'child');
  });

  it('hierarchical containers dispose instances', () => {
    // TODO
  });
});
