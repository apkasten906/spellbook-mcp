const { Given, When, Then } = require('@cucumber/cucumber');

Given('the system is in a known state', function () {
  // For demonstration, set a known state variable
  this.state = { ready: true };
});

When('the user performs an action', function () {
  // Simulate an action that changes the state
  if (!this.state) this.state = {};
  this.state.actionPerformed = true;
});

Then('the expected outcome should occur', function () {
  // Check that the action was performed
  if (!this.state || !this.state.actionPerformed) {
    throw new Error('Expected action to be performed, but it was not.');
  }
});
