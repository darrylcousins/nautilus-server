/**
 * @file Provides the `App`
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
// **NB** fix import statements - see client
const Express = require("express")
const Couchbase = require("couchbase")
const ExpressGraphQL = require("express-graphql")
const BuildSchema = require("graphql").buildSchema
const UUID = require("uuid")
const cors = require("cors")
const moment = require("moment")

var cluster = new Couchbase.Cluster("couchbase://localhost")
cluster.authenticate("administrator", "car3tak3")
var bucket = cluster.openBucket("sandbox")

var schema = BuildSchema(`
  type Query {
    account(id: String!): Account
    accounts: [Account]
    glossaryentry(id: String!): GlossaryEntry
    glossaryentries(account: String!): [GlossaryEntry]
    diaryentry(id: String!): DiaryEntry
    diaryentries(account: String!): [DiaryEntry]
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
  type DiaryEntry {
    id: String
    account: String!
    date: String
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
    createDiaryEntry(
      account: String!
      date: String!
      title: String!
      byline: String
      content: String!): DiaryEntry
    updateDiaryEntry(
      account: String!
      id: String!
      type: String!
      date: String!
      title: String!
      byline: String
      content: String!): DiaryEntry
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
    var statement = "SELECT META(account).id, account.* FROM `" + bucket._name + "` AS account WHERE account.type = 'account'"
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
  glossaryentries: () => {
    var statement = "SELECT META(entry).id, entry.* FROM `" + bucket._name + "` AS entry WHERE entry.type = 'glossaryentry'"
    var query = Couchbase.N1qlQuery.fromString(statement)
    return new Promise((resolve, reject) => {
      bucket.query(query, (error, result) => {
        if(error) return reject(error)
        resolve(result)
      })
    })
  },
  diaryentry: (data) => {
    var id = data.id
    return new Promise((resolve, reject) => {
      bucket.get(id, (error, result) => {
        if(error) return reject(error)
        resolve(result.value)
      })
    })
  },
  diaryentries: () => {
    var statement = "SELECT META(entry).id, entry.* FROM `" + bucket._name + "` AS entry WHERE entry.type = 'diaryentry'"
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
        resolve(data)
      })
    })
  },
  updateGlossaryEntry: (data) => {
    return new Promise((resolve, reject) => {
      bucket.replace(data.id, data, (error, result) => {
        if(error) return reject(error)
        resolve(data)
      })
    })
  },
  createDiaryEntry: (data) => {
    var id = UUID.v4()
    data.type = "diaryentry"
    return new Promise((resolve, reject) => {
      bucket.insert(id, data, (error, result) => {
        if(error) return reject(error)
        resolve(data)
      })
    })
  },
  updateDiaryEntry: (data) => {
    return new Promise((resolve, reject) => {
      bucket.replace(data.id, data, (error, result) => {
        if(error) return reject(error)
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
