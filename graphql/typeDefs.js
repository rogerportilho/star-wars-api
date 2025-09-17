const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # Queries
  type Query {
    """
    Get current authenticated user information
    """
    me: User
    
    """
    Get all users (master only)
    """
    users: [User!]!
    
    """
    Get a specific Star Wars character by ID
    """
    character(id: ID!): Character

    """
    Get all Star Wars characters with optional filtering
    """
    characters(filter: CharacterFilter): [Character!]!

    """
    Get multiple characters by their IDs
    """
    charactersByIds(ids: [ID!]!): [Character!]!
  }

  # Mutations
  type Mutation {
    """
    Authenticate user and get JWT token
    """
    login(username: String!, password: String!): AuthPayload!
    
    """
    Register new user (requires authentication)
    """
    register(username: String!, password: String!): User!
    
    """
    Create a new Star Wars character
    """
    createCharacter(input: CharacterInput!): Character!
    
    """
    Update an existing Star Wars character
    """
    updateCharacter(id: ID!, input: CharacterUpdateInput!): Character
  }

  # Types
  type User {
    id: ID!
    username: String!
  }

  type AuthPayload {
    token: String!
  }

  type Character {
    id: ID!
    name: String!
    status: CharacterStatus!
    location: String!
    lastSeen: String!
    createdAt: String
    updatedAt: String
  }

  # Enums
  enum CharacterStatus {
    Vivo
    Falecido
    Falecida
    Desconhecido
  }

  # Inputs
  input CharacterInput {
    name: String!
    status: CharacterStatus!
    location: String!
    lastSeen: String!
  }

  input CharacterUpdateInput {
    name: String
    status: CharacterStatus
    location: String
    lastSeen: String
  }

  input CharacterFilter {
    name: String
    status: CharacterStatus
    location: String
  }


`

module.exports = typeDefs
