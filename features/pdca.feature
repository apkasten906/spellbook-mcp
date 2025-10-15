Feature: PDCA Artifact Generation

  Scenario: Generate a PDCA artifact for the plan phase
    When I call the pdca_generate tool with phase "plan" and artifact "Test Artifact"
    Then the result should include "PDCA · PLAN · Test Artifact"
