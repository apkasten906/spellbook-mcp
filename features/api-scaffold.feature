Feature: API Scaffold Generation

  Scenario: Draft an API spec scaffold
    When I call the api_scaffold tool with name "testapi"
    Then the result should include "OpenAPI scaffold"
