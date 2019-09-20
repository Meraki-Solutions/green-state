/// <reference types="Cypress" />

context('green-state ioc', () => {

  ['inject', 'withDependencies', 'useInstance'].forEach(strategy => {

    context(`with ${strategy} strategy`, () => {

      it(`can get things out of the container`, () => {
        cy.visit(`localhost:1234/${strategy}`);
        cy.get('#value').should('have.text', strategy);
      });

      it('can get from a child container', () => {
        cy.visit(`localhost:1234/${strategy}/injectFromChild`);
        cy.get('#value').should('have.text', `${strategy} FromChild`);
      });

      it('can get from a child container overriding a parent container', () => {
        cy.visit(`localhost:1234/${strategy}/overrideParent`);
        cy.get('#value').should('have.text', `${strategy} FromChild`);
      });

    });
  });

  it('must have a root IOC provider', () => {
    cy.visit('localhost:1234/noRootProvider');
    cy.get('#error').should('contain', 'Cannot read property \'get\' of null');
    cy.get('#value').should('not.exist');
  });

  it('hierarchical containers dispose instances', () => {
    // TODO
  });
});
