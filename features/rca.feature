Feature: Root Cause Analysis

  Scenario: Analyze root cause for a log
    When I call the rca_analyze tool with log "CHANGELOG.md"
    Then the result should include "RCA"
