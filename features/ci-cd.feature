Feature: CI/CD Pipeline Generation

  Scenario: Generate a CI/CD pipeline template
    When I call the ci_configure tool with service "github" and env "dev"
    Then the result should include "CI/CD Template (github, dev)"
