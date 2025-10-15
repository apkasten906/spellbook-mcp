Feature: Slash-Style Commands

  Scenario: List slash-style commands
    When I call the prompt_commands tool
    Then I should receive the contents of COMMANDS.md
