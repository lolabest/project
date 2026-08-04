# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in Bubble Shooter, please report it
responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, email **lunaticvampire1@gmail.com** with:

1. A clear description of the vulnerability
2. Steps to reproduce the issue
3. Potential impact assessment
4. Any suggested remediation (optional)

### What to expect

| Stage              | Timeline                          |
| ------------------ | --------------------------------- |
| Acknowledgement    | Within 72 hours                   |
| Initial assessment | Within 7 days                     |
| Status updates     | At least every 14 days until resolved |
| Public disclosure  | Coordinated after a fix is available |

### Scope

This project is a client-side browser game with no backend. Relevant concerns
include:

* Cross-site scripting via crafted localStorage payloads
* Prototype pollution through unsafe object merges
* Denial of service via unbounded animation/particle allocations
* Abuse of the Web Audio API that could harm users (unexpected loud audio)

Out of scope:

* Social engineering
* Issues requiring physical access to a device
* Vulnerabilities in browsers themselves

We appreciate responsible disclosure and will credit reporters who wish to be
acknowledged in the changelog (unless anonymity is requested).
