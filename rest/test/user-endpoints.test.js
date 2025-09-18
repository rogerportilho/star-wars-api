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
    it('deve fazer login com usuário master', async () => {
      const res = await request(app)
        .post('/api/auth/token')
        .send({ username: 'Rogerio', password: '123456' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
      expect(res.body.token).to.be.a('string');
      expect(res.body.token.length).to.be.greaterThan(10);
    });

    it('deve fazer login via query params', async () => {
      const res = await request(app)
        .post('/api/auth/token?username=Rogerio&password=123456');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
    });

    it('deve retornar 400 quando credenciais ausentes', async () => {
      const res = await request(app)
        .post('/api/auth/token')
        .send({});

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Usuário e senha obrigatórios');
    });

    it('deve retornar 400 quando username ausente', async () => {
      const res = await request(app)
        .post('/api/auth/token')
        .send({ password: '123456' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Usuário e senha obrigatórios');
    });

    it('deve retornar 400 quando password ausente', async () => {
      const res = await request(app)
        .post('/api/auth/token')
        .send({ username: 'Rogerio' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Usuário e senha obrigatórios');
    });

    it('deve retornar 401 com credenciais inválidas', async () => {
      const res = await request(app)
        .post('/api/auth/token')
        .send({ username: 'invalido', password: 'invalido' });

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error');
    });

    it('deve retornar 401 com senha incorreta do master', async () => {
      const res = await request(app)
        .post('/api/auth/token')
        .send({ username: 'Rogerio', password: 'senhaerrada' });

      expect(res.status).to.equal(401);
    });
  });

  describe('POST /api/users/register', () => {
    it('deve registrar novo usuário com token master', async () => {
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

    it('deve retornar 400 quando username ausente', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .set('Authorization', `Bearer ${masterToken}`)
        .send({ password: 'senha123' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });

    it('deve retornar 400 quando password ausente', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .set('Authorization', `Bearer ${masterToken}`)
        .send({ username: 'usuario' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });

    it('deve retornar 400 quando dados vazios', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .set('Authorization', `Bearer ${masterToken}`)
        .send({});

      expect(res.status).to.equal(400);
    });

    it('deve retornar 401 sem token de autenticação', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({ username: 'teste', password: 'senha' });

      expect(res.status).to.equal(401);
    });

    it('deve retornar 401 com token inválido', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .set('Authorization', 'Bearer token-invalido')
        .send({ username: 'teste', password: 'senha' });

      expect(res.status).to.equal(401);
    });
  });

  describe('GET /api/users', () => {
    it('deve listar usuários para master', async () => {
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

    it('deve retornar 401 sem autenticação', async () => {
      const res = await request(app)
        .get('/api/users');

      expect(res.status).to.equal(401);
    });

    it('deve retornar 403 para usuário não-master', async () => {
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

  describe('GET /api/users/me', () => {
    let userToken;

    before(async () => {
      // Registrar usuário para teste
      await request(app)
        .post('/api/users/register')
        .set('Authorization', `Bearer ${masterToken}`)
        .send({ username: 'usuariome', password: 'senha123' });

      // Fazer login
      const loginRes = await request(app)
        .post('/api/auth/token')
        .send({ username: 'usuariome', password: 'senha123' });
      userToken = loginRes.body.token;
    });

    it('deve retornar informações do usuário logado', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('username', 'usuariome');
      expect(res.body).to.have.property('id');
      expect(res.body).to.not.have.property('password');
    });

    it('deve retornar informações do master', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${masterToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('username', 'Rogerio');
      expect(res.body).to.have.property('id');
    });

    it('deve retornar 401 sem autenticação', async () => {
      const res = await request(app)
        .get('/api/users/me');

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error', 'Não autenticado');
    });

    it('deve retornar 401 com token inválido', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer token-invalido');

      expect(res.status).to.equal(401);
    });
  });
});