const { execSync } = require('child_process');

function runCommand(command, description) {
    try {
        console.log(`\n➡️  ${description}...`);
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`❌ Erro ao ${description}`);
        console.error(error.message);
        process.exit(1); 
    }
}

console.log('🚀 Iniciando setup do banco de dados...');

runCommand('npx sequelize-cli db:create', 'criar o banco de dados');

runCommand('npx sequelize-cli db:migrate', 'rodar todas as migrations');

runCommand('npx sequelize-cli db:seed:all', 'rodar todos os seeders');

console.log('\n🎉 Banco de dados pronto e populado com sucesso!');