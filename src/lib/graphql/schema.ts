import { readFileSync } from "node:fs";
import path from "node:path";
import { gql } from "graphql-tag";
import { DateTimeResolver } from "graphql-scalars";

const basePath = path.join(process.cwd(), "src", "lib", "graphql", "typeDefs");
const commonSDL = readFileSync(path.join(basePath, "common.graphql"), "utf8");
const userSDL = readFileSync(path.join(basePath, "user.graphql"), "utf8");
const recipeSDL = readFileSync(path.join(basePath, "recipe.graphql"), "utf8");

export const typeDefs = gql`
  ${commonSDL}
  ${userSDL}
  ${recipeSDL}
`;

export const resolvers = {
	DateTime: DateTimeResolver,
};
