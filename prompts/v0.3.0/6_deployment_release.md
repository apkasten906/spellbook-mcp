---
version: 0.3.0
phase: Deployment & Release
preferred_model: GPT-5 (ChatGPT Web)
backup_model: Gemini 2.5 Pro
---

<!-- Assistant priming: Default to CONTRIBUTING.md rules: include CI/CD best practices, small atomic PRs, rollback plans, and test hooks. When producing pipeline YAML, suggest branch names and protections matching the contribution policy. -->

### Prompt: CI/CD Pipeline Author

> Create a GitHub Actions YAML pipeline for building, testing, and deploying {{service_name}} to {{environment}}.
> Include rollback and artifact retention logic.

### Prompt: Infrastructure-as-Code Assistant

> Generate Terraform definitions for:
>
> - VPC + Subnets
> - EC2 or ECS setup
> - IAM roles (least privilege)
