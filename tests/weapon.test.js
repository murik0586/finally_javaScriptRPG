
const {
    Weapon,
    Arm,
    Bow,
    Sword,
    Knife,
    Staff,
    LongBow,
    Axe,
    StormStaff
} = require('../src/weapon');

describe('Weapon - базовый класс', () => {
    test('должен создавать оружие с правильными свойствами', () => {
        const weapon = new Weapon('Тестовый меч', 20, 100, 2);
        expect(weapon.name).toBe('Тестовый меч');
        expect(weapon.attack).toBe(20);
        expect(weapon.durability).toBe(100);
        expect(weapon.initDurability).toBe(100);
        expect(weapon.range).toBe(2);
    });

    test('takeDamage должен уменьшать прочность', () => {
        const weapon = new Weapon('Тестовый меч', 20, 100, 2);
        weapon.takeDamage(30);
        expect(weapon.durability).toBe(70);

        weapon.takeDamage(100);
        expect(weapon.durability).toBe(0);
    });

    test('takeDamage не должен уменьшать прочность ниже 0', () => {
        const weapon = new Weapon('Тестовый меч', 20, 50, 2);
        weapon.takeDamage(100);
        expect(weapon.durability).toBe(0);
    });

    test('getDamage должен возвращать полную атаку при прочности >= 30%', () => {
        const weapon = new Weapon('Тестовый меч', 20, 100, 2);
        expect(weapon.getDamage()).toBe(20);

        weapon.takeDamage(60);
        expect(weapon.getDamage()).toBe(20); // 40% осталось
    });

    test('getDamage должен возвращать половину атаки при прочности < 30%', () => {
        const weapon = new Weapon('Тестовый меч', 20, 100, 2);
        weapon.takeDamage(80);
        expect(weapon.getDamage()).toBe(10); // 20% осталось
    });

    test('getDamage должен возвращать 0 при прочности 0', () => {
        const weapon = new Weapon('Тестовый меч', 20, 100, 2);
        weapon.takeDamage(100);
        expect(weapon.getDamage()).toBe(0);
    });

    test('isBroken должен возвращать true при прочности 0', () => {
        const weapon = new Weapon('Тестовый меч', 20, 100, 2);
        weapon.takeDamage(100);
        expect(weapon.isBroken()).toBe(true);
    });

    test('Arm должен иметь бесконечную прочность', () => {
        const arm = new Arm();
        expect(arm.durability).toBe(Infinity);
        arm.takeDamage(100);
        expect(arm.durability).toBe(Infinity);
        expect(arm.getDamage()).toBe(1);
        expect(arm.isBroken()).toBe(false);
    });
});

describe('Базовое оружие (Таблица 1)', () => {
    test('Bow - Лук', () => {
        const bow = new Bow();
        expect(bow.name).toBe('Лук');
        expect(bow.attack).toBe(10);
        expect(bow.durability).toBe(200);
        expect(bow.range).toBe(3);
    });

    test('Sword - Меч', () => {
        const sword = new Sword();
        expect(sword.name).toBe('Меч');
        expect(sword.attack).toBe(25);
        expect(sword.durability).toBe(500);
        expect(sword.range).toBe(1);
    });

    test('Knife - Нож', () => {
        const knife = new Knife();
        expect(knife.name).toBe('Нож');
        expect(knife.attack).toBe(5);
        expect(knife.durability).toBe(300);
        expect(knife.range).toBe(1);
    });

    test('Staff - Посох', () => {
        const staff = new Staff();
        expect(staff.name).toBe('Посох');
        expect(staff.attack).toBe(8);
        expect(staff.durability).toBe(300);
        expect(staff.range).toBe(2);
    });
});

describe('Улучшенное оружие (Таблица 2)', () => {
    test('LongBow - Длинный лук', () => {
        const longBow = new LongBow();
        expect(longBow.name).toBe('Длинный лук');
        expect(longBow.attack).toBe(15);
        expect(longBow.range).toBe(4);
        expect(longBow.durability).toBe(200);
        expect(longBow instanceof Bow).toBe(true);
    });

    test('Axe - Секира', () => {
        const axe = new Axe();
        expect(axe.name).toBe('Секира');
        expect(axe.attack).toBe(27);
        expect(axe.range).toBe(1);
        expect(axe.durability).toBe(800);
        expect(axe instanceof Sword).toBe(true);
    });

    test('StormStaff - Посох Бури', () => {
        const staff = new StormStaff();
        expect(staff.name).toBe('Посох Бури');
        expect(staff.attack).toBe(10);
        expect(staff.range).toBe(3);
        expect(staff.durability).toBe(300);
        expect(staff instanceof Staff).toBe(true);
    });
});

describe('Интеграционные тесты оружия', () => {
    test('Bow: правильный расчет урона с износом', () => {
        const bow = new Bow();
        expect(bow.getDamage()).toBe(10);
        expect(bow.durability).toBe(200);

        bow.takeDamage(100);
        expect(bow.getDamage()).toBe(10);
        expect(bow.durability).toBe(100);

        bow.takeDamage(50);
        expect(bow.getDamage()).toBe(5);
        expect(bow.durability).toBe(50);

        bow.takeDamage(150);
        expect(bow.getDamage()).toBe(0);
        expect(bow.durability).toBe(0);
        expect(bow.isBroken()).toBe(true);
    });

    test('Sword: правильный расчет урона с износом', () => {
        const sword = new Sword();
        expect(sword.getDamage()).toBe(25);
        expect(sword.durability).toBe(500);

        sword.takeDamage(300);
        expect(sword.getDamage()).toBe(25);
        expect(sword.durability).toBe(200);

        sword.takeDamage(100);
        expect(sword.getDamage()).toBe(12.5);
        expect(sword.durability).toBe(100);

        sword.takeDamage(100);
        expect(sword.getDamage()).toBe(0);
        expect(sword.durability).toBe(0);
    });
});