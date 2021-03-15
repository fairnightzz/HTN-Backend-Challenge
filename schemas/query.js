const { db } = require("../database/pgAdaptor");
const graphql = require("graphql");
const {usersType, userType, skillType, skillFreq} = require("./types");
const { partialUpdate, getID, addSkill,getSkills, updateSkill ,checkUser,getskillID } = require("../services/database");
const { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLInputObjectType, GraphQLID} = graphql;
const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    type: "Query",
    fields: {
        users: {
            type: new GraphQLList(usersType),
            resolve(){
                // Take all users.
                const query = `SELECT * FROM users`;
                return db
                    .manyOrNone(query)
                    .then(async (res) => {
                        for (var i = 0; i < res.length; i++) {
                            const id = await getID(res[i].email);
                            res[i].skills = await getSkills(id);
                        }
                        return res;
                    })
                    .catch(err => err);
            }
        },
        user: {
            type: userType,
            args: {email: { type: GraphQLID }},
            resolve(parentValue, args) {
                const query = `SELECT * FROM users WHERE email=$1`;
                const values = [args.email];
                return db
                    .one(query,values)
                    .then(async (res) => {
                        const id = await getID(args.email);
                        res.skills = await getSkills(id);
                        return res;
                    })
                    .catch(err => console.log(err));
            }

        },
        skills: {
            type: new GraphQLList(skillFreq),
            args: {
                min_frequency: {type: GraphQLInt},
                max_frequency: {type: GraphQLInt}
            },
            async resolve(parentValue, args) {
                const query = `SELECT s.name, COUNT(*) AS frequency FROM usertoskill u JOIN skills s ON s.skill_id = u.skill_id GROUP BY s.name HAVING COUNT(*) >=$1 AND COUNT(*) <=$2 ORDER BY COUNT(*)`
                const values = [args.min_frequency,args.max_frequency]
                return db
                    .manyOrNone(query,values)
                    .then(res => res)
            }

        }

    }
})

exports.query = RootQuery;