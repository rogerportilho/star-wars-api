const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const characterService = require('../service/characterService');
const userService = require('../service/userService');
const { masterLogin } = require('../service/authService');

const resolvers = {
  Query: {
    // Consultas de usuários
    me: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('Usuário deve estar autenticado');
      }
      return await userService.getMe(context.user.id);
    },

    users: async (parent, args, context) => {
      if (!context.user || !context.user.master) {
        throw new ForbiddenError('Acesso negado - apenas usuários master');
      }
      const User = require('../model/user');
      const users = User.getAll ? await User.getAll() : [];
      return users.map(u => ({ id: u.id, username: u.username }));
    },

    // Consultas de personagens
    characters: async (parent, { filter }, context) => {
      if (!context.user) {
        throw new AuthenticationError('Usuário deve estar autenticado');
      }
      
      let characters = await characterService.getAllCharacters();
      
      if (filter) {
        if (filter.name) {
          characters = characters.filter(c => 
            c.name.toLowerCase().includes(filter.name.toLowerCase())
          );
        }
        if (filter.status) {
          characters = characters.filter(c => c.status === filter.status);
        }
        if (filter.location) {
          characters = characters.filter(c => 
            c.location.toLowerCase().includes(filter.location.toLowerCase())
          );
        }
      }
      
      return characters;
    },

    character: async (parent, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('Usuário deve estar autenticado');
      }
      return await characterService.getCharacterById(id);
    },

    charactersByIds: async (parent, { ids }, context) => {
      if (!context.user) {
        throw new AuthenticationError('Usuário deve estar autenticado');
      }
      const characters = [];
      for (const id of ids) {
        const character = await characterService.getCharacterById(id);
        if (character) characters.push(character);
      }
      return characters;
    },

    // Funcionalidades não implementadas removidas do schema
  },

  Mutation: {
    // Autenticação
    login: async (parent, { username, password }) => {
      try {
        // Tenta login master primeiro
        const masterToken = masterLogin(username, password);
        if (masterToken) {
          return { token: masterToken };
        }
        
        // Login normal
        const token = await userService.login(username, password);
        return { token };
      } catch (error) {
        throw new Error(`Falha na autenticação: ${error.message}`);
      }
    },

    register: async (parent, { username, password }, context) => {
      if (!context.user) {
        throw new AuthenticationError('Usuário deve estar autenticado');
      }
      return await userService.register(username, password);
    },

    // Personagens
    createCharacter: async (parent, { input }, context) => {
      if (!context.user) {
        throw new AuthenticationError('Usuário deve estar autenticado');
      }
      
      if (!input.name || !input.status || !input.location || !input.lastSeen) {
        throw new UserInputError('Todos os campos são obrigatórios: name, status, location, lastSeen');
      }
      
      return await characterService.createCharacter(input);
    },

    updateCharacter: async (parent, { id, input }, context) => {
      if (!context.user) {
        throw new AuthenticationError('Usuário deve estar autenticado');
      }
      
      return await characterService.updateCharacter(id, input);
    }
  },

  Character: {
    createdAt: (parent) => parent.createdAt || new Date().toISOString(),
    updatedAt: (parent) => parent.updatedAt || new Date().toISOString()
  }
};

module.exports = resolvers;