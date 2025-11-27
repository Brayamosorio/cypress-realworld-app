class LoginPage {
  visit() {
    cy.visit("/");
  }

  fillUsername(username) {
    cy.getBySel("signin-username").clear().type(username);
  }

  fillPassword(password) {
    cy.getBySel("signin-password").clear().type(password);
  }

  checkRememberMe() {
    cy.getBySel("signin-remember-me").find("input").check();
  }

  submit() {
    cy.getBySel("signin-submit").click();
  }

  signIn(username, password, rememberUser = false) {
    this.visit();
    this.fillUsername(username);
    this.fillPassword(password);

    if (rememberUser) {
      this.checkRememberMe();
    }

    this.submit();
  }
}

export default LoginPage;
