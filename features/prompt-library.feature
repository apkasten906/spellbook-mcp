Feature: Prompt Library Management

  Scenario: List available prompt templates
    When I call the prompt_list tool with base "prompts/v0.3.0"
    Then I should receive a list of markdown files

  Scenario: Read a prompt template
    When I call the prompt_read tool with file "prompts/v0.3.0/1_requirements_planning.md"
    Then I should receive the contents of the file
