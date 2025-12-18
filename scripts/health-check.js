const http = require('http');

function checkServer(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data.substring(0, 200)
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

async function healthCheck() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  
  console.log(`🔍 Verificando saúde do servidor: ${baseUrl}`);
  
  try {
    console.log('📋 Testando /api-docs...');
    const docsResult = await checkServer(`${baseUrl}/api-docs`);
    console.log(`✅ Status: ${docsResult.status}`);
    
    console.log('👥 Testando /api/users...');
    const usersResult = await checkServer(`${baseUrl}/api/users`);
    console.log(`✅ Status: ${usersResult.status} (401 é esperado sem auth)`);
    
    console.log('🌟 Testando /api/characters...');
    const charactersResult = await checkServer(`${baseUrl}/api/characters`);
    console.log(`✅ Status: ${charactersResult.status} (401 é esperado sem auth)`);
    
    console.log('🎉 Servidor está respondendo corretamente!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro na verificação de saúde:', error.message);
    process.exit(1);
  }
}

healthCheck();