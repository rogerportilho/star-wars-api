process.env.NODE_ENV = 'test'

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

describe('Testes GraphQL - Informações da API Star Wars', () => {
  let token

  before(async () => {
    token = await getToken()
  })

  it('TC001 - deve obter informações de contagem de personagens', async () => {
    const query = '{ characters { __typename } }'
    const { characters } = await test(query, token)

    expect(characters).to.be.an('array')
    expect(characters.length).to.be.greaterThan(0)
  })

  it('TC002 - deve mostrar que personagens Star Wars estão disponíveis', async () => {
    const query = '{ characters { id name status } }'
    const { characters } = await test(query, token)

    expect(characters).to.be.an('array')
    expect(characters.length).to.be.at.least(15)
    expect(characters[0]).to.have.property('name')
    expect(characters[0]).to.have.property('status')
  })

  it('TC003 - deve exigir autenticação para consultas de personagens', async () => {
    const query = '{ characters { name } }'
    const res = await request(GRAPHQL_URL).post('/graphql').send({ query })
    
    expect(res.body.errors).to.exist
    expect(res.body.errors[0].message).to.match(/autenticado/)
  })
})