require('dotenv').config()

import { Prisma as PrismaBinding } from 'prisma-binding'
import { GraphQLServer } from 'graphql-yoga'
import { forward } from 'graphql-middleware-forward-binding'
import { formatError } from "apollo-errors";
import serveStatic from 'serve-static'
import path from 'path'
import history from 'connect-history-api-fallback'
import bodyParser from 'body-parser'
import { URL } from 'url';
import { mergeTypes } from 'merge-graphql-schemas'
import {readFileSync} from 'fs';
import { getUserId } from './helpers/user';

import { AccessRightDirective } from './helpers/graphQLDirectives'

import user from './resolvers/user'
import undercover from './resolvers/undercover'

import { Prisma } from '../prisma/generated/prisma-client'

const forwardedRequests = [
    //! Queries
    "Query.user", "Query.users",

    // Undercover
    "Query.undercoverPlayer", "Query.undercoverPlayers",
    "Query.undercoverRoom", "Query.undercoverRooms", "Query.undercoverRoomsConnection",

    //! Mutations
    "Mutation.createUser", "Mutation.updateUser", "Mutation.deleteUser",

    //Undercover
    "Mutation.createUndercoverPlayer", "Mutation.updateUndercoverPlayer", "Mutation.upsertUndercoverPlayer", "Mutation.deleteUndercoverPlayer",
    "Mutation.updateUndercoverRoom", "Mutation.upsertUndercoverRoom", "Mutation.deleteUndercoverRoom",

]

const resolvers = {
    Query: {
        ...user.Query,
        ...undercover.Query,
    },
    Mutation: {
        ...user.Mutation,
        ...undercover.Mutation,
    },
    Subscription: {
        undercoverRoom: {
            subscribe: async (parent, args, context, info) => {
                return context.binding.subscription.undercoverRoom(args, info)
            },
        },
        undercoverPlayer: {
            subscribe: async (parent, args, context, info) => {
                return context.binding.subscription.undercoverPlayer(args, info)
            },
        },
    }
}

const checkUserMiddleware = (resolve, root, args, context, info) => {
    if ((info.parentType == "Query" || info.parentType == "Mutation" || info.parentType == "Subscription") &&
        info.fieldName !== "login" &&
        info.fieldName !== "register") {
        context.userId = getUserId(context)
    }

    return resolve(root, args, context, info)
}

const bindingForwardMiddleware = forward(...forwardedRequests)('binding')

let prisma = new Prisma({
    endpoint: `${process.env.PRISMA_ENDPOINT}/${process.env.PRISMA_SERVICE}/${process.env.PRISMA_STAGE}`
});
let binding = new PrismaBinding({
    typeDefs: './prisma/generated/prisma.graphql',
    endpoint: `${process.env.PRISMA_ENDPOINT}/${process.env.PRISMA_SERVICE}/${process.env.PRISMA_STAGE}`
});

const server = new GraphQLServer({
    typeDefs: mergeTypes([readFileSync('./prisma/generated/prisma.graphql').toString(), readFileSync('./schema.graphql').toString()], { all: true }),
    resolvers,
    middlewares: [bindingForwardMiddleware, checkUserMiddleware], //checkUserMiddleware
    context: (c) => {
        return {
            connection: c.connection,
            request: c.request,
            binding: binding,
            prisma: prisma
        }
    },
})

server.express.use(bodyParser.json({ limit: '50mb' }))
server.express.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}))

server.express.use(function (req, res, next) {
    req.prisma = prisma
    next()
})

server.express.get('/status', (req, res) => {
    res.sendStatus(200)
})

// server.express.use('/reconcileReceipt', reconcileReceiptRouter);

server.express.use(history())
server.express.use(serveStatic(path.join(__dirname, '../../frontend/dist')));

console.log(`Prisma endpoint: ${process.env.PRISMA_ENDPOINT}/${process.env.PRISMA_SERVICE}/${process.env.PRISMA_STAGE}`)

server.start({
    port: process.env.PORT || 4000,
    endpoint: '/prisma.graphql',
    playground: '/playground.graphql',
    subscriptions: '/graphql',
    formatError
}, () => console.log(`Server is running on http://localhost:${process.env.PORT || 4000}`))

