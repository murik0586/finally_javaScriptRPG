
const {
    Player,
    Warrior,
    Archer,
    Mage,
    Dwarf,
    Crossbowman,
    Demiurge
} = require('../src/player');

const { Arm, Sword, Bow, Staff, Axe, LongBow, StormStaff,Knife } = require('../src/weapon');

describe('Player - базовый класс', () => {
    test('должен создавать игрока с правильными свойствами', () => {
        const player = new Player(10, 'Тестовый игрок');
        expect(player.life).toBe(100);
        expect(player.magic).toBe(20);
        expect(player.speed).toBe(1);
        expect(player.attack).toBe(10);
        expect(player.agility).toBe(5);
        expect(player.luck).toBe(10);
        expect(player.position).toBe(10);
        expect(player.name).toBe('Тестовый игрок');
        expect(player.weapon instanceof Arm).toBe(true);
        expect(player.description).toBe('Игрок');
    });

    test('getLuck должен возвращать значение между 0 и 1', () => {
        const player = new Player(10, 'Тестовый игрок');
        const luck1 = player.getLuck();
        const luck2 = player.getLuck();
        expect(luck1).toBeGreaterThanOrEqual(0);
        expect(luck1).toBeLessThanOrEqual(1);
        expect(luck2).toBeGreaterThanOrEqual(0);
        expect(luck2).toBeLessThanOrEqual(1);
    });

    test('getDamage должен возвращать 0 если расстояние > дальности оружия', () => {
        const player = new Player(10, 'Тестовый игрок');
        expect(player.getDamage(2)).toBe(0); // Arm range = 1
        expect(player.getDamage(0.5)).toBeGreaterThan(0);
    });

    test('takeDamage должен уменьшать здоровье', () => {
        const player = new Player(10, 'Тестовый игрок');
        player.takeDamage(30);
        expect(player.life).toBe(70);

        player.takeDamage(80);
        expect(player.life).toBe(0);
    });

    test('takeDamage не должен уменьшать здоровье ниже 0', () => {
        const player = new Player(10, 'Тестовый игрок');
        player.takeDamage(150);
        expect(player.life).toBe(0);
    });

    test('isDead должен возвращать true при здоровье 0', () => {
        const player = new Player(10, 'Тестовый игрок');
        expect(player.isDead()).toBe(false);
        player.takeDamage(100);
        expect(player.isDead()).toBe(true);
    });

    test('moveLeft должен уменьшать позицию', () => {
        const player = new Player(10, 'Тестовый игрок');
        player.moveLeft(5);
        expect(player.position).toBe(9); // speed = 1
    });

    test('moveRight должен увеличивать позицию', () => {
        const player = new Player(10, 'Тестовый игрок');
        player.moveRight(5);
        expect(player.position).toBe(11);
    });

    test('moveRight не должен превышать скорость за один вызов', () => {
        const player = new Player(10, 'Тестовый игрок');
        player.moveRight(100);
        expect(player.position).toBe(11); // speed = 1
    });

    test('moveLeft не должен уходить ниже 0', () => {
        const player = new Player(0, 'Тестовый игрок');
        player.moveLeft(5);
        expect(player.position).toBe(0);
    });

    test('move должен обрабатывать отрицательное расстояние', () => {
        const player = new Player(10, 'Тестовый игрок');
        player.move(-3);
        expect(player.position).toBe(9);
    });

    test('move должен обрабатывать положительное расстояние', () => {
        const player = new Player(10, 'Тестовый игрок');
        player.move(3);
        expect(player.position).toBe(11);
    });

    test('isAttackBlocked должен работать корректно', () => {
        const player = new Player(10, 'Тестовый игрок');
        // Мокаем getLuck для предсказуемого результата
        jest.spyOn(player, 'getLuck').mockReturnValue(0.5);
        // (100 - 10) / 100 = 0.9, 0.5 > 0.9 = false
        expect(player.isAttackBlocked()).toBe(false);

        jest.spyOn(player, 'getLuck').mockReturnValue(0.95);
        expect(player.isAttackBlocked()).toBe(true);
    });

    test('dodged должен работать корректно', () => {
        const player = new Player(10, 'Тестовый игрок');
        // (100 - 5 - 1*3) / 100 = 0.92
        jest.spyOn(player, 'getLuck').mockReturnValue(0.5);
        expect(player.dodged()).toBe(false);

        jest.spyOn(player, 'getLuck').mockReturnValue(0.95);
        expect(player.dodged()).toBe(true);
    });

    test('takeAttack: блокировка повреждает оружие', () => {
        const player = new Player(10, 'Тестовый игрок');
        // ✅ Меняем оружие на меч (конечная прочность)
        player.weapon = new Sword();

        jest.spyOn(player, 'isAttackBlocked').mockReturnValue(true);
        jest.spyOn(player, 'dodged').mockReturnValue(false);

        const initialDurability = player.weapon.durability; // 500
        player.takeAttack(20);
        expect(player.weapon.durability).toBeLessThan(initialDurability); // ✅ 490 < 500
        expect(player.life).toBe(100);
    });

    test('takeAttack: уклонение не наносит урон', () => {
        const player = new Player(10, 'Тестовый игрок');
        jest.spyOn(player, 'isAttackBlocked').mockReturnValue(false);
        jest.spyOn(player, 'dodged').mockReturnValue(true);

        player.takeAttack(20);
        expect(player.life).toBe(100);
    });

    test('takeAttack: получение урона', () => {
        const player = new Player(10, 'Тестовый игрок');
        jest.spyOn(player, 'isAttackBlocked').mockReturnValue(false);
        jest.spyOn(player, 'dodged').mockReturnValue(false);

        player.takeAttack(20);
        expect(player.life).toBe(80);
    });

    test('checkWeapon должен менять оружие при поломке', () => {
        const player = new Player(10, 'Тестовый игрок');
        // ✅ Меняем оружие на меч (конечная прочность)
        player.weapon = new Sword();

        // Ломаем оружие
        player.weapon.takeDamage(1000);
        expect(player.weapon.isBroken()).toBe(true); // ✅ теперь true

        // Устанавливаем цепочку оружия для теста
        player.getWeaponChain = jest.fn().mockReturnValue([Sword, Knife, Arm]);
        const oldWeapon = player.weapon;
        player.checkWeapon();
        expect(player.weapon).not.toBe(oldWeapon);
        expect(player.weapon instanceof Knife).toBe(true);
    });

    test('tryAttack: не атакует если расстояние превышает дальность', () => {
        const player = new Player(0, 'Атакующий');
        const enemy = new Player(10, 'Враг');
        jest.spyOn(player, 'getLuck').mockReturnValue(0.5);

        player.tryAttack(enemy);
        expect(enemy.life).toBe(100);
    });

    test('tryAttack: атакует с удвоенным уроном при одинаковой позиции', () => {
        const player = new Player(0, 'Атакующий');
        const enemy = new Player(0, 'Враг');
        jest.spyOn(player, 'getLuck').mockReturnValue(0.5);
        jest.spyOn(player, 'getDamage').mockReturnValue(10);

        player.tryAttack(enemy);
        // Должен быть удвоенный урон
        expect(enemy.position).toBe(1);
        expect(enemy.life).toBeLessThan(100);
    });

    test('chooseEnemy выбирает врага с минимальным здоровьем', () => {
        const player = new Player(0, 'Игрок');
        const enemy1 = new Player(1, 'Враг1');
        const enemy2 = new Player(2, 'Враг2');
        enemy1.takeDamage(30);
        enemy2.takeDamage(70);

        const players = [player, enemy1, enemy2];
        const chosen = player.chooseEnemy(players);
        expect(chosen).toBe(enemy2);
    });

    test('chooseEnemy возвращает null если нет живых врагов', () => {
        const player = new Player(0, 'Игрок');
        const deadEnemy = new Player(1, 'Мертвый');
        deadEnemy.takeDamage(100);

        const players = [player, deadEnemy];
        const chosen = player.chooseEnemy(players);
        expect(chosen).toBe(null);
    });

    test('moveToEnemy двигается к врагу', () => {
        const player = new Player(0, 'Игрок');
        const enemy = new Player(10, 'Враг');
        jest.spyOn(player, 'move');

        player.moveToEnemy(enemy);
        expect(player.move).toHaveBeenCalled();
    });
});

