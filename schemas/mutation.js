const graphql = require("graphql")
const { db } = require("../database/pgAdaptor")
const { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLInputObjectType } = graphql
const { userType } = require("./types")
const { partialUpdate, getID, addSkill, updateSkills, checkUser, updateUser, getSkills } = require("../services/database")

// Types for Input because Object Types aren't acceptable
const skillInput = new GraphQLInputObjectType({
  name: "skillinput",
  type: "Input",
  fields: {
    name: { type: GraphQLString },
    rating: { type: GraphQLInt }
  }
})
const userInput = new GraphQLInputObjectType({
  name: "userInput",
  type: "Input",
  fields: {
    name: { type: GraphQLString },
    picture: { type: GraphQLString },
    company: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    skills: {
      type: new GraphQLList(skillInput)
    }
  }
})

// Mutation Endpoints
const RootMutation = new GraphQLObjectType({
  name: "RootMutationType",
  type: "Mutation",
  fields: {
    // addUser endpoint
    addUser: {
      type: userType,
      // Mutation Arguments
      args: {
        name: { type: GraphQLString },
        picture: { type: GraphQLString },
        company: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
        skills: {
          type: new GraphQLList(skillInput)
        }
      },
      // Resolver
      async resolve (parentValue, args) {
        const createdUser = await checkUser(args.email)
        // Checks if user email is already in use
        if (createdUser === false) {
          // Partial updating values
          const value = partialUpdate(args)
          const query = `INSERT INTO users (${value[1]}) VALUES(${value[2]})`
          const values = value[0]
          return db
            .none(query, values) // We aren't expecting anything back from the mutation
            .then(async function () {
              // Adding skills of the user
              const skills = args.skills
              const id = await getID(args.email)
              for (let i = 0; i < skills.length; i++) {
                await addSkill(skills[i], id)
              }
            })
            .then(function () {
              return args
            })
            .catch(err => console.log(err))
        } else {
          throw new Error('User email is in use')
        }
      }
    },
    // addUsers endpoint
    addUsers: {
      type: GraphQLString,
      // Mutation Arguments
      args: {
        user: { type: new GraphQLList(userInput) }
      },
      // Resolver
      async resolve (parentValue, args) {
        // Loops through all users
        for (let i = 0; i < args.user.length; i++) {
          const createdUser = await checkUser(args.user[i].email)
          // Checks if user is already added
          if (createdUser === false) {
            // Partial updating values
            const value = partialUpdate(args.user[i])
            const query = `INSERT INTO users (${value[1]}) VALUES(${value[2]})`
            const values = value[0]
            return db
              .none(query, values)
              .then(async function () {
                // Adding skills of the user
                const skills = args.user[i].skills
                const id = await getID(args.user[i].email)
                for (let i = 0; i < skills.length; i++) {
                  await addSkill(skills[i], id)
                }
              })
              .then(function () {
                return args
              })
              .catch(err => console.log(err))
          } else {
            throw new Error('User email is in use')
          }
        }
      }
    },
    // updateUser endpoint
    updateUser: {
      type: userType,
      // Mutation arguments
      args: {
        name: { type: GraphQLString },
        picture: { type: GraphQLString },
        company: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
        skills: {
          type: new GraphQLList(skillInput)
        }
      },
      // Resolver
      async resolve (parentValue, args) {
        const createdUser = await checkUser(args.email)
        // Checks if user exists
        if (createdUser === true) {
          // Update all user info EXCEPT skills
          await updateUser(args)
          // Updating skills
          const skills = args.skills
          // Checks if skills was provided
          if (args.skills != null) {
            // Pass in id of user to get skills
            const id = await getID(args.email)
            await updateSkills(skills, id)
          }
          // We need to return the updated user info.
          const query = `SELECT * FROM users WHERE email=$1`
          const values = [args.email]
          return db
            .one(query, values)
            .then(async (res) => {
              const id = await getID(args.email)
              // Pass in id of user to get skills
              res.skills = await getSkills(id)
              return res
            })
            .catch(err => console.log(err))
        } else {
          throw new Error('User email does not exist')
        }
      }
    }
  }
})

exports.mutation = RootMutation
