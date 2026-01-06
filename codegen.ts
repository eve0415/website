import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "node_modules/@octokit/graphql-schema/schema.graphql",
  documents: ["src/**/*.graphql"],
  generates: {
    "src/generated/github-graphql.ts": {
      plugins: ["typescript", "typescript-operations"],
      config: {
        strictScalars: true,
        scalars: {
          Base64String: "string",
          BigInt: "string",
          CustomPropertyValue: "string",
          Date: "string",
          DateTime: "string",
          GitObjectID: "string",
          GitRefname: "string",
          GitSSHRemote: "string",
          GitTimestamp: "string",
          HTML: "string",
          PreciseDateTime: "string",
          URI: "string",
          X509Certificate: "string",
        },
        enumsAsTypes: true,
        onlyOperationTypes: true,
      },
    },
  },
};

export default config;
