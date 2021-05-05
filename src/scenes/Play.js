class Play extends Phaser.Scene
{
    constructor()
    {
       super("playScene"); 
    }

    preload()
    {
        this.load.atlas("planet_sheet", "./assets/spritesheets/spinning_planet.png", "./assets/spritesheets/spinning_planet.json");
        this.load.atlas("planet_top_sheet", "./assets/spritesheets/planet_toplayer.png", "./assets/spritesheets/planet_toplayer.json");
        this.load.image("gridBG", "./assets/single_sprites/grid_bg.png");
        this.load.image("obstacle", "./assets/sprites/TempEnemy.png");
        this.load.image("tempPlayer", "./assets/sprites/TempPlayer.png");

        this.load.spritesheet('basicObstacleSpritesheet', './assets/spritesheets/Obstacle_Sheet.png', {frameWidth: 156, frameHeight: 148, startFrame: 0, endFrame: 16})
        //this.load.plugin('rexpathfollowerplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexpathfollowerplugin.min.js', true);
    }

    create()
    {
        console.log("Entered play scene");

        this.anims.create({
            key: 'bObstacleAnim',
            frames: this.anims.generateFrameNumbers('basicObstacleSpritesheet',
            {
                start: 0,
                end: 15,
                first: 0
            }),
            frameRate: 12,
            repeat: -1

        });

        this.backgroundStatic = this.add.sprite(0,0, "gridBG").setOrigin(0,0);
        this.backgroundAnim = this.add.sprite(0,0, "planet_sheet").setOrigin(0,0);
        this.anims.create(
            {
                key: "spinning_planet_anim",
                frames: this.anims.generateFrameNames("planet_sheet", 
                {
                    prefix: "",
                    start: 1,
                    end: 120,
                    zeroPad: 4,
                }),
                frameRate: 240,
            });
        this.backgroundAnim.play("spinning_planet_anim");
        this.backgroundAnim.anims.setRepeat(-1);



        /*this.planetTopAnim = this.add.sprite(0,0, "planet_top_sheet").setOrigin(0,0);
        this.anims.create(
            {
                key: "planet_top_anim",
                frames: this.anims.generateFrameNames("planet_top_sheet", 
                {
                    prefix: "",
                    start: 1,
                    end: 120,
                    zeroPad: 4,
                }),
                frameRate: 30,
            });
        this.planetTopAnim.play("planet_top_anim");
        this.planetTopAnim.anims.setRepeat(-1);*/


        //Setup graphics
         this.curveGraphics = this.add.graphics();

         this.curveGraphics.lineStyle(10, 0xFF0000);
         this.curveGraphics.beginPath();
         this.curveGraphics.closePath();

         //Create actual spline points
        let testCurve = new Phaser.Curves.Spline([
            [game.config.width * .500,     game.config.height * .422], //[0]
            [game.config.width * (1-.280),     game.config.height * .432], //[1]
            [game.config.width * (1-.156),     game.config.height * .479], //[2]
            [game.config.width * (1-.109),     game.config.height * .528], //[3]
            [game.config.width * (1-.156),     game.config.height * .585], //[4]
            [game.config.width * (1-.262),     game.config.height * .605], //[5]
            //[game.config.width * (1-.500),     game.config.height * .595], //[6]
            [game.config.width * (.262),       game.config.height * .605], //[7]
            [game.config.width * (.156),       game.config.height * .585], //[8]
            [game.config.width * (.109),       game.config.height * .528], //[9]
            [game.config.width * (.156),       game.config.height * .479], //[10]
            [game.config.width * (.280),       game.config.height * .432], //[11]
        ]);

        //Create path using spline
        this.testPath = this.add.path(testCurve.points[0].x, testCurve.points[0].y);
        this.testPath.add(testCurve);
        this.testPath.closePath()

        //Draw the new path
        this.curveGraphics.strokePoints(this.testPath.curves[0].points);


        //Create enemy follower
        this.obs1 = new basicObstacle(this, this.testPath, testCurve.points[0].x, testCurve.points[0].y, 'basicObstacleSpritesheet', 0).setOrigin(.5);
        this.obs1.setScale(.6)
        this.obs1.play('bObstacleAnim');


        //Create temp physics body to test collision
        this.testPlayer = this.physics.add.sprite(testCurve.points[6].x + 150, testCurve.points[6].y, 'tempPlayer');
        this.testPlayer.body.onOverlap = true;

        //Setup physics world overlap event between player and obstacle
        this.physics.world.on('overlap', (obj1, obj2, bod1, bod2)=>{
            console.log(`${obj1.texture.key} is colliding with ${obj2.texture.key} body`);
            //Reset obj position on path
            obj1.reset()
        });

        //Setup keyboard control
        keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    }

    update(time, delta)
    {
        let deltaMultiplier = (delta/16.66667); //for refresh rate indepence.
        /*
        Please multiply any movements that are happening in the update function by this variable.
        That way they don't speed up on high refresh rate displays. Ask Ethan for more help/info
        if you are unsure.
        */

        if(Phaser.Input.Keyboard.JustDown(keyUP))
        {         
            this.testPlayer.y -= 100
        }

        if(Phaser.Input.Keyboard.JustDown(keyDOWN))
        {         
            this.testPlayer.y += 100
        }

        if(this.obs1.x < this.testPlayer.x - this.testPlayer.width/2)
            this.obs1.body.enable = false;

        this.physics.overlap(this.obs1, this.testPlayer)

        if(!this.obs1.isFollowing()) {
            this.obs1.reset()
        }
    }
}