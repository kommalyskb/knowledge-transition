# Knowledge Transition — public investor site

This directory is intentionally designed to become a **separate public GitHub repository**. It contains only the public marketing and investor narrative for Knowledge Transition by Telbiz Co., LTD.

## Privacy boundary

The private programme documents remain outside this directory under the local `docs/` tree. Never copy papers, evidence receipts, source data, prototype files or the private Document Directory into this repository.

The deployment build uses a strict allowlist. Only these files can enter the GitHub Pages artifact:

- `index.html`
- `styles.css`
- `script.js`
- `404.html`
- `robots.txt`
- `.nojekyll`
- `og.png`, when present

Run `npm run verify` to check the boundary and `npm run build` to create the public `dist/` artifact.

## Publishing

1. Create a new **public** GitHub repository for this directory only.
2. Copy or push only the contents of `public-site/` into that repository.
3. Use `main` as the default branch.
4. In repository settings, configure GitHub Pages to use **GitHub Actions**.
5. Push to `main`; the included workflow verifies the boundary, builds an allowlisted artifact and deploys it.

The workflow follows GitHub's official Pages artifact/deployment model. The private project repository should remain local or in a separate private repository.

## Before public launch

- Add the Founder's preferred public contact email or scheduling link.
- Confirm the final public repository and domain names.
- Review every claim against the current product stage.
- Keep the pre-pilot and pre-production status visible until evidence changes.
