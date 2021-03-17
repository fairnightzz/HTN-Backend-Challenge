const { db } = require("../database/pgAdaptor")
const graphql = require("graphql")
const { usersType, userType, skillFreq } = require("./types")
const { getID, getSkills } = require("../services/database")
const { GraphQLObjectType, GraphQLList, GraphQLInt, GraphQLID } = graphql

// Begin Query
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  type: "Query",
  fields: {
    // Query for getting all users
    users: {
      // What the client wants
      type: new GraphQLList(usersType),
      // Resolver
      resolve () {
        // Take all users.
        const query = `SELECT * FROM users`
        return db
          .manyOrNone(query) // Could return values or no values since the query may be empty
          .then(async (res) => {
            // Get skills of users
            for (let i = 0; i < res.length; i++) {
              const id = await getID(res[i].email)
              res[i].skills = await getSkills(id) // Set the skills of the particular user
            }
            return res
          })
          .catch(err => err)
      }
    },
    // Query for getting a specific user
    user: {
      type: userType,
      // We only need email to identify the user
      args: { email: { type: GraphQLID } },
      // Resolver
      resolve (parentValue, args) {
        const query = `SELECT * FROM users WHERE email=$1`
        const values = [args.email]
        return db
          .one(query, values)
          .then(async (res) => {
            const id = await getID(args.email)
            // Set the response's skills to the skills of the user
            res.skills = await getSkills(id)
            return res
          })
          .catch(err => console.log(err))
      }
    },
    // Query for getting skills with parameter
    skills: {
      type: new GraphQLList(skillFreq),
      // Arguments for frequencies
      args: {
        min_frequency: { type: GraphQLInt },
        max_frequency: { type: GraphQLInt }
      },
      // Resolver
      async resolve (parentValue, args) {
        const minFrequency = args.min_frequency
        const maxFrequency = args.max_frequency
        let values = []
        // Basic Query statement for getting name and frequencies of skills
        let query = `SELECT s.name, COUNT(*) AS frequency FROM usertoskill u JOIN skills s ON s.skill_id = u.skill_id GROUP BY s.name `
        // Logic for partial arguments
        if (minFrequency == null && maxFrequency == null) {
          query += `ORDER BY COUNT(*)`
        } else if (minFrequency == null) {
          query += `HAVING COUNT(*) <=$1 ORDER BY COUNT(*)`
          values = [maxFrequency]
        } else if (maxFrequency == null) {
          query += `HAVING COUNT(*) >=$1 ORDER BY COUNT(*)`
          values = [minFrequency]
        } else {
          query += `HAVING COUNT(*) >=$1 AND COUNT(*) <=$2 ORDER BY COUNT(*)`
          values = [minFrequency, maxFrequency]
        }
        // Sent the query and return
        return db
          .manyOrNone(query, values)
          .then(res => res)
      }
    }
  }
})

exports.query = RootQuery
