// src/player.js

const {
    Arm,
    Bow,
    Sword,
    Knife,
    Staff,
    LongBow,
    Axe,
    StormStaff
} = require('./weapon');

class Player {
    constructor(position, name) {
        this.life = 100;
        this.magic = 20;
        this.speed = 1;
        this.attack = 10;
        this.agility = 5;
        this.luck = 10;
        this.description = 'Игрок';
        this.weapon = new Arm();
        this.position = position;
        this.name = name;
        this._hitCount = 0;
        this._logMessages = [];
    }

    getLuck() {
        return (Math.random() * 100 + this.luck) / 100;
    }

    getDamage(distance) {
        if (distance > this.weapon.range) return 0;
        return (this.attack + this.weapon.getDamage()) * this.getLuck() / distance;
    }

    takeDamage(damage) {
        this.life = Math.max(0, this.life - damage);
        this._hitCount++;
    }

    isDead() {
        return this.life === 0;
    }

    moveLeft(distance) {
        const actualDistance = Math.min(distance, this.speed);
        this.position = Math.max(0, this.position - actualDistance);
        this._log(`двинулся влево на ${actualDistance}. Позиция: ${this.position}`);
    }

    moveRight(distance) {
        const actualDistance = Math.min(distance, this.speed);
        this.position += actualDistance;
        this._log(`двинулся вправо на ${actualDistance}. Позиция: ${this.position}`);
    }

    move(distance) {
        if (distance < 0) {
            this.moveLeft(Math.abs(distance));
        } else {
            this.moveRight(distance);
        }
    }

    isAttackBlocked() {
        return this.getLuck() > (100 - this.luck) / 100;
    }

    dodged() {
        return this.getLuck() > (100 - this.agility - this.speed * 3) / 100;
    }

    takeAttack(damage) {
        if (this.isAttackBlocked()) {
            this.weapon.takeDamage(10);
            this._log(`заблокировал атаку! Прочность оружия: ${this.weapon.durability}`);
            return;
        }
        if (this.dodged()) {
            this._log(`уклонился от атаки!`);
            return;
        }
        this.takeDamage(damage);
        this._log(`получил ${damage} урона. Осталось жизней: ${this.life}`);
    }

    checkWeapon() {
        if (this.weapon.isBroken()) {
            const weaponChain = this.getWeaponChain();
            const currentIndex = weaponChain.indexOf(this.weapon.constructor);
            if (currentIndex !== -1 && currentIndex < weaponChain.length - 1) {
                const NextWeaponClass = weaponChain[currentIndex + 1];
                this.weapon = new NextWeaponClass();
                this._log(`сменил оружие на ${this.weapon.name}`);
            }
        }
    }

    getWeaponChain() {
        return [this.weapon.constructor, Knife, Arm];
    }

    tryAttack(enemy) {
        const distance = Math.abs(this.position - enemy.position);
        if (distance > this.weapon.range) {
            this._log(`не достает до ${enemy.name} (расстояние: ${distance}, дальность: ${this.weapon.range})`);
            return;
        }
        this.weapon.takeDamage(10 * this.getLuck());
        this._log(`атакует ${enemy.name} оружием ${this.weapon.name}`);
        let damage = this.getDamage(distance);
        if (this.position === enemy.position) {
            damage *= 2;
            enemy.moveRight(1);
            this._log(`${enemy.name} отскочил вправо! Удвоенный урон: ${damage}`);
        }
        enemy.takeAttack(damage);
    }

    chooseEnemy(players) {
        const alivePlayers = players.filter(p => !p.isDead() && p !== this);
        if (alivePlayers.length === 0) return null;
        return alivePlayers.reduce((min, p) => p.life < min.life ? p : min);
    }

    moveToEnemy(enemy) {
        if (!enemy) return;
        const distance = enemy.position - this.position;
        if (Math.abs(distance) > this.weapon.range) {
            this.move(Math.sign(distance) * this.speed);
        }
    }

    turn(players) {
        if (this.isDead()) return;
        this._clearLog();
        this._log(`--- Ход ${this.name} (${this.constructor.name}) ---`);
        const enemy = this.chooseEnemy(players);
        if (!enemy) {
            this._log('Нет доступных врагов');
            return;
        }
        this._log(`Выбрал цель: ${enemy.name} (жизни: ${Math.round(enemy.life)})`);
        this.moveToEnemy(enemy);
        this.tryAttack(enemy);
        this.checkWeapon();
        this._printLog();
    }

