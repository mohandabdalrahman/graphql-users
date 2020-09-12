const graphql = require('graphql')
const axios = require('axios').default
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull, } = graphql

const companyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    name: { type: GraphQLString },
    id: { type: GraphQLString },
    desc: { type: GraphQLString },
    users: {
      type: new GraphQLList(userType),
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
          .then(res => res.data)
      }
    }
  })
})


const userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    firstName: { type: GraphQLString },
    id: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: companyType,
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then(res => res.data)
      }
    }
  })
})

/** RootQuery : Enyry point for application */
const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    user: {
      type: userType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/users/${args.id}`)
          .then(res => res.data)
      }
    },
    company: {
      type: companyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${args.id}`)
          .then(res => res.data)
      }
    }
  }
})


/** Start Mutation */
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: userType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        companyId: { type: GraphQLString },
        age: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve(parentValue, { firstName, age }) {
        return axios.post(`http://localhost:3000/users`, { firstName, age })
          .then(res => res.data)
      }
    },
    deleteUser: {
      type: userType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, { id }) {
        return axios.delete(`http://localhost:3000/users/${id}`)
          .then(res => res.data)
      }
    },
    editUser: {
      type: userType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        id: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve(parentValue, { id, firstName, age }) {
        return axios.patch(`http://localhost:3000/users/${id}`, { firstName, age })
          .then(res => res.data)
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
})