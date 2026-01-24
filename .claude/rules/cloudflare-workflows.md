# Cloudflare Workflows Serialization

Steps return values that persist across restarts. Only serializable data allowed.

## Serializable Types

**DO**: Return primitives and plain objects

- `string`, `number`, `boolean`
- `Array` with serializable elements
- `Object` with serializable values

**DON'T**: Return non-serializable types

- `Function`, `Symbol`
- Objects with circular references
- Class instances with methods
- DB connections, Response objects

## Step Scope

**DO**: Create resources inside steps

```ts
await step.do('name', async () => {
  const db = drizzle(this.env.DB, { schema });
  // use db here only
  return plainData;
});
```

**DON'T**: Share connections across steps

```ts
const db = createDB(); // ❌ Outside step
await step.do('step1', () => db.query()); // db not serializable
```

## Environment Access

Access `this.env` inside steps (not a separate `env` variable):

```ts
await step.do('step', async () => {
  const db = drizzle(this.env.SKILLS_DB, { schema });
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${this.env.API_KEY}` },
  });
  return data;
});
```
