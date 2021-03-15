const express = require('express')

// For https
const cors = require('cors')

// For debugging
const morgan = require('morgan')

// Graphql stuff

const { graphqlHTTP } = require('express-graphql')
const { GraphQLSchema } = require('graphql')

// Schemas

const app = express()

// Routes

// const userRoutes = require('./routes/user');

// Using apis

app.use(morgan('combined'))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.json())
app.use(cors())

const { query } = require("./schemas/query")
const { mutation } = require("./schemas/mutation")

const schema = new GraphQLSchema({
  query,
  mutation
})

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: { headerEditorEnabled: true }
  })
)
const userRoutes = require('./routes/user')
app.use('/user', userRoutes)
module.exports = app
