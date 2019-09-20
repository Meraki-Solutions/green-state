/// <reference types="Cypress" />

context('green-state ioc', () => {

  it('can leverage <Inject/> to get things out of the container', () => {
      cy.visit('localhost:1234/inject');
      cy.get('h1').should('have.text', 'Inject');
      cy.get('#value').should('have.text', 'injected');
    });

    it('can leverage @withDependencies to inject an instance into a class component', () => {
      cy.visit('localhost:1234/withDependencies');
      cy.get('h1').should('have.text', 'With Dependencies');
      cy.get('#value').should('have.text', 'dependency');
    });

    it('can leverage `useInstance` to inject an instance into a render function using react hooks', () => {
      cy.visit('localhost:1234/useInstance');
      cy.get('h1').should('have.text', 'Use Instance');
      cy.get('#value').should('have.text', 'instance');
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
