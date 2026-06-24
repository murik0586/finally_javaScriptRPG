const { createDemoBattle } = require('./src/battle');

console.log('🎮 Добро пожаловать в RPG Битву!');
console.log('='.repeat(70));

const winner = createDemoBattle();

if (winner) {
    console.log(`\n✨ Итоговый победитель: ${winner.name} (${winner.constructor.name})`);
    console.log(`   Осталось жизней: ${Math.round(winner.life)}`);
}