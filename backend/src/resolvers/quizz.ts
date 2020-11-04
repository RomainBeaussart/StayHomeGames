import _ from 'lodash';

export default {
    Query: {
    },
    Mutation: {
        newQuizzRoom: async (parent, args, context, info) => {
            console.log("aaa")
            const room = await context.prisma.createQuizzRoom({
                name: args.data.settings.name,
                host: { connect: { id: args.data.userId}},
                players: { create: [{
                    user: { connect: { id: args.data.userId } },
                    description: "N'a pas été bercé trop près du mur.. non non non.."
                }]}
            })
            return {
                roomId: room.id
            }
        },
        joinQuizzRoom: async (parent, args, context, info) => {
            const descriptions = [
                "N'a pas été bercé trop près du mur.. non non non..",
                "",
            ]

            let description = descriptions[Math.floor(Math.random() * descriptions.length)]

            const player = await context.prisma.updateQuizzRoom({
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
        kickQuizzPlayer: async (parent, args, context, info) => {
            let currentPlayers = await context.prisma.quizzRoom({ id: args.data.roomId }).players()
            let newCurrentPlayers = currentPlayers.filter( x => x.id !== args.data.playerId)

            await context.prisma.updateQuizzRoom({
                where: {
                    id: args.data.roomId
                },
                data:{
                    players: { set: newCurrentPlayers.map( x => ({ id: x.id })) }
                }
            })

            await context.prisma.deleteQuizzPlayer({
                id: args.data.playerId
            })

            return {
                roomId: args.data.roomId
            }
        }
    }
}
