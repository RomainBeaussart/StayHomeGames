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
                    user: { connect: { id: args.data.userId }}
                }]}
            })
            return {
                roomId: room.id
            }
        }
    }
}
