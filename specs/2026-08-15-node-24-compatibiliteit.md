# Node 24-compatibiliteit

`2026-08-15` · Ramiro Hammen · TODO: ticket/PR-link

## Waarom

AWS faseert de huidige Lambda-runtime uit; blijven we op `nodejs22.x`, dan kunnen we op termijn niet meer deployen of de functie updaten. De service moet daarom over op de `nodejs24.x`-runtime, en lokaal ontwikkelen, CI en deploy moeten op Node 24 blijven werken.

## Scope

- **Wel:** alle Node-versie-pins bijwerken naar 24 (`package.json` engines, `serverless.yml`, `serverless.example.yml`, CI-workflows).
- **Niet:** Sharp bumpen — 0.33.5 draait op Node 24 (prebuilt Node-API-binaries, engines staan ≥21 toe); een bump naar 0.34/0.35 verandert de beelduitvoer en vergt fixture-regeneratie, dat is een losse wijziging.
- **Niet:** functionele wijzigingen aan de scaler (conversieregels, API, paden), refactors of nieuwe features.

## Acceptatiecriteria

1. `package.json` `engines.node` staat op `24`.
2. `serverless.yml` en `serverless.example.yml` gebruiken `runtime: nodejs24.x` en `npx serverless print` valideert zonder fouten (`configValidationMode: error`).
3. Alle CI-workflows draaien op `node-version: "24.x"` en zijn groen.
4. `yarn test` slaagt lokaal op Node 24 (op macOS, conform de bestaande platform-beperking van de fixtures).
5. Een staging-deploy op de `nodejs24.x`-runtime slaagt, en een testafbeelding wordt via `/scaled/width:500_height:500/...` correct geschaald en teruggeschreven naar de bucket.
6. De wijziging landt op een nieuwe `v5.x`-branch en `CHANGELOG.md` vermeldt v5.0 met de runtime-wijziging als breaking change.

## Uitgezocht

- Versionering volgt semver: dit is een breaking change (`serverless.example.yml` wijzigt en de engines-pin laat Node 22 vallen), dus een nieuwe major → `v5.x`-branch.

- `osls` 3.61.1 (de huidige versie) accepteert `runtime: nodejs24.x` al — geen tooling-bump nodig.
- Sharp 0.33.5 draait ongewijzigd op Node 24: de engines-range (`>=21.0.0`) dekt Node 24 en de prebuilt binaries zijn Node-API-gebaseerd (ABI-stabiel). Fixtures blijven dus geldig.
