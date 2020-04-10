import jwt from 'jsonwebtoken'
import _ from 'lodash';

export default {
    Query: {
        loggedInUser: async (parent, args, context, info) => {
            console.log(context.userId)
            return context.binding.query.user({ where: { id: context.userId } }, info)
        },
        user: async (parent, args, context, info) => {
            const userExists = await context.binding.exists.User({
                id: args.where.id,
            })
            if(!userExists) {
                throw new Error("Access error")
            }

            return context.binding.query.user(args, info)
        }
    },
    Mutation: {
        login: async (parent, args, context, info) => {
            const user = await context.prisma.user({ email: args.data.email })
            if (!user) {
                throw new Error(`No such user found for email: ${args.data.email}`)
            }

            if (args.data.password !== user.password) {
                throw new Error('Invalid password')
            }

            return {
                token: jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: 60 * 120 }),
                user
            }
        },

        signup: async (parent, args, context, info) => {
            const user = await context.prisma.createUser({
                email: args.data.email,
                password: args.data.password,
                firstname: args.data.firstname,
                lastname: args.data.lastname
            })
            return user.id
        }
    }
}
