// OwnerCreateWizardPage — locators only (POM). 10-step listing wizard.
class OwnerCreateWizardPage {
  constructor(page) {
    this.page = page;
    this.stepper = page.getByRole("listitem");
    this.heading = page.getByRole("heading", { level: 1 });

    // Step 1 — Type
    this.typeFamilyFlat = page.getByRole("radio", { name: /Family Flat/i });
    this.typeBachelorFlat = page.getByRole("radio", { name: /Bachelor Flat/i });
    this.suitableFamily = page.getByRole("radio", { name: /Family$/i });
    this.suitableAnyone = page.getByRole("radio", { name: /Anyone/i });

    this.continueButton = page.getByRole("button", { name: "Continue" });
    this.stepCaption = page.getByText(/Step \d+ of 10 · You can save/i);
  }

  path() {
    return "/owner/listings/create";
  }
}

module.exports = OwnerCreateWizardPage;
