	import http from 'k6/http';
	import { check, group, sleep } from 'k6';
	import { Trend } from 'k6/metrics';
	import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
	import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
	import { generateFakeUser, generateStarWarsCharacter } from './helpers/faker.js';
	import { getBaseUrl } from './helpers/baseUrl.js';

	export const options = {
	stages: [
		{ duration: '3s', target: 2 },
		{ duration: '5s', target: 5 },
		{ duration: '10s', target: 10 },
		{ duration: '5s', target: 5 },
		{ duration: '2s', target: 0 },
	],

	thresholds: {
		http_req_duration: ['p(95)<3000'],
		checks: ['rate>0.95'],
		character_list_duration: ['p(95)<2000'],
		character_create_duration: ['p(95)<1500'],
		character_get_duration: ['p(95)<1000'],
	},
};

	const characterListDuration = new Trend('character_list_duration');
	const characterCreateDuration = new Trend('character_create_duration');
	const characterGetDuration = new Trend('character_get_duration');
	const loginDuration = new Trend('login_duration');

	const testScenarios = [
		{ charactersToCreate: 3, listRequests: 2 },
		{ charactersToCreate: 3, listRequests: 3 },
		{ charactersToCreate: 3, listRequests: 1 }
	];

	export default function () {
	const baseUrl = getBaseUrl();

	let token;
	let createdCharacterIds = [];
	
	const scenario = testScenarios[Math.floor(Math.random() * testScenarios.length)];

	group('Realizar o registro e a autenticação', function () {
		const userData = generateFakeUser();
		const registerResponse = http.post(`${baseUrl}/api/users/register`, JSON.stringify(userData), {
			headers: { 'Content-Type': 'application/json' }
		});

		check(registerResponse, {
			'status do registro é 201': (r) => r.status === 201,
			'o novo registro de usuário tem nome': (r) => {
				try {
					const body = JSON.parse(r.body);
					return body.username && body.username.length > 0;
				} catch (e) {
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

		if (registerResponse.status !== 201) return;

		const loginStart = Date.now();
		const loginResponse = http.post(`${baseUrl}/api/auth/token`, JSON.stringify({
			email: userData.email,
			password: userData.password
		}), {
			headers: { 'Content-Type': 'application/json' }
		});

		loginDuration.add(Date.now() - loginStart);

		const loginSuccess = check(loginResponse, {
			'status do login é 200': (r) => r.status === 200,
			'login retorna token válido': (r) => {
				try {
					const body = JSON.parse(r.body);
					return body.token && body.token.length > 50;
				} catch (e) {
					return false;
				}
			}
		});

		if (loginSuccess) {
			token = JSON.parse(loginResponse.body).token;
		}
	});

	group('Operações para consulta e cadastro de personagens de Star Wars', function () {
		if (!token) return;
		const headers = {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		};

		for (let i = 0; i < scenario.listRequests; i++) {

			const listStart = Date.now();
			const listResponse = http.get(`${baseUrl}/api/characters`, { headers });
			characterListDuration.add(Date.now() - listStart);

			check(listResponse, {
				'status da lista de personagens é 200': (r) => r.status === 200,
				'lista de personagens contém dados': (r) => {
					try {
						const body = JSON.parse(r.body);
						return Array.isArray(body) && body.length >= 0;
					} catch (e) {
						return false;
					}
				}
			});
		}

		for (let i = 0; i < scenario.charactersToCreate; i++) {
			const characterData = generateStarWarsCharacter();

			const createStart = Date.now();
			const createResponse = http.post(`${baseUrl}/api/characters`, JSON.stringify(characterData), { headers });
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
				'personagem cadastrado tem nome correto': (r) => {
					try {
						const body = JSON.parse(r.body);
						return body.name === characterData.name;
					} catch (e) {
						return false;
					}
				},
				'personagem criado tem status': (r) => {
					try {
						const body = JSON.parse(r.body);
						return ['VIVO', 'FALECIDO', 'DESCONHECIDO'].includes(body.status);
					} catch (e) {
						return false;
					}
				}
			});

			if (createSuccess) {
				const createdCharacter = JSON.parse(createResponse.body);
				createdCharacterIds.push(createdCharacter.id);
			}
		}

		createdCharacterIds.forEach(characterId => {
			const getStart = Date.now();
			const getResponse = http.get(`${baseUrl}/api/characters/${characterId}`, { headers });
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
				'personagem obtido por id tem nome': (r) => {
					try {
						const body = JSON.parse(r.body);
						return body.name && body.name.length > 0;
					} catch (e) {
						return false;
					}
				}
			});
		});

		const finalListStart = Date.now();
		const finalListResponse = http.get(`${baseUrl}/api/characters`, { headers });
		characterListDuration.add(Date.now() - finalListStart);

		check(finalListResponse, {
			'status da lista final de personagens é 200': (r) => r.status === 200,
			'a lista final tem mais personagens': (r) => {
				try {
					const body = JSON.parse(r.body);
					return Array.isArray(body) && body.length >= scenario.charactersToCreate;
				} catch (e) {
					return false;
				}
			}
		});
	});
		sleep(Math.random() * 1.5 + 0.5);
	}

	export function handleSummary(data) {
		return {
			"reports/starwars-characters-report.html": htmlReport(data),
			"reports/starwars-characters-summary.json": JSON.stringify(data, null, 2),
			stdout: textSummary(data, { indent: " ", enableColors: true }),
		};
	}