Feature: Architecture Decision Records

  Scenario: Generate an architecture decision record
    When I call the arch_adr tool with system "test-system"
    Then the result should include "ADR: Decision Title"
