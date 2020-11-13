import _, { flatMap } from 'lodash';

export default {
    Query: {
        resultUndercoverRoom: async (parent, args,context, info) => {
            let fragmentRoom = `fragment RoomFragmentPlayerList on UndercoverRoom {
                id
                name
                players {
                    id
                    user{
                        id
                        nickname
                    }
                    role
                    word
                }
            }`

            let room = await context.prisma.undercoverRoom({
                id: args.data.roomId
            }).$fragment(fragmentRoom)

            let players = room.players

            let undercovers = players.filter(x => x.role === "UNDERCOVER")
            let cilivans = players.filter(x => x.role === "CIVILIAN")
            let undercoversName = undercovers.map(x => x.user.nickname)

            return {
                civilanWord: cilivans[0].word,
                undercoverWord: undercovers[0].word,
                undercovers: undercoversName,
                mrWhites: []
            }
        },
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

            let propositionsCounts = currentPlayers.map( x => x.propositions.length === 3).filter(x => x === true).length + 1
            let isEndGame = propositionsCounts === currentPlayers.length

            if(isEndGame) {
                await context.prisma.updateUndercoverRoom({
                    where: { id: args.data.roomId },
                    data:{
                        currentPlayer: { disconnect: true },
                        status: 'END_GAME'
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

            let fragmentRoom = `fragment FragmentRoom on Room{
                id
                name
                players {
                    id
                    receivedVotesFrom{
                        id
                    }
                }
            }`

            try{
                await context.prisma.updateManyUndercoverPlayers({
                    where: { room: { id: args.data.roomId } },
                    data:{
                        receivedVotesFrom: { disconnect: { id: args.data.playerId } }
                    }
                })
            } catch (e) {

            }

            await context.prisma.updateUndercoverPlayer({
                where: { id: args.data.thinkIs },
                data:{
                    receivedVotesFrom: { connect: { id: args.data.playerId }}
                }
            })

            let currentPlayers = await context.prisma.undercoverRoom({
                id: args.data.roomId
            }).$fragment(fragmentRoom)

            let players = currentPlayers.players
            let totalVote = players.flatMap(x => x.receivedVotesFrom).length

            if(totalVote === players.length){
                await context.prisma.updateUndercoverRoom({
                    where: { id: args.data.roomId },
                    data:{
                        status: 'LOBBY',
                    }
                })
            }

            return {
                roomId: args.data.roomId
            }
        },
        endGameUndercoverRoom: async (parent, args, context, info) => {
            await context.prisma.deleteManyUndercoverPlayers({
                where: { room: { id: args.data.roomId } }
            })
        },
        newUndercoverRoom: async (parent, args, context, info) => {
            const descriptions = [
                "N'est pas bizarre, juste en édition limitée",
                "Croyant au sport, mais pas pratiquant",
                "Un jour il est né, depuis il improvise",
            ]

            let description = descriptions[Math.floor(Math.random() * descriptions.length)]

            const room = await context.prisma.createUndercoverRoom({
                name: args.data.settings.name,
                host: { connect: { id: args.data.userId}},
                players: { create: [{
                    user: { connect: { id: args.data.userId } },
                    description: description
                }]}
            })
            return {
                roomId: room.id
            }
        },
        joinUndercoverRoom: async (parent, args, context, info) => {
            const descriptions = [
                "N'est pas bizarre, juste en édition limitée",
                "Croyant au sport, mais pas pratiquant",
                "Un jour il est né, depuis il improvise",
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
