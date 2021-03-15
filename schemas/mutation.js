const graphql = require("graphql");
const { db } = require("../database/pgAdaptor");
const { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLInputObjectType} = graphql;
const { skillType, userType } = require("./types");
const { partialUpdate, getID, addSkill, updateSkills ,checkUser } = require("../services/database");

const skillInput = new GraphQLInputObjectType({
    name: "skillinput",
    type: "Input",
    fields: {
        name: { type: GraphQLString },
        rating: { type: GraphQLInt}
    }
});
const userInput = new GraphQLInputObjectType({
    name: "userInput",
    type: "Input",
    fields : {
        name: { type: GraphQLString },
        picture: { type: GraphQLString },
        company: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
        skills: {
            type: new GraphQLList(skillInput),
        }
    }
});

const RootMutation = new GraphQLObjectType({
    name: "RootMutationType",
    type: "Mutation",
    fields : {
        addUser: {
            type: userType,
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
            async resolve(parentValue, args) {
                const createdUser = await checkUser(args.email);
                if (createdUser === false) {
                    const value = partialUpdate(args);
                    const query = `INSERT INTO users (${value[1]}) VALUES(${value[2]})`;
                    const values = value[0];
                    return db
                        .none(query,values)
                        .then(async function() {
                            const skills = args.skills;
                            const id = await getID(args.email);
                            for (var i = 0; i < skills.length; i++) {
                                await addSkill(skills[i],id);
                            }
                        })
                        .then(function() {
                            return args
                        })
                        .catch(err => console.log(err));
                }
                else {
                    throw 'User email is in use';
                }
                //const query = `INSERT INTO users (email, name, picture, company, phone)`
            }
        },
        addUsers: {
            type: GraphQLString,
            args: {
                user: {type: new GraphQLList(userInput)}
            },
            async resolve(parentValue, args) {

                for (var i = 0; i< args.user.length; i++) {
                    const createdUser = await checkUser(args.user[i].email);
                    if (createdUser === false) {
                        const value = partialUpdate(args.user[i]);
                        const query = `INSERT INTO users (${value[1]}) VALUES(${value[2]})`;
                        const values = value[0];
                        return db
                            .none(query,values)
                            .then(async function() {
                                const skills = args.user[i].skills;
                                const id = await getID(args.user[i].email);
                                for (var i = 0; i < skills.length; i++) {
                                    await addSkill(skills[i],id);
                                }
                            })
                            .then(function() {
                                return args
                            })
                            .catch(err => console.log(err));
                    }
                    else {
                        throw 'User email is in use';
                    }
                }
               //const query = `INSERT INTO users (email, name, picture, company, phone)`
            }
        },

        updateUser: {
            type: userType,
            args: {
                name: { type: GraphQLString },
                picture: { type: GraphQLString },
                company: { type: GraphQLString },
                email: { type: GraphQLString },
                phone: { type: GraphQLString },
                skills: {
                    type: new GraphQLList(skillInput),
                }
            },
            async resolve(parentValue, args) {
                const createdUser = await checkUser(args.email);
                if (createdUser === true){
                    const value = partialUpdate(args);
                    const query = `UPDATE users SET(${value[1]}) = (${value[2]}) WHERE email='${args.email}'`;
                    const values = value[0];
                    return db
                        .none(query,values)
                        .then(async function() {
                            const skills = args.skills;
                            if (args.skills !=null) {
                                const id = await getID(args.email);
                                await updateSkills(skills,id);
    
                            }
                       })
                        .then(async function() {
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
                        })
                        .catch(err => console.log(err));
                }
                else {
                    throw 'User email does not exist';
                }
                //const query = `INSERT INTO users (email, name, picture, company, phone)`
            }
        },


    }
})


exports.mutation = RootMutation;