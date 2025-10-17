Feature: Quick smoke
  @quick
  Scenario: Server starts and responds to prompt_list
    Given the MCP server is running
    When I call the "prompt_list" tool
    Then I should receive a non-empty list of prompts
