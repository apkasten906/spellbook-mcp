Feature: Test Planning

  Scenario: Plan tests for a file
    When I call the tests_plan tool with scope "file" and target "server.js"
    Then the result should include "Test Plan"
