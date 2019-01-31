/**
 * @file Provides the `App`
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import Express from 'express'
import { BuildSchema } from 'graphql'
import Couchbase from 'couchbase'
import ExpressGraphQL from 'express-graphql'
import UUID from 'uuid'
import cors from 'cors'
import moment from 'moment'

var cluster = new Couchbase.Cluster(process.env.COUCHBASE_HOST || config.couchbase.server)
cluster.authenticate("administrator", "car3tak3")
var bucket = cluster.openBucket(process.env.COUCHBASE_BUCKET || config.couchbase.bucket)

var schema = BuildSchema(`
  type Query {
    account(id: String!): Account
    accounts: [Account]
    glossaryentry(id: String!): GlossaryEntry
    glossaryentries(account: String!, searchTerm: String): [GlossaryEntry]
  }
  type Account {
    id: String
    firstname: String
    lastname: String
    email: String
    ctime: String!
    mtime: String!
  }
  type GlossaryEntry {
    id: String
    account: String!
    title: String
    byline: String
    content: String
    ctime: String!
    mtime: String!
  }
  type Mutation {
    createAccount(
      firstname: String!
      lastname: String!
      email: String!): Account
    updateAccount(
      firstname: String!
      lastname: String!
      email: String!): Account
    createGlossaryEntry(
      account: String!
      title: String!
      byline: String
      content: String!): GlossaryEntry
    updateGlossaryEntry(
      account: String!
      id: String!
      type: String!
      title: String!
      byline: String
      content: String!): GlossaryEntry
    deleteGlossaryEntry(
      account: String!
      id: String!
      type: String!
      title: String!
      byline: String
      content: String!): GlossaryEntry
  }
`)

var resolvers = {
  // Queries
  account: (data) => {
    var id = data.id
    return new Promise((resolve, reject) => {
      bucket.get(id, (error, result) => {
        if(error) return reject(error)
        resolve(result.value)
      })
    })
  },
  accounts: () => {
    var statement = "SELECT META(account).id, account.* FROM `" +
      bucket._name + "` AS account WHERE account.type = 'account'"
    var query = Couchbase.N1qlQuery.fromString(statement)
    return new Promise((resolve, reject) => {
      bucket.query(query, (error, result) => {
        if(error) return reject(error)
        resolve(result)
      })
    })
  },
  glossaryentry: (data) => {
    var id = data.id
    return new Promise((resolve, reject) => {
      bucket.get(id, (error, result) => {
        if(error) return reject(error)
        resolve(result.value)
      })
    })
  },
  glossaryentries: (data) => {
    var statement = "SELECT META(entry).id, entry.* FROM `" +
      bucket._name +
      "` AS entry WHERE entry.type = 'glossaryentry'" +
      " AND entry.account = '" +
      data.account + "'"
    if (data.searchTerm) {
      statement += " AND CONTAINS(LOWER(entry.title), '" + data.searchTerm.toLowerCase() + "')"
    }
    statement += " ORDER BY entry.title ASC"
    var query = Couchbase.N1qlQuery.fromString(statement)
    return new Promise((resolve, reject) => {
      bucket.query(query, (error, result) => {
        if(error) return reject(error)
        resolve(result)
      })
    })
  },
  // Mutations
  createAccount: (data) => {
    var id = UUID.v4()
    data.type = "account"
    return new Promise((resolve, reject) => {
      bucket.insert(id, data, (error, result) => {
        if(error) return reject(error)
        resolve(data)
      })
    })
  },
  createGlossaryEntry: (data) => {
    var id = UUID.v4()
    data.type = "glossaryentry"
    return new Promise((resolve, reject) => {
      bucket.insert(id, data, (error, result) => {
        if(error) return reject(error)
        data.id = id
        resolve(data)
      })
    })
  },
  updateGlossaryEntry: (data) => {
    var id = data.id
    delete data.id
    return new Promise((resolve, reject) => {
      bucket.replace(id, data, (error, result) => {
        if(error) return reject(error)
        data.id = id
        resolve(data)
      })
    })
  },
  deleteGlossaryEntry: (data) => {
    var id = data.id
    return new Promise((resolve, reject) => {
      bucket.remove(id, (error, result) => {
        if(error) return reject(error)
        data.id = id
        resolve(data)
      })
    })
  }
}

var App = Express()

var opts = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
App.use(cors(opts))
App.disable("x-powered-by")

App.use("/graphql", ExpressGraphQL({
      schema: schema,
      rootValue: resolvers,
      graphiql: true
}))

App.listen(4000, () => {
  console.log("Listening at http://localhost:4000/")
})