describe('Warrior - Воин', () => {
    test('должен иметь правильные свойства', () => {
        const warrior = new Warrior(5, 'Алёша');
        expect(warrior.life).toBe(120);
        expect(warrior.speed).toBe(2);
        expect(warrior.weapon instanceof Sword).toBe(true);
        expect(warrior.description).toBe('Воин');
    });

    test('takeDamage использует ману при здоровье < 50% и удаче > 0.8', () => {
        const warrior = new Warrior(5, 'Алёша');
        warrior.life = 50;
        jest.spyOn(warrior, 'getLuck').mockReturnValue(0.9);

        warrior.takeDamage(10);
        expect(warrior.magic).toBe(10);
        expect(warrior.life).toBe(50);
    });

    test('takeDamage использует здоровье если мана закончилась', () => {
        const warrior = new Warrior(5, 'Алёша');
        warrior.life = 50;
        warrior.magic = 5;
        jest.spyOn(warrior, 'getLuck').mockReturnValue(0.9);

        warrior.takeDamage(10);
        expect(warrior.magic).toBe(0);
        expect(warrior.life).toBe(45);
    });

    test('getWeaponChain возвращает правильную цепочку', () => {
        const warrior = new Warrior(5, 'Алёша');
        const chain = warrior.getWeaponChain();
        expect(chain).toEqual([Sword, Knife, Arm]);
    });
});

