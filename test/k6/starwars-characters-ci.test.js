import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import { generateFakeUser, generateStarWarsCharacter } from './helpers/faker.js';
import { getBaseUrl } from './helpers/baseUrl.js';

export const options = {
	stages: [
		{ duration: '5s', target: 1 },
		{ duration: '10s', target: 2 },
		{ duration: '5s', target: 0 },
	],
	thresholds: {
		http_req_duration: ['p(95)<5000'],
		checks: ['rate>0.8'],
		character_list_duration: ['p(95)<3000'],
		character_create_duration: ['p(95)<2000'],
		character_get_duration: ['p(95)<1500'],
	},
};

const characterListDuration = new Trend('character_list_duration');
const characterCreateDuration = new Trend('character_create_duration');
const characterGetDuration = new Trend('character_get_duration');
const loginDuration = new Trend('login_duration');

const testScenarios = [
	{ charactersToCreate: 1, listRequests: 1 },
	{ charactersToCreate: 2, listRequests: 1 },
];

export default function () {
	const baseUrl = getBaseUrl();
	let token;
	let createdCharacterIds = [];
	
	const scenario = testScenarios[Math.floor(Math.random() * testScenarios.length)];

	group('Teste de Conectividade', function () {
		const healthResponse = http.get(`${baseUrl}/api-docs`, {
			timeout: '10s',
		});
		
		const serverReady = check(healthResponse, {
			'servidor está respondendo': (r) => r.status === 200 || r.status === 301 || r.status === 302,
			'resposta recebida': (r) => r.body && r.body.length > 0,
		});

		if (!serverReady) {
			console.error(`Servidor não está respondendo: ${healthResponse.status} - ${healthResponse.body}`);
			return;
		}
	});

	group('Realizar o registro e a autenticação', function () {
		const userData = generateFakeUser();

		const registerResponse = http.post(`${baseUrl}/api/users/register`, JSON.stringify(userData), {
			headers: { 'Content-Type': 'application/json' },
			timeout: '15s',
		});

		const registerSuccess = check(registerResponse, {
			'status do registro é 201': (r) => r.status === 201,
			'o novo registro de usuário tem nome': (r) => {
				try {
					const body = JSON.parse(r.body);
					return body.username && body.username.length > 0;
				} catch (e) {
					console.error('Erro ao parsear resposta do registro:', r.body);
					return false;
				}
			},
			'o novo registro de usuário tem e-mail': (r) => {
				try {
					const body = JSON.parse(r.body);
					return body.email && body.email.includes('@');
				} catch (e) {
					return false;
				}
			}
		});

		if (!registerSuccess) {
			console.error(`Registro falhou: ${registerResponse.status} - ${registerResponse.body}`);
			return;
		}

		sleep(1);

		const loginStart = Date.now();
		const loginResponse = http.post(`${baseUrl}/api/auth/token`, JSON.stringify({
			email: userData.email,
			password: userData.password
		}), {
			headers: { 'Content-Type': 'application/json' },
			timeout: '15s',
		});
		loginDuration.add(Date.now() - loginStart);

		const loginSuccess = check(loginResponse, {
			'status do login é 200': (r) => r.status === 200,
			'login retorna token válido': (r) => {
				try {
					const body = JSON.parse(r.body);
					return body.token && body.token.length > 50;
				} catch (e) {
					console.error('Erro ao parsear resposta do login:', r.body);
					return false;
				}
			}
		});

		if (loginSuccess) {
			token = JSON.parse(loginResponse.body).token;
		} else {
			console.error(`Login falhou: ${loginResponse.status} - ${loginResponse.body}`);
		}
	});

	group('Operações para consulta e cadastro de personagens de Star Wars', function () {
		if (!token) {
			console.error('Token não disponível, pulando operações de personagens');
			return;
		}

		const headers = {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		};

		for (let i = 0; i < scenario.listRequests; i++) {
			const listStart = Date.now();
			const listResponse = http.get(`${baseUrl}/api/characters`, { 
				headers,
				timeout: '15s',
			});
			characterListDuration.add(Date.now() - listStart);

			check(listResponse, {
				'status da lista de personagens é 200': (r) => r.status === 200,
				'lista de personagens contém dados': (r) => {
					try {
						const body = JSON.parse(r.body);
						return Array.isArray(body) && body.length >= 0;
					} catch (e) {
						console.error('Erro ao parsear lista de personagens:', r.body);
						return false;
					}
				}
			});

			sleep(0.5);
		}

		for (let i = 0; i < scenario.charactersToCreate; i++) {
			const characterData = generateStarWarsCharacter();

			const createStart = Date.now();
			const createResponse = http.post(`${baseUrl}/api/characters`, JSON.stringify(characterData), { 
				headers,
				timeout: '15s',
			});
			characterCreateDuration.add(Date.now() - createStart);

			const createSuccess = check(createResponse, {
				'status do personagem cadastrado é 201': (r) => r.status === 201,
				'personagem criado tem id': (r) => {
					try {
						const body = JSON.parse(r.body);
						return body.id !== undefined;
					} catch (e) {
						return false;
					}
				},
			});

			if (createSuccess) {
				const createdCharacter = JSON.parse(createResponse.body);
				createdCharacterIds.push(createdCharacter.id);
			}

			sleep(0.5);
		}

		createdCharacterIds.forEach(characterId => {
			const getStart = Date.now();
			const getResponse = http.get(`${baseUrl}/api/characters/${characterId}`, { 
				headers,
				timeout: '15s',
			});
			characterGetDuration.add(Date.now() - getStart);

			check(getResponse, {
				'status do personagem consultado é 200': (r) => r.status === 200,
				'personagem obtido tem o id correto': (r) => {
					try {
						const body = JSON.parse(r.body);
						return body.id == characterId;
					} catch (e) {
						return false;
					}
				},
			});

			sleep(0.3);
		});
	});

	sleep(Math.random() * 1 + 0.5);
}

export function handleSummary(data) {
	return {
		"test/k6/reports/starwars-characters-ci-report.html": htmlReport(data),
		"test/k6/reports/starwars-characters-ci-summary.json": JSON.stringify(data, null, 2),
		stdout: textSummary(data, { indent: " ", enableColors: true }),
	};
}