# s3-image-scaler — Claude Code instructies

Dit bestand geldt voor iedereen die Claude Code in deze repo gebruikt. Lees het van begin tot eind voordat je begint.

## Project-context

Open-source microservice (MIT, GRRR/grrr-amsterdam) die S3-afbeeldingen on the fly schaalt en converteert. De service draait als 404-handler voor een S3-bucket: bij een miss op een pad als `/scaled/width:500_height:500/foo.jpg` genereert de Lambda de variant en schrijft die terug naar de bucket, zodat vervolgrequests de statische file raken.

- Node.js 24 op AWS Lambda, gedeployd met Serverless (`osls`), package manager is yarn.
- Plain JavaScript (CommonJS), geen TypeScript.
- Beeldbewerking via Sharp. Let op: de Sharp-binaries in `node_modules` zijn gebouwd voor Linux x64 (het Lambda-platform) en werken dus niet lokaal op macOS. Herinstalleren gaat met `npm_config_platform=linux npm_config_arch=x64 yarn add sharp`.
- Kernlogica staat in `util/` (pure functies per bestand), de Lambda-handler in `index.js`, een lokale dev-server in `server/` en een CLI-resizer in `cli/`.
- Branch-per-major-versie: `v1.0`, `v2.x`, `v3.x`, `v4.x`, … Nieuwe features gaan naar de nieuwste versie-branch, bugfixes naar de oudste branch waarin de bug zit. Deploys worden gepind op een git-tag; wijzigingen komen in `CHANGELOG.md`.
- Wijzig je iets aan de conversieregels, voeg dan altijd een unit test toe die het bedoelde gedrag vastlegt.

## Tooling en commando's

- Tests: `yarn test` (Jest). ⚠️ De fixture-vergelijkende tests slagen alleen op macOS — Sharp-output op Linux wijkt licht af.
- Lint: `npx eslint .`
- Format: `npx prettier --write <files>`
- Dev-server: `yarn serve` (lokale image-server op http://localhost:8888, werkt offline zonder AWS)
- CLI-resize: `node cli/resize-image.js <bron> <opties> <doel>`
- Deploy: `npx serverless deploy --stage=staging|production --region eu-central-1`