describe('Archer - Лучник', () => {
    test('должен иметь правильные свойства', () => {
        const archer = new Archer(5, 'Леголас');
        expect(archer.life).toBe(80);
        expect(archer.magic).toBe(35);
        expect(archer.attack).toBe(5);
        expect(archer.agility).toBe(10);
        expect(archer.weapon instanceof Bow).toBe(true);
        expect(archer.description).toBe('Лучник');
    });

    test('getDamage использует формулу с distance / weaponRange', () => {
        const archer = new Archer(5, 'Леголас');
        jest.spyOn(archer, 'getLuck').mockReturnValue(0.5);
        // (5 + 10) * 0.5 * 1 / 3 = 2.5
        const damage1 = archer.getDamage(1);
        expect(damage1).toBeCloseTo(2.5, 1);

        // (5 + 10) * 0.5 * 3 / 3 = 7.5
        const damage3 = archer.getDamage(3);
        expect(damage3).toBeCloseTo(7.5, 1);

        // distance > range
        expect(archer.getDamage(4)).toBe(0);
    });

    test('getWeaponChain возвращает правильную цепочку', () => {
        const archer = new Archer(5, 'Леголас');
        const chain = archer.getWeaponChain();
        expect(chain).toEqual([Bow, Knife, Arm]);
    });
});

describe('Mage - Маг', () => {
    test('должен иметь правильные свойства', () => {
        const mage = new Mage(5, 'Гендальф');
        expect(mage.life).toBe(70);
        expect(mage.magic).toBe(100);
        expect(mage.attack).toBe(5);
        expect(mage.agility).toBe(8);
        expect(mage.weapon instanceof Staff).toBe(true);
        expect(mage.description).toBe('Маг');
    });

    test('takeDamage уменьшает урон вдвое при мане > 50%', () => {
        const mage = new Mage(5, 'Гендальф');
        mage.takeDamage(20);
        expect(mage.life).toBe(60); // 70 - 10
        expect(mage.magic).toBe(88); // 100 - 12
    });

    test('takeDamage не уменьшает урон при мане <= 50%', () => {
        const mage = new Mage(5, 'Гендальф');
        mage.magic = 40;
        mage.takeDamage(20);
        expect(mage.life).toBe(50); // 70 - 20
        expect(mage.magic).toBe(40);
    });

    test('getWeaponChain возвращает правильную цепочку', () => {
        const mage = new Mage(5, 'Гендальф');
        const chain = mage.getWeaponChain();
        expect(chain).toEqual([Staff, Knife, Arm]);
    });
});

