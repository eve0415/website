import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'node_modules/@octokit/graphql-schema/schema.graphql',
  documents: ['src/**/*.graphql'],
  generates: {
    'src/generated/github-graphql.ts': {
      // typescript-operations alone emits every type we import, plus the enums
      // our operations reference. Adding the `typescript` plugin re-declared
      // those enums (TS2300) and dumped 7.7k lines of unused schema types.
      plugins: ['typescript-operations'],
      config: {
        strictScalars: true,
        scalars: {
          Base64String: 'string',
          BigInt: 'string',
          CustomPropertyValue: 'string',
          Date: 'string',
          DateTime: 'string',
          GitObjectID: 'string',
          GitRefname: 'string',
          GitSSHRemote: 'string',
          GitTimestamp: 'string',
          HTML: 'string',
          PreciseDateTime: 'string',
          URI: 'string',
          X509Certificate: 'string',
        },
        enumsAsTypes: true,
      },
    },
  },
};

export default config;
