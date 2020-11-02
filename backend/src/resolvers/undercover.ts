import _ from 'lodash';

export default {
    Query: {
    },
    Mutation: {
        newUndercoverRoom: async (parent, args, context, info) => {
            const room = await context.prisma.createUndercoverRoom({
                name: args.data.settings.name,
                host: { connect: { id: args.data.userId}},
                players: { create: [{
                    user: { connect: { id: args.data.userId } },
                    description: "N'est pas bizarre, juste en édition limitée"
                }]}
            })
            return {
                roomId: room.id
            }
        },
        joinUndercoverRoom: async (parent, args, context, info) => {
            const descriptions = [
                "N'est pas bizarre, juste en édition limitée",
                "",
            ]

            let description = descriptions[Math.floor(Math.random() * descriptions.length)]

            const player = await context.prisma.updateUndercoverRoom({
                where: {
                    id: args.data.roomId
                },
                data:{
                    players: { create: {
                        user: { connect: { id: args.data.userId }},
                        description: description
                    }}
                }
            })
            return {
                roomId: args.data.roomId
            }
        },
        kickUndercoverPlayer: async (parent, args, context, info) => {
            let currentPlayers = await context.prisma.undercoverRoom({ id: args.data.roomId }).players()
            let newCurrentPlayers = currentPlayers.filter( x => x.id !== args.data.playerId)

            await context.prisma.updateUndercoverRoom({
                where: {
                    id: args.data.roomId
                },
                data:{
                    players: { set: newCurrentPlayers.map( x => ({ id: x.id })) }
                }
            })

            await context.prisma.deleteUndercoverPlayer({
                id: args.data.playerId
            })

            return {
                roomId: args.data.roomId
            }
        }
    }
}
