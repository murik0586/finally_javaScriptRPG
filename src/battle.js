// src/battle.js

const {
    Warrior,
    Archer,
    Mage,
    Dwarf,
    Crossbowman,
    Demiurge
} = require('./player');

function play(players) {
    console.log('\n' + '='.repeat(70));
    console.log('        ⚔️  НАЧАЛО БИТВЫ  ⚔️');
    console.log('='.repeat(70));

    console.log('\nУчастники битвы:');
    players.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.toString()}`);
    });
    console.log('='.repeat(70));

    let round = 1;
    let alivePlayers = players.filter(p => !p.isDead());

    while (alivePlayers.length > 1) {
        console.log(`\n📌 РАУНД ${round}`);
        console.log('-'.repeat(70));

        for (const player of alivePlayers) {
            if (!player.isDead()) {
                player.turn(alivePlayers);
            }
        }

        alivePlayers = alivePlayers.filter(p => !p.isDead());

        console.log(`\n📊 Состояние после раунда ${round}:`);
        alivePlayers.forEach(p => {
            console.log(`  ${p.toString()}`);
        });

        round++;

        if (round > 100) {
            console.log('\n⚠️ Битва слишком затянулась! Объявляется ничья.');
            break;
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('        🏁 БИТВА ЗАВЕРШЕНА 🏁');
    console.log('='.repeat(70));

    if (alivePlayers.length === 1) {
        const winner = alivePlayers[0];
        console.log(`\n🏆 ПОБЕДИТЕЛЬ: ${winner.name} (${winner.constructor.name})!`);
        console.log(`   ❤️ Жизней: ${Math.round(winner.life)}`);
        console.log(`   ✨ Маны: ${Math.round(winner.magic)}`);
        console.log(`   📍 Позиция: ${winner.position}`);
        console.log(`   ⚔️ Оружие: ${winner.weapon.name}`);
        return winner;
    } else if (alivePlayers.length === 0) {
        console.log('\n💀 Все игроки погибли! Ничья.');
        return null;
    } else {
        console.log('\n❓ Неизвестный исход битвы.');
        return null;
    }
}

function createDemoBattle() {
    console.log('🎮 Создание персонажей для битвы...\n');

    const players = [
        new Warrior(0, 'Алёша Попович'),
        new Archer(5, 'Леголас'),
        new Mage(10, 'Гендальф'),
        new Dwarf(2, 'Торин Дубощит'),
        new Crossbowman(8, 'Орландо Блум'),
        new Demiurge(12, 'Прометей')
    ];

    return play(players);
}

// ✅ ЭКСПОРТ ОБЕИХ ФУНКЦИЙ
module.exports = {
    play,
    createDemoBattle
};