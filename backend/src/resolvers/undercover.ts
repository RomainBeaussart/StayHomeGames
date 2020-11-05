import _ from 'lodash';

export default {
    Query: {
    },
    Mutation: {
        playUndercover: async (parent, args, context, info) => {
            let currentPlayers = await context.prisma.undercoverRoom({ id: args.data.roomId }).players()
            let room = await context.prisma.undercoverRoom({ id: args.data.roomId })
            let undercoverIds = []
            let civilianIds = []
            let playerIds = currentPlayers.map(x => x.id)

            /* --- selection Game Set --- */
            let setGame = setGames[Math.floor(Math.random() * setGames.length)]
            let cilianWord = setGame[Math.floor(Math.random() * setGame.length)]
            let undercoverWord = ""
            do {
                undercoverWord = setGame[Math.floor(Math.random() * setGame.length)]
            } while(cilianWord === undercoverWord)

            while (undercoverIds.length < room.undercoverAmount) {
                let player = currentPlayers[Math.floor(Math.random() * currentPlayers.length)]
                undercoverIds.push(player.id)
                undercoverIds = _.uniq(undercoverIds)
            }
            civilianIds = playerIds.filter(function (x) {
                return !undercoverIds.filter(y => y === x).length;
            })

            await context.prisma.updateManyUndercoverPlayers({
                where:{ id_in: undercoverIds },
                data:{
                    role: "UNDERCOVER",
                    propositions: { set: [] },
                    word: undercoverWord,
                }
            })

            await context.prisma.updateManyUndercoverPlayers({
                where:{ id_in: civilianIds },
                data:{
                    role: "CIVILIAN",
                    propositions: { set: [] },
                    word: cilianWord,
                }
            })

            await context.prisma.updateUndercoverRoom({
                where: { id: args.data.roomId },
                data:{
                    status: 'IN_GAME',
                    currentPlayer: { connect: { id: playerIds[Math.floor(Math.random() * playerIds.length)] }}
                }
            })

            return {
                roomId: args.data.roomId
            }
        },
        setRoundUndercover: async(parent, args, context, info) => {
            let currentPlayers = 
            await context.prisma.undercoverRoom({ id: args.data.roomId }).players()
            let currentUser = await context.prisma.undercoverPlayer({ id: args.data.playerId }).user()
            let playerIndex = currentPlayers.map(x => x.id).indexOf(args.data.playerId)
            let newPlayerIndex = playerIndex + 1
            if(currentPlayers.length === newPlayerIndex){
                newPlayerIndex = 0
            }

            let newtPlayerId = currentPlayers[newPlayerIndex].id

            let propositionsCounts = currentPlayers.map( x => x.propositions.length === 3)

            if(propositionsCounts.reduce((accumulator, currentValue) => accumulator && currentValue)) {
                await context.prisma.updateUndercoverRoom({
                    where: { id: args.data.roomId },
                    data:{
                        currentPlayer: { disconnect: true },
                        status: 'LOBBY'
                    }
                })
            } else {
                await context.prisma.updateUndercoverRoom({
                    where: { id: args.data.roomId },
                    data:{
                        currentPlayer: { connect: { id: currentPlayers[newPlayerIndex].id }}
                    }
                })
            }

            console.log("Next Player")

            await context.prisma.updateUndercoverPlayer({
                where:{ id: args.data.playerId },
                data:{
                    user: { connect: { id: currentUser.id }},
                    propositions: { set: [...currentPlayers[playerIndex].propositions, args.data.proposition] }
                }
            })

            return {
                roomId: args.data.roomId
            }
        },
        sendVoteUndercover: async (parent, args, context, info) => {
            await context.prisma.updateUndercoverPlayer({
                where:{ id: args.data.thinkIs },
                data:{
                    receivedVotesFrom: { connect: { id: args.data.playerId } }
                }
            })
            return {
                roomId: args.data.playerId
            }
        },
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

const setGames = [
    ["Cinéma", "Théatre", "Opera"],
    ["Aéroport", "Port", "Gare", "Gare routière"],
    ["Hong Kong","Singapour"],
    ["Gel douche","Shampoing"],
    ["iOS", "Android"],
    ["Batman", "Ironman"],
    ["Fruits", "Légumes"],
    ["Orange", "Citron", "Pamplemousse", "Mandarine", "Clementine"],
    ["Meulon", "Pasteque"],
    ["Yaourt", "Glasse", "Sorbet"],
    ["Call of Duty", "Battlefield"],
    ["Pain chocolat", "Croissant", "Torsade", "Pain suisse"],
    ["Appareil Photo", "Camera"],
    ["Voiture", "Scooter", "Moto", "4x4", "Quad", "Voiture de golf", "Camion"],
    ["Pates à la bolognaise", "Pates à la carbonara", "Pates au pesto", "Pates au saumon", "Pates au thon"],
    ["Pizza", "Flammenküche", "Tarte"],
]
