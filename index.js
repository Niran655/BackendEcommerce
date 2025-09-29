import { startStandaloneServer } from "@apollo/server/standalone";
import { ApolloServer } from "@apollo/server";

import { resolvers } from "./resolvers.js";
import { typeDefs } from "./typeDefs.js";
import { connectDB } from "./db.js";
import { buildContext } from "./auth.js";


await connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: process.env.PORT || 4000 },
  context: async ({ req }) => buildContext({ req }),
});

console.log(`🚀 Server ready at ${url}`);
