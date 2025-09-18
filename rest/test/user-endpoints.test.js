const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const createRestApp = require('../app');

describe('Testes de Endpoints REST - Usuários', function () {
  this.timeout(15000);
  let app, masterToken;

  before(async () => {
    // Criar app REST para testes
    app = express();
    const restApp = createRestApp();
    app.use('/', restApp);

    // Obter token master
    const masterRes = await request(app)
      .post('/api/auth/token')
      .send({ username: 'Rogerio', password: '123456' });
    masterToken = masterRes.body.token;
  });

  describe('POST /api/auth/token', () => {
    it('TC001 - deve fazer login com usuário master', async () => {
      const res = await request(app)
        .post('/api/auth/token')
        .send({ username: 'Rogerio', password: '123456' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
      expect(res.body.token).to.be.a('string');
      expect(res.body.token.length).to.be.greaterThan(10);
    });

    it('TC002 - deve fazer login via query params', async () => {
      const res = await request(app)
        .post('/api/auth/token?username=Rogerio&password=123456');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
    });

    it('TC003 - deve retornar 400 quando credenciais ausentes', async () => {
      const res = await request(app)
        .post('/api/auth/token')
        .send({});

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Usuário e senha obrigatórios');
    });

    it('TC004 - deve retornar 400 quando username ausente', async () => {
      const res = await request(app)
        .post('/api/auth/token')
        .send({ password: '123456' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Usuário e senha obrigatórios');
    });

    it('TC005 - deve retornar 400 quando password ausente', async () => {
      const res = await request(app)
        .post('/api/auth/token')
        .send({ username: 'Rogerio' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Usuário e senha obrigatórios');
    });

    it('TC006 - deve retornar 401 com credenciais inválidas', async () => {
      const res = await request(app)
        .post('/api/auth/token')
        .send({ username: 'invalido', password: 'invalido' });

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error');
    });
  });

  describe('POST /api/users/register', () => {
    it('TC007 - deve registrar novo usuário', async () => {
      const novoUsuario = {
        username: 'usuarioteste' + Date.now(),
        password: 'senhateste123'
      };

      const res = await request(app)
        .post('/api/users/register')
        .set('Authorization', `Bearer ${masterToken}`)
        .send(novoUsuario);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('username', novoUsuario.username);
      expect(res.body).to.have.property('id');
      expect(res.body).to.not.have.property('password');
    });

    it('TC008 - deve retornar 400 quando dados vazios', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .set('Authorization', `Bearer ${masterToken}`)
        .send({});

      expect(res.status).to.equal(400);
    });

    it('TC009 - deve retornar 401 sem token de autenticação', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({ username: 'teste', password: 'senha' });

      expect(res.status).to.equal(401);
    });
  });

  describe('GET /api/users', () => {
    it('TC010 - deve listar usuários', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${masterToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      if (res.body.length > 0) {
        expect(res.body[0]).to.have.property('username');
        expect(res.body[0]).to.have.property('id');
        expect(res.body[0]).to.not.have.property('password');
      }
    });

    it('TC011 - deve retornar 401 sem autenticação', async () => {
      const res = await request(app)
        .get('/api/users');

      expect(res.status).to.equal(401);
    });

    it('TC012 - deve retornar 403 para usuário não-master', async () => {
      // Primeiro registrar usuário normal
      await request(app)
        .post('/api/users/register')
        .set('Authorization', `Bearer ${masterToken}`)
        .send({ username: 'usuarionormal', password: 'senha123' });

      // Fazer login com usuário normal
      const loginRes = await request(app)
        .post('/api/auth/token')
        .send({ username: 'usuarionormal', password: 'senha123' });

      const userToken = loginRes.body.token;

      // Tentar listar usuários
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).to.equal(403);
      expect(res.body).to.have.property('error', 'Acesso negado');
    });
  });
});