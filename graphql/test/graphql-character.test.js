const { expect } = require('chai')
const request = require('supertest')

const GRAPHQL_URL = 'http://localhost:3002'

const test = async (query, token = null) => {
  const req = request(GRAPHQL_URL).post('/graphql')
  
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  
  const res = await req.send({ query })
  return res.body.data
}

const getToken = async () => {
  const loginQuery = 'mutation { login(username: "Rogerio", password: "123456") { token } }'
  const res = await request(GRAPHQL_URL).post('/graphql').send({ query: loginQuery })
  return res.body.data.login.token
}

const charFragment = (query) =>
  `
  ${query}
    fragment allProperties on Character {
      id
      name
      status
      location
      lastSeen
      createdAt
      updatedAt
    }
  `

const keys = ['id', 'name', 'status', 'location', 'lastSeen', 'createdAt', 'updatedAt']

const result = {
  character: 'Darth Vader',
  status: 'Falecido',
  location: 'Estrela da Morte II'
}

describe('Testes GraphQL - Consulta de Personagem por ID', () => {
  let token

  before(async () => {
    token = await getToken()
  })

  it('TC001 - deve buscar personagem por ID', async () => {
    const query = '{ character(id: 1) { name } }'
    const { character } = await test(query, token)

    expect(character).to.be.an('object')
    expect(character.name).to.equal(result.character)
  })

  it('TC002 - deve buscar personagem diferente', async () => {
    const query = '{ character(id: 2) { name } }'
    const { character } = await test(query, token)

    expect(character).to.be.an('object')
    expect(character.name).to.equal('Yoda')
  })

  it('TC003 - deve retornar status do personagem', async () => {
    const query = '{ character(id: 1) { status } }'
    const { character } = await test(query, token)

    expect(character.status).to.equal(result.status)
  })

  it('TC004 - deve retornar localização do personagem', async () => {
    const query = '{ character(id: 1) { location } }'
    const { character } = await test(query, token)

    expect(character.location).to.equal(result.location)
  })

  it('TC005 - deve retornar todas as propriedades', async () => {
    const query = charFragment('{ character(id: 1) { ...allProperties } }')
    const { character } = await test(query, token)

    expect(Object.keys(character)).to.deep.equal(keys)
  })

  it('TC006 - deve retornar null para personagem inexistente', async () => {
    const query = '{ character(id: 9999999) { id } }'
    const { character } = await test(query, token)

    expect(character).to.be.null
  })

  it('TC007 - deve exigir autenticação', async () => {
    const query = '{ character(id: 1) { name } }'
    const res = await request(GRAPHQL_URL).post('/graphql').send({ query })
    
    expect(res.body.errors).to.exist
    expect(res.body.errors[0].message).to.match(/autenticado/)
  })
})

describe('Testes GraphQL - Consulta de Personagens por IDs', () => {
  let token

  before(async () => {
    token = await getToken()
  })

  it('TC008 - deve buscar um personagem por ID', async () => {
    const query = '{ charactersByIds(ids: [1]) { name } }'
    const { charactersByIds } = await test(query, token)

    expect(charactersByIds).to.be.an('array')
    expect(charactersByIds[0].name).to.equal(result.character)
  })

  it('TC009 - deve buscar dois personagens por IDs', async () => {
    const query = '{ charactersByIds(ids: [1, 2]) { name } }'
    const { charactersByIds } = await test(query, token)

    expect(charactersByIds).to.be.an('array')
    expect(charactersByIds).to.deep.equal([{ name: 'Darth Vader' }, { name: 'Yoda' }])
  })

  it('TC010 - deve buscar cinco personagens por IDs', async () => {
    const query = `{ charactersByIds(ids: [1, 2, 3, 4, 5]) { id } }`
    const { charactersByIds } = await test(query, token)

    expect(charactersByIds).to.be.an('array')
    expect(charactersByIds).to.have.lengthOf(5)
  })

  it('TC011 - deve retornar lista vazia para IDs inexistentes', async () => {
    const query = '{ charactersByIds(ids: [9999999]) { id } }'
    const { charactersByIds } = await test(query, token)

    expect(charactersByIds).to.be.an('array').that.is.empty
  })
})

describe('Testes GraphQL - Lista de Personagens', () => {
  let token

  before(async () => {
    token = await getToken()
  })

  it('TC012 - deve listar múltiplos personagens', async () => {
    const query = '{ characters { name } }'
    const { characters } = await test(query, token)

    expect(characters).to.be.an('array')
    expect(characters[0].name).to.equal(result.character)
  })

  it('TC013 - deve retornar todas as propriedades dos personagens', async () => {
    const query = charFragment('{ characters { ...allProperties } }')
    const { characters } = await test(query, token)

    expect(Object.keys(characters[0])).to.deep.equal(keys)
  })
})

describe('Testes GraphQL - Filtros de Personagens', () => {
  let token

  before(async () => {
    token = await getToken()
  })

  it('TC014 - deve filtrar por nome', async () => {
    const query = '{ characters(filter: {name: "Darth Vader"}) { name } }'
    const { characters } = await test(query, token)

    expect(characters).to.deep.include({ name: result.character })
  })

  it('TC015 - deve filtrar por status', async () => {
    const query = '{ characters(filter: {status: Falecido}) { status } }'
    const { characters } = await test(query, token)

    expect(characters).to.deep.include({ status: 'Falecido' })
  })

  it('TC016 - deve filtrar por localização', async () => {
    const query = '{ characters(filter: {location: "Tatooine"}) { location } }'
    const { characters } = await test(query, token)

    expect(characters).to.deep.include({ location: 'Tatooine' })
  })

  it('TC017 - deve filtrar por múltiplas propriedades', async () => {
    const query = '{ characters(filter: { name: "Vader" status: Falecido }) { name status } }'
    const { characters } = await test(query, token)

    expect(characters).to.deep.include({ name: 'Darth Vader', status: 'Falecido' })
  })

  it('TC018 - deve retornar lista vazia para valor inexistente', async () => {
    const query = '{ characters(filter: { name: "PersonagemInexistente" }) { id } }'
    const { characters } = await test(query, token)

    expect(characters).to.be.an('array').that.is.empty
  })
})