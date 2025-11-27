import LoginPage from "../../pages/LoginPage";
import { User } from "../../../src/models";

describe("Custom Flow", () => {
  const loginPage = new LoginPage();
  let user: User;
  let contact: User;

  beforeEach(() => {
    cy.task("db:seed");

    cy.intercept("POST", "/login").as("loginUser");
    cy.intercept("GET", "/checkAuth").as("getUserProfile");
    cy.intercept("GET", "/notifications").as("notifications");
    cy.intercept("GET", "/transactions/public").as("publicTransactions");
    cy.intercept("GET", "/transactions").as("personalTransactions");
    cy.intercept("GET", "/users*").as("allUsers");
    cy.intercept("GET", "/users/search*").as("usersSearch");
    cy.intercept("POST", "/transactions").as("createTransaction");

    cy.database("filter", "users").then((users: User[]) => {
      user = users[0];
      contact = users[1];
    });
  });

  it("logs in with the page object and completes a payment", () => {
    loginPage.signIn(user.username, "s3cret", true);

    cy.wait([
      "@loginUser",
      "@getUserProfile",
      "@notifications",
      "@publicTransactions",
      "@personalTransactions",
    ]);
    cy.location("pathname").should("equal", "/");

    cy.getBySelLike("new-transaction").click();
    cy.wait("@allUsers");
    cy.getBySel("user-list-search-input").type(contact.firstName, { force: true });
    cy.wait("@usersSearch");
    cy.getBySelLike("user-list-item").contains(contact.firstName).click({ force: true });

    const amount = "21";
    const description = "Custom flow payment";

    cy.getBySelLike("amount-input").type(amount);
    cy.getBySelLike("description-input").type(description);
    cy.getBySelLike("submit-payment").click();
    cy.wait("@createTransaction").its("response.statusCode").should("eq", 200);
    cy.getBySel("alert-bar-success")
      .should("be.visible")
      .and("contain", "Transaction Submitted");

    cy.getBySelLike("create-another-transaction").click();
    cy.getBySel("app-name-logo").find("a").click();
    cy.getBySelLike("personal-tab").click();
    cy.getBySelLike("transaction-item").first().should("contain", description);
  });
});
