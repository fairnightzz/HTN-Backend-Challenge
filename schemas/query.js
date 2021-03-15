const { db } = require("../database/pgAdaptor")
const graphql = require("graphql")
const { usersType, userType, skillFreq } = require("./types")
const { getID, getSkills } = require("../services/database")
const { GraphQLObjectType, GraphQLList, GraphQLInt, GraphQLID } = graphql
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  type: "Query",
  fields: {
    users: {
      type: new GraphQLList(usersType),
      resolve () {
        // Take all users.
        const query = `SELECT * FROM users`
        return db
          .manyOrNone(query)
          .then(async (res) => {
            for (let i = 0; i < res.length; i++) {
              const id = await getID(res[i].email)
              res[i].skills = await getSkills(id)
            }
            return res
          })
          .catch(err => err)
      }
    },
    user: {
      type: userType,
      args: { email: { type: GraphQLID } },
      resolve (parentValue, args) {
        const query = `SELECT * FROM users WHERE email=$1`
        const values = [args.email]
        return db
          .one(query, values)
          .then(async (res) => {
            const id = await getID(args.email)
            res.skills = await getSkills(id)
            return res
          })
          .catch(err => console.log(err))
      }

    },
    skills: {
      type: new GraphQLList(skillFreq),
      args: {
        min_frequency: { type: GraphQLInt },
        max_frequency: { type: GraphQLInt }
      },
      async resolve (parentValue, args) {
        const minFrequency = args.min_frequency
        const maxFrequency = args.max_frequency
        let values = []
        let query = `SELECT s.name, COUNT(*) AS frequency FROM usertoskill u JOIN skills s ON s.skill_id = u.skill_id GROUP BY s.name `
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
        console.log(query)
        return db
          .manyOrNone(query, values)
          .then(res => res)
      }
    }
  }
})

exports.query = RootQuery
