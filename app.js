const express = require('express')

// For https requests
const cors = require('cors')

// For debugging
const morgan = require('morgan')

// GraphQL imports

const { graphqlHTTP } = require('express-graphql')
const { GraphQLSchema } = require('graphql')

// Express
const app = express()

// Using apis

app.use(morgan('combined'))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.json())
app.use(cors())

// Query and Mutation Endpoints
const { query } = require("./schemas/query")
const { mutation } = require("./schemas/mutation")

// Schemas
const schema = new GraphQLSchema({
  query,
  mutation
})

// Initalize graphql route
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: { headerEditorEnabled: true } // Visual playthrough
  })
)

// For setting up the database - DO NOT UNCOMMENT FOR DEPLOYMENT
// const userRoutes = require('./routes/user')
// app.use('/user', userRoutes)

module.exports = app
