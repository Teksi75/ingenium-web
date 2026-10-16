This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Use **pnpm** for this project.

```bash
pnpm install
pnpm dev
```

Other project commands:

```bash
pnpm lint
pnpm build
pnpm start
```

Run `pnpm start` after a successful build.

The project is pnpm-managed: Git tracks `pnpm-lock.yaml` and `pnpm-workspace.yaml`; `package-lock.json` was removed so every environment resolves the same dependency tree. Do not recreate a second lockfile.

## Pending work

Open [`PENDIENTES.md`](PENDIENTES.md) for the live checklist of what is left to do — owner-side external registrations (Search Console, Bing, Business Profile, Vercel crawl settings) and items waiting for owner input. If someone asks "what is left to do?" or "which pending tasks are there?", that file is the answer.

### Development inside OneDrive

`next.config.ts` pins `turbopack.root` to this project directory so a lockfile in a parent folder cannot make Next.js watch the wrong workspace. Development filesystem caching is disabled to avoid opening Turbopack's persistent database on OneDrive, which can fail with `Failed to open database` and Windows cloud timeout `os error 426`.

This only disables the persistent development compilation cache: Next.js still writes normal `.next` output, and other cloud-file failures remain possible. Restarting development may compile more slowly; production build caching is unchanged. No cache deletion, dependency upgrade, security-header change or parent-directory modification is needed.

Run `pnpm exec node --test tests/next-config.test.mjs` to check the configuration and preservation of the existing response headers. A configuration test does not replace checking that `pnpm dev` reaches `Ready` and serves the homepage.

If pnpm reports `ERR_PNPM_IGNORED_BUILDS`, inspect the dependency scripts before making an explicit decision with `pnpm approve-builds`. Do not disable dependency verification or approve all scripts to hide the error. `pnpm-workspace.yaml` approves exactly two reviewed build scripts: `sharp` (`node install/check.js`, prebuilt binary check for Next.js image optimization) and `unrs-resolver` (`napi-postinstall check`, native binding check used by the Next.js ESLint toolchain). Any new ignored build gets inspected the same way before approval.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
