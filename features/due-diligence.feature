Feature: Due Diligence Checks

  Scenario: Run due-diligence check
    When I call the due_check tool with path "." and format "md"
    Then the result should include "Due Diligence Report"