describe('Dwarf - Гном', () => {
    test('должен иметь правильные свойства', () => {
        const dwarf = new Dwarf(5, 'Торин');
        expect(dwarf.life).toBe(130);
        expect(dwarf.attack).toBe(15);
        expect(dwarf.luck).toBe(20);
        expect(dwarf.weapon instanceof Axe).toBe(true);
        expect(dwarf.description).toBe('Гном');
    });

    test('каждый 6-й удар наносит вдвое меньше урона при удаче > 0.5', () => {
        const dwarf = new Dwarf(5, 'Торин');
        jest.spyOn(dwarf, 'getLuck').mockReturnValue(0.6);

        // Первые 5 ударов - нормальный урон
        for (let i = 0; i < 5; i++) {
            dwarf.takeDamage(10);
        }
        expect(dwarf.life).toBe(80); // 130 - 50

        // 6-й удар - уменьшенный урон
        dwarf.takeDamage(10);
        expect(dwarf.life).toBe(75); // 80 - 5
    });

    test('6-й удар не уменьшается при удаче <= 0.5', () => {
        const dwarf = new Dwarf(5, 'Торин');
        jest.spyOn(dwarf, 'getLuck').mockReturnValue(0.4);

        for (let i = 0; i < 6; i++) {
            dwarf.takeDamage(10);
        }
        expect(dwarf.life).toBe(70); // 130 - 60
    });

    test('getWeaponChain возвращает правильную цепочку', () => {
        const dwarf = new Dwarf(5, 'Торин');
        const chain = dwarf.getWeaponChain();
        expect(chain).toEqual([Axe, Knife, Arm]);
    });
});

describe('Crossbowman - Арбалетчик', () => {
    test('должен иметь правильные свойства', () => {
        const crossbowman = new Crossbowman(5, 'Орландо');
        expect(crossbowman.life).toBe(85);
        expect(crossbowman.attack).toBe(8);
        expect(crossbowman.agility).toBe(20);
        expect(crossbowman.luck).toBe(15);
        expect(crossbowman.weapon instanceof LongBow).toBe(true);
        expect(crossbowman.description).toBe('Арбалетчик');
    });

    test('getWeaponChain возвращает правильную цепочку', () => {
        const crossbowman = new Crossbowman(5, 'Орландо');
        const chain = crossbowman.getWeaponChain();
        expect(chain).toEqual([LongBow, Knife, Arm]);
    });
});

describe('Demiurge - Демиург', () => {
    test('должен иметь правильные свойства', () => {
        const demiurge = new Demiurge(5, 'Прометей');
        expect(demiurge.life).toBe(80);
        expect(demiurge.magic).toBe(120);
        expect(demiurge.attack).toBe(6);
        expect(demiurge.luck).toBe(12);
        expect(demiurge.weapon instanceof StormStaff).toBe(true);
        expect(demiurge.description).toBe('Демиург');
    });

    test('getDamage увеличивает урон в 1.5 раза при мане > 0 и удаче > 0.6', () => {
        const demiurge = new Demiurge(5, 'Прометей');
        jest.spyOn(demiurge, 'getLuck').mockReturnValue(0.7);

        // Без магии урон: (6 + 10) * 0.7 / 1 = 11.2
        // С магией: 11.2 * 1.5 = 16.8
        const damage = demiurge.getDamage(1);
        expect(damage).toBeCloseTo(16.8, 1);
    });

    test('getDamage не увеличивает урон при мане = 0', () => {
        const demiurge = new Demiurge(5, 'Прометей');
        demiurge.magic = 0;
        jest.spyOn(demiurge, 'getLuck').mockReturnValue(0.7);

        const damage = demiurge.getDamage(1);
        expect(damage).toBeCloseTo(11.2, 1);
    });

    test('getWeaponChain возвращает правильную цепочку', () => {
        const demiurge = new Demiurge(5, 'Прометей');
        const chain = demiurge.getWeaponChain();
        expect(chain).toEqual([StormStaff, Knife, Arm]);
    });
});