Feature: MCP Server Tooling

  Scenario: Debug World context
    Given I print the world context

  Scenario: List available prompt templates
    When I call the prompt_list tool with base "prompts/v0.3.0"
    Then I should receive a list of markdown files

  Scenario: Read a prompt template
    When I call the prompt_read tool with file "prompts/v0.3.0/1_requirements_planning.md"
    Then I should receive the contents of the file

  Scenario: List slash-style commands
    When I call the prompt_commands tool
    Then I should receive the contents of COMMANDS.md

  Scenario: Generate a PDCA artifact for the plan phase
    When I call the pdca_generate tool with phase "plan" and artifact "Test Artifact"
    Then the result should include "PDCA · PLAN · Test Artifact"

  Scenario: Run due-diligence check
    When I call the due_check tool with path "." and format "md"
    Then the result should include "Due Diligence Report"

  Scenario: Create a retrospective skeleton
    When I call the retro_create tool with type "iteration" and window "30d"
    Then the result should include "Retrospective (iteration) · Window: 30d"

  Scenario: Draft an API spec scaffold
    When I call the api_scaffold tool with name "testapi"
    Then the result should include "OpenAPI scaffold"

  Scenario: Generate a CI/CD pipeline template
    When I call the ci_configure tool with service "github" and env "dev"
    Then the result should include "CI/CD Template (github, dev)"

  Scenario: Plan tests for a file
    When I call the tests_plan tool with scope "file" and target "server.js"
    Then the result should include "Test Plan"

  Scenario: Analyze root cause for a log
    When I call the rca_analyze tool with log "CHANGELOG.md"
    Then the result should include "RCA"

  Scenario: Generate an architecture decision record
    When I call the arch_adr tool with system "test-system"
    Then the result should include "ADR: Decision Title"
