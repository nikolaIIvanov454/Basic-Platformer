let config = {
    type: Phaser.AUTO,
    width: 1904,
    height: 949,
    backgroundColor: '#ffffff',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {y: 175}
        }
    },
};

let game = new Phaser.Game(config);

let player

let up
let left
let right
let space

let keys
let background
let cords
let platforms
let bc
let count
let button

let coin
let lava
let lavag

let c
let die
let gameOver

let counter = 0

//add button and disable scene or movement when winning

function preload()
{
    this.load.image('grasses','photos/assets/grasses.png')
    bc = this.load.image('background','photos/backgrounds/background.png')
    this.load.spritesheet('p','photos/spritesheets/player.png',{frameWidth: 190/4, frameHeight: 256/4})
    this.load.image('large platforms','photos/assets/large platform.png')
    this.load.spritesheet('coins','photos/spritesheets/coins.png',{frameWidth: 280/6, frameHeight: 40/1})
    this.load.spritesheet('lava','photos/spritesheets/lava.png',{frameWidth: 640/1, frameHeight: 1870/6})
    this.load.image('button','photos/assets/button.png')
    this.load.image('lava2','photos/assets/lava2.png')
}

function create()
{
   background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')

   this.physics.world.setFPS(60)

   let scaleX = this.cameras.main.width / background.width
   let scaleY = this.cameras.main.height / background.height
   let scale = Math.max(scaleX, scaleY)
   background.setScale(scale).setScrollFactor(0)
    
   player = this.add.sprite(100,480,'p')

   this.input.keyboard.manager.enabled = true

   //text
   cords = this.add.text(20, 20, '', {fontSize: '20px', fill: 'black',}).setScale(2).setScrollFactor(0).setResolution(10)

   count = this.add.text(1610, 20, '', {fontSize: '55px', fill: 'yellow', stroke: '5'}).setScrollFactor(0)

   check = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 80, '', {fontSize: '75px', fill: 'yellow'}).setScrollFactor(0).setOrigin(0.5)

   button = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2,'button')

   //button.visible = false

   //camera
   this.cameras.main.setBounds(0, 0, 3000, 3000)
   this.cameras.main.startFollow(player)
   this.cameras.main.setRoundPixels(true);

   //platfroms//
   platforms = this.physics.add.staticGroup()
   lava = this.physics.add.staticGroup()
   lavag = this.physics.add.staticGroup()

   this.physics.add.existing(player)

   this.physics.add.collider(player,platforms)

   createplatforms(100,540)

   coin = this.physics.add.staticGroup()
   
   up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
   left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A) 
   right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
   space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

   animations()

   for(let i = 400; i < 3000; i+= 350){
    let y = Phaser.Math.Between(550, 650)

    createplatforms(i,y)
    createcoins(i,y - 50)
    coin.playAnimation('flip',true)

    c = this.physics.add.collider(player, coin, function(player,ccoin){
        ccoin.destroy()
        counter++

        if(counter == 8){
            win()
        }
    })

    //this.physics.add.collider(player, coin, win, null, this)

    for(let i = 320; i < 3000; i+=640){
        createlava(i,900)
        lava2(i,1144)

        lava.playAnimation('flow',true)

        this.physics.add.collider(player, lava, dyingEffect, null, this)
    }   
}

}

function update()
{
    if(Phaser.Input.Keyboard.JustDown(space) && player.body.onFloor()){
        player.body.setVelocityY(-200)
    }else if(left.isDown){
        player.body.setVelocityX(-120)
        player.play('left',true)
    }else if(right.isDown){
        player.body.setVelocityX(120)
        player.play('right',true)
    }else if(left.isUp || right.isUp){
        player.play('idle')
        player.body.setVelocityX(0)
    }

    cords.text = ('Position: ' + 'X:' + Math.round(player.x) + ' Y:' + Math.round(player.y))

    count.text = ('Coins: ' + counter)
}

let animations = () => {

    keys = ['up','down','left','right','idle','coin','lava']


    game.anims.create({
        key: 'idle',
        frames: game.anims.generateFrameNumbers('p', { frames: [1] }),
        repeat: -1
    })

    game.anims.create({
        key: 'up',
        frames: game.anims.generateFrameNumbers('p', { frames: [12, 13, 14, 15] }),
        frameRate: 10,
        repeat: -1
    })

    game.anims.create({
        key: 'down',
        frames: game.anims.generateFrameNumbers('p', { frames: [0, 1, 2, 3] }),
        frameRate: 10,
        repeat: -1
    })

    game.anims.create({
        key: 'left',
        frames: game.anims.generateFrameNumbers('p', { frames: [8, 9, 10, 11] }),
        frameRate: 10,
        repeat: -1
    })

    game.anims.create({
        key: 'right',
        frames: game.anims.generateFrameNumbers('p', { frames: [4, 5, 6, 7] }),
        frameRate: 10,
        repeat: -1
    })

    game.anims.create({
        key: 'flip',
        frames: game.anims.generateFrameNumbers('coins',{ frames: [0,1,2,3,4,5]}),
        frameRate: 20,
        repeat: -1
    })

    game.anims.create({
        key: 'flow',
        frames: game.anims.generateFrameNumbers('lava',{frames: [0,1,2,3,4,5]}),
        frameRate: 5,
        repeat: -1
    })
}

let createplatforms = (x,y) => {
    platforms.create(x,y, 'large platforms').refreshBody()
}

let createlava = (x,y) =>{
    lava.create(x, y, 'lava').refreshBody()
}

let createcoins = (x,y) =>{
    coin.create(x, y, 'coins').refreshBody()
}

function dyingEffect (player, lava) {
    this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 80, 'You Died!', {fontSize: '55px', fill: 'black'}).setScrollFactor(0).setOrigin(0.5)

    //console.log(player)

    this.input.keyboard.manager.enabled = false

    this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2,'button')
    //buttons = this.add.text(1000, 574.5, 'Restart?', {fontSize: '70px', fill: 'black', backgroundColor: 'grey'}) -- text button example
    .setOrigin(0.5)
    .setScrollFactor(0)
    //.setPadding(10)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', function() {this.scene.restart()}, this)

    player.setTint(0xff0000)

    counter = 0
}

function win(){
    check.text = ('You Won!')

    //button.visible = true
    
    //console.log(counter)

    //button.setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true }).on('pointerdown', function() {buttons}, this)
    
}

let lava2 = (x,y) =>{
    lavag.create(x,y, 'lava2').refreshBody()
}

