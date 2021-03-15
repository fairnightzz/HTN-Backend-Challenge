const graphql = require("graphql");
const { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt } = graphql;


const skillType = new GraphQLObjectType({
    name: "skill",
    type: "Query",
    fields: {
        name: {type: GraphQLString},
        rating: {type: GraphQLInt}
    }
})

const skillFreq = new GraphQLObjectType({
    name: "skillFreq",
    type: "Query",
    fields: {
        name: {type: GraphQLString},
        frequency: {type: GraphQLInt}
    }
})

const userType = new GraphQLObjectType({
    name: "user",
    type: "Query",
    fields : {
        name: { type: GraphQLString },
        picture: { type: GraphQLString },
        company: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
        skills: {
            type: new GraphQLList(skillType),
            
        }
    }
});

// Consider using fragments
const usersType = new GraphQLObjectType({
    name: "users",
    type: "Query",
    fields : {
        name: { type: GraphQLString },
        picture: { type: GraphQLString },
        company: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
        skills: {
            type: new GraphQLList(skillType),
        }
    }
});




exports.usersType = usersType;
exports.userType = userType;
exports.skillType = skillType;
exports.skillFreq = skillFreq;