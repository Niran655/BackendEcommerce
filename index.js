import { startStandaloneServer } from "@apollo/server/standalone";
import { ApolloServer } from "@apollo/server";

import { resolvers } from "./resolvers.js";
import { typeDefs } from "./typeDefs.js";
import { buildContext } from "./auth.js";
import { connectDB } from "./db.js";
import * as dotenv from 'dotenv'
dotenv.config()

await connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention:false
});

const { url } = await startStandaloneServer(server, {
  listen: { port: process.env.PORT || 4001 },
  context: async ({ req }) => buildContext({ req }),
});

console.log(` Server ready at ${url}`);
