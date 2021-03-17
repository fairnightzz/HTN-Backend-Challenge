const graphql = require("graphql")
const { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt } = graphql

// The skills output
const skillType = new GraphQLObjectType({
  name: "skill",
  type: "Query",
  fields: {
    name: { type: GraphQLString },
    rating: { type: GraphQLInt }
  }
})

// The skill frequency output
const skillFreq = new GraphQLObjectType({
  name: "skillFreq",
  type: "Query",
  fields: {
    name: { type: GraphQLString },
    frequency: { type: GraphQLInt }
  }
})

// The user output
const userType = new GraphQLObjectType({
  name: "user",
  type: "Query",
  fields: {
    name: { type: GraphQLString },
    picture: { type: GraphQLString },
    company: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    skills: {
      type: new GraphQLList(skillType)
    }
  }
})

// Consider using fragments due to duplicate code.
// Not sure if I have to use another type, but it's good in case we need to extend
const usersType = new GraphQLObjectType({
  name: "users",
  type: "Query",
  fields: {
    name: { type: GraphQLString },
    picture: { type: GraphQLString },
    company: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    skills: {
      type: new GraphQLList(skillType)
    }
  }
})

exports.usersType = usersType
exports.userType = userType
exports.skillType = skillType
exports.skillFreq = skillFreq
