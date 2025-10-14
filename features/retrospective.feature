Feature: Retrospective Creation

  Scenario: Create a retrospective skeleton
    When I call the retro_create tool with type "iteration" and window "30d"
    Then the result should include "Retrospective (iteration) · Window: 30d"