    _log(message) { this._logMessages.push(message); }
    _clearLog() { this._logMessages = []; }
    _printLog() {
        if (this._logMessages.length > 0) {
            console.log(this._logMessages.join('\n  '));
        }
    }

    toString() {
        return `${this.name} (${this.constructor.name}): жизней=${Math.round(this.life)}, маны=${Math.round(this.magic)}, позиция=${this.position}, оружие=${this.weapon.name}`;
    }
}

// ---- КЛАССЫ ПЕРСОНАЖЕЙ ----

class Warrior extends Player {
    constructor(position, name) {
        super(position, name);
        this.life = 120;
        this.speed = 2;
        this.description = 'Воин';
        this.weapon = new Sword();
    }
    getWeaponChain() { return [Sword, Knife, Arm]; }
    takeDamage(damage) {
        this._hitCount++;
        if (this.life < this.life * 0.5 && this.getLuck() > 0.8) {
            if (this.magic > 0) {
                const magicDamage = Math.min(damage, this.magic);
                this.magic -= magicDamage;
                const remainingDamage = damage - magicDamage;
                if (remainingDamage > 0) {
                    this.life = Math.max(0, this.life - remainingDamage);
                }
                this._log(`использовал ману для блокировки урона. Мана: ${Math.round(this.magic)}`);
                return;
            }
        }
        this.life = Math.max(0, this.life - damage);
    }
}

class Archer extends Player {
    constructor(position, name) {
        super(position, name);
        this.life = 80;
        this.magic = 35;
        this.attack = 5;
        this.agility = 10;
        this.description = 'Лучник';
        this.weapon = new Bow();
    }
    getWeaponChain() { return [Bow, Knife, Arm]; }
    getDamage(distance) {
        if (distance > this.weapon.range) return 0;
        return (this.attack + this.weapon.getDamage()) * this.getLuck() * distance / this.weapon.range;
    }
}

class Mage extends Player {
    constructor(position, name) {
        super(position, name);
        this.life = 70;
        this.magic = 100;
        this.attack = 5;
        this.agility = 8;
        this.description = 'Маг';
        this.weapon = new Staff();
    }
    getWeaponChain() { return [Staff, Knife, Arm]; }
    takeDamage(damage) {
        this._hitCount++;
        if (this.magic > 50) {
            const reducedDamage = damage / 2;
            this.life = Math.max(0, this.life - reducedDamage);
            this.magic = Math.max(0, this.magic - 12);
            this._log(`уменьшил урон магией. Получено: ${reducedDamage}, мана: ${Math.round(this.magic)}`);
            return;
        }
        this.life = Math.max(0, this.life - damage);
    }
}

class Dwarf extends Warrior {
    constructor(position, name) {
        super(position, name);
        this.life = 130;
        this.attack = 15;
        this.luck = 20;
        this.description = 'Гном';
        this.weapon = new Axe();
    }
    getWeaponChain() { return [Axe, Knife, Arm]; }
    takeDamage(damage) {
        this._hitCount++;
        if (this._hitCount % 6 === 0 && this.getLuck() > 0.5) {
            const reducedDamage = damage / 2;
            this.life = Math.max(0, this.life - reducedDamage);
            this._log(`уменьшил урон (каждый 6-й удар). Получено: ${reducedDamage}`);
            return;
        }
        this.life = Math.max(0, this.life - damage);
    }
}

class Crossbowman extends Archer {
    constructor(position, name) {
        super(position, name);
        this.life = 85;
        this.attack = 8;
        this.agility = 20;
        this.luck = 15;
        this.description = 'Арбалетчик';
        this.weapon = new LongBow();
    }
    getWeaponChain() { return [LongBow, Knife, Arm]; }
}

class Demiurge extends Mage {
    constructor(position, name) {
        super(position, name);
        this.life = 80;
        this.magic = 120;
        this.attack = 6;
        this.luck = 12;
        this.description = 'Демиург';
        this.weapon = new StormStaff();
    }
    getWeaponChain() { return [StormStaff, Knife, Arm]; }
    getDamage(distance) {
        if (distance > this.weapon.range) return 0;
        let damage = super.getDamage(distance);
        if (this.magic > 0 && this.getLuck() > 0.6) {
            damage *= 1.5;
            this._log(`усилил атаку магией! Урон: ${damage}`);
        }
        return damage;
    }
}

module.exports = {
    Player,
    Warrior,
    Archer,
    Mage,
    Dwarf,
    Crossbowman,
    Demiurge
};