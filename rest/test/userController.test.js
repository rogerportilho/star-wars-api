const sinon = require('sinon');
const userController = require('../../controller/userController');
const userService = require('../../service/userService');
const { expect } = require('chai');

describe('userController', () => {
  afterEach(() => sinon.restore());

  it('register - sucesso', async () => {
    const req = { body: { username: 'yoda', password: 'jedi' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    sinon.stub(userService, 'register').resolves({ id: 1, username: 'yoda' });
    await userController.register(req, res);
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith({ id: 1, username: 'yoda' })).to.be.true;
  });

  it('register - usuário duplicado', async () => {
    const req = { body: { username: 'yoda', password: 'jedi' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    sinon.stub(userService, 'register').throws(new Error('Usuário já existe'));
    await userController.register(req, res);
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.args[0][0]).to.have.property('error');
  });

  it('login - sucesso', async () => {
    const req = { body: { username: 'yoda', password: 'jedi' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    sinon.stub(userService, 'login').resolves('token123');
    await userController.login(req, res);
    expect(res.json.calledWith({ token: 'token123' })).to.be.true;
  });

  it('login - erro', async () => {
    const req = { body: { username: 'yoda', password: 'errado' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    sinon.stub(userService, 'login').throws(new Error('Senha inválida'));
    await userController.login(req, res);
    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.args[0][0]).to.have.property('error');
  });
});
