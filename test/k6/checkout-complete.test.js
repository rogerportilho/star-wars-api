import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { generateFakeUser, generateCheckoutData } from './helpers/faker.js';
import { getBaseUrl } from './helpers/baseUrl.js';


export const options = {
	stages: [
	{ duration: '2s', target: 2 },
	{ duration: '5s', target: 5 },
	{ duration: '10s', target: 10 },
	{ duration: '5s', target: 5 }, 
	{ duration: '3s', target: 0 },
	],
	thresholds: {
	http_req_duration: ['p(95)<2000'],
	checks: ['rate>0.9'],
	checkout_duration: ['p(95)<1500'],
	},
};

const checkoutDuration = new Trend('checkout_duration');
const loginDuration = new Trend('login_duration');

const testScenarios = [
	{ productId: 1, quantity: 1, paymentMethod: 'cash' },
	{ productId: 2, quantity: 3, paymentMethod: 'credit' },
	{ productId: 5, quantity: 2, paymentMethod: 'pix' }
];

export default function () {
	const baseUrl = getBaseUrl();
	let token;
	
	const scenario = testScenarios[Math.floor(Math.random() * testScenarios.length)];

	group('Registro de usuário e login', function () {
	const userData = generateFakeUser();
	const registerResponse = http.post(`${baseUrl}/api/users/register`, JSON.stringify(userData), {
		headers: { 'Content-Type': 'application/json' }
	});

	check(registerResponse, {
		'o status do registro de usuário é 201': (r) => r.status === 201,
		'o retorno do registro tem os dados do usuário': (r) => {
			try {
				const body = JSON.parse(r.body);
				return body.username && body.email;
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
		'o status do login é 200': (r) => r.status === 200,
		'o retorno do login com token': (r) => {
			try {
				const body = JSON.parse(r.body);
				return body.token && body.token.length > 0;
			} catch (e) {
				return false;
			}
		}
	});
		if (loginSuccess) {
			token = JSON.parse(loginResponse.body).token;
		}
	});

	group('Processo de Checkout', function () {
	if (!token) return;

	const checkoutData = Math.random() > 0.5 ? scenario : generateCheckoutData();
	const headers = {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}` 
	};
	const checkoutStart = Date.now();
	const checkoutResponse = http.post(`${baseUrl}/api/checkout`, JSON.stringify(checkoutData), { headers });
	
	checkoutDuration.add(Date.now() - checkoutStart);

	check(checkoutResponse, {
		'o status do checkout é 201': (r) => r.status === 201,
		'o checkout tem id do produto correto': (r) => {
			try {
				const body = JSON.parse(r.body);
				return body.productId === checkoutData.productId;
			} catch (e) {
				return false;
			}
		},
			'o valor total do checkout exibido': (r) => {
				try {
					const body = JSON.parse(r.body);
					return body.total > 0;
				} catch (e) {
					return false;
				}
			}
		});
	});
	sleep(Math.random() * 2);
}