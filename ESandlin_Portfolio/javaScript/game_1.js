// Get the canvas element and its context
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 600;
const CANVAS_HEIGHT = canvas.height = 600;
ctx.font = "2em Arial";
//ctx.fillText("Welcome to the RPG Game.",10,80);

/**
This code defines classes for characters, enemies, and the player. It includes methods for attacking enemies and displaying character information. You can expand upon this code by adding more features like multiple areas to explore, items to collect, and a more interactive battle system.
Let's create a simple text-based RPG game where the player can choose their character class, explore different areas, and engage in battles.
**/
// Define character classes 
class Character {
  constructor(name, hp, attack) {
    this.name = name;
    this.hp = hp;
    this.attack = attack;
  }

  // Method to attack another character
  attackEnemy(enemy) {
    CanvasRenderingContext2D(`${this.name} attacks ${enemy.name} for ${this.attack} damage!`);
    enemy.hp -= this.attack;
    console.log(`${enemy.name} has ${enemy.hp} HP remaining.`);
  }
}

// Enemy class
class Enemy extends Character {
  constructor(name, hp, attack) {
    super(name, hp, attack);
  }
}

// Player class inherits from Character
class Player extends Character {
  constructor(name, hp, attack, characterClass) {
    super(name, hp, attack);
    this.characterClass = characterClass;
  }

  // Method to display player's info
  displayInfo() {
    console.log(`Name: ${this.name}`);
    console.log(`Class: ${this.characterClass}`);
    console.log(`HP: ${this.hp}`);
    console.log(`Attack: ${this.attack}`);
  }
}

// Create player
const player = new Player('Hero', 100, 10, 'Warrior');

// Create enemies
const enemy1 = new Enemy('Goblin', 50, 5);
const enemy2 = new Enemy('Orc', 80, 8);

// Simulate battle
player.displayInfo();
player.attackEnemy(enemy1);
player.attackEnemy(enemy1);
player.attackEnemy(enemy2);
