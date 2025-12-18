const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const createRestApp = require('../rest/app');

describe('Testes de Endpoints REST - Personagens', function () {
  this.timeout(15000);
  let app, masterToken, userToken;

  before(async () => {
    // Criar app REST para testes
    app = express();
    const restApp = createRestApp();
    app.use('/', restApp);

    // Obter token master
    const masterRes = await request(app)
      .post('/api/auth/token')
      .send({ email: 'Rogerio', password: '123456' });
    masterToken = masterRes.body.token;

    // Registrar e obter token de usuário normal
    const userEmail = 'testuser' + Date.now() + '@test.com';
    await request(app)
      .post('/api/users/register')
      .send({ username: 'testuser', email: userEmail, password: 'testpass' });

    const userRes = await request(app)
      .post('/api/auth/token')
      .send({ email: userEmail, password: 'testpass' });
    userToken = userRes.body.token;
  });

  describe('GET /api/characters', () => {
    it('TC001 - deve listar todos os personagens com autenticação', async () => {
      const res = await request(app)
        .get('/api/characters')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.greaterThan(0);
      expect(res.body[0]).to.have.property('name');
      expect(res.body[0]).to.have.property('status');
    });

    it('TC002 - deve retornar 401 com token inválido', async () => {
      const res = await request(app)
        .get('/api/characters')
        .set('Authorization', 'Bearer token-invalido');

      expect(res.status).to.equal(401);
    });
  });

  describe('GET /api/characters/:id', () => {
    it('TC003 - deve buscar personagem por ID válido', async () => {
      const res = await request(app)
        .get('/api/characters/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('id', 1);
      expect(res.body).to.have.property('name');
      expect(res.body).to.have.property('status');
      expect(res.body).to.have.property('location');
    });

    it('TC004 - deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .get('/api/characters/9999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('error', 'Character not found');
    });

    it('TC005 - deve retornar 401 sem autenticação', async () => {
      const res = await request(app)
        .get('/api/characters/1');

      expect(res.status).to.equal(401);
    });
  });

  describe('POST /api/characters', () => {
    it('TC006 - deve criar personagem com dados válidos', async () => {
      const novoPersonagem = {
        name: 'Personagem Teste REST',
        status: 'Vivo',
        location: 'Planeta Teste',
        lastSeen: 'Episódio Teste'
      };

      const res = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${userToken}`)
        .send(novoPersonagem);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('name', novoPersonagem.name);
      expect(res.body).to.have.property('status', novoPersonagem.status);
      expect(res.body).to.have.property('location', novoPersonagem.location);
      expect(res.body).to.have.property('id');
    });

    it('TC007 - deve retornar 400 quando campos obrigatórios ausentes', async () => {
      const dadosIncompletos = {
        name: 'Personagem Incompleto'
        // Faltam: status, location, lastSeen
      };

      const res = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${userToken}`)
        .send(dadosIncompletos);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.include('Campos obrigatórios');
    });

    it('TC008 - deve retornar 400 com dados vazios', async () => {
      const res = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(res.status).to.equal(400);
    });

    it('TC009 - deve retornar 401 sem autenticação', async () => {
      const res = await request(app)
        .post('/api/characters')
        .send({ name: 'Teste' });

      expect(res.status).to.equal(401);
    });
  });

  describe('PUT /api/characters/:id', () => {
    let characterId;

    before(async () => {
      // Criar personagem para testes de atualização
      const createRes = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Personagem Para Atualizar',
          status: 'Vivo',
          location: 'Local Original',
          lastSeen: 'Episódio Original'
        });
      characterId = createRes.body.id;
    });

    it('TC010 - deve atualizar personagem existente', async () => {
      const dadosAtualizacao = {
        name: 'Personagem Atualizado REST',
        status: 'Falecido',
        location: 'Local Atualizado',
        lastSeen: 'Episódio Final'
      };

      const res = await request(app)
        .put(`/api/characters/${characterId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(dadosAtualizacao);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('name', dadosAtualizacao.name);
      expect(res.body).to.have.property('status', dadosAtualizacao.status);
      expect(res.body).to.have.property('location', dadosAtualizacao.location);
    });

    it('TC011 - deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .put('/api/characters/9999')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Teste' });

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('error', 'Character not found');
    });

    it('TC012 - deve retornar 401 sem autenticação', async () => {
      const res = await request(app)
        .put(`/api/characters/${characterId}`)
        .send({ name: 'Teste' });

      expect(res.status).to.equal(401);
    });
  });
});