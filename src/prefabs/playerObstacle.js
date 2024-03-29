class playerObstacle extends Phaser.GameObjects.PathFollower {
    constructor(scene, curve, x, y, texture, frame) {
        super(scene, curve, x, y, texture, frame);
        scene.add.existing(this);
        
        this.distanceAlongCurve = 0;
        this.totalFollowDuration = 4000;
        this.expired = false; //If this is true, the next time this resets it is destroyed
        this.fullScale = .4;

        //Setup path initial follow config
        this.pathSpawnConfig = {
            //Duration is the total duration * the percentage of the path left to traverse
            //from: + duration coefficent should = 1 to kepp consistent speed
            duration: this.totalFollowDuration * .32,
            from: .68,
            to: 1,
            startAt: 0

        };

        //Setup path loop follow config
        this.pathLoopConfig = {
            duration: this.totalFollowDuration,
            from: 0,
            to: 1,
            startAt: 0
        };

        this.offsetY = -Math.abs(this.scene.player.y - game.config.height * .595)

        this.startFollow(this.pathSpawnConfig)

        this.pathTween.setTimeScale(this.scene.speedIncreasePoint);

        this.pathOffset.y = this.offsetY

        //Enable physics
        scene.physics.world.enable(this);
        this.body.onOverlap = true;
        this.body.setSize(this.width*.5, this.height*.5);
        this.body.immovable = true;
        this.body.allowGravity = false;

        //Create planet mask
        this.shape = scene.make.graphics();

        this.shape.fillStyle(0xffffff);
        this.shape.beginPath();
        this.shape.fillRect(0, 0, 385, 720)
        this.shape.fillRect(game.config.width - 385, 0, 385, 720)
        this.shape.fillRect(0, game.config.height/2, 1280, 360)
        this.onMask = this.shape.createGeometryMask();

        this.shape = scene.make.graphics();

        this.shape.fillStyle(0xffffff);
        this.shape.beginPath();
        this.shape.fillRect(0, 0, 1280, 720)

        this.offMask = this.shape.createGeometryMask();

        this.setMask(this.onMask);

        this.setScale(.4)
        this.play('player_obstacle_anim');

        scene.physics.overlap(this, scene.player)

        this.csLogTimer = scene.time.addEvent({
            delay: 1000,
            repeat: 60
        });

        this.expireTimer = scene.time.addEvent({
            delay: 10000,
            repeat: 0,
            callback: ()=>{this.expired = true;}
        });
    }

    reset() {
        if(this.expired) {
            this.destroy();
            return
        }
        let oldTimeScale = this.pathTween.timeScale;
        this.setMask(this.onMask);
        this.stopFollow();
        this.setPosition(this.path.curves[0].points[0].x, this.path.curves[0].points[0].y);
        this.startFollow(this.pathLoopConfig, 0)
        this.pathTween.setTimeScale(oldTimeScale);
        this.pathOffset.y = this.offsetY;

        this.body.enable = true;
    }

    update() {

        this.distanceAlongCurve = this.pathTween.elapsed / this.totalFollowDuration;

        if (this.scene.gameSpeedTimer.getOverallProgress() > this.scene.speedIncreasePoint) {
            this.pathTween.setTimeScale(this.scene.gameSpeedTimer.getOverallProgress());
        }

        //Slightly scale the objects
        if(this.distanceAlongCurve < .36) {
            this.setScale(this.fullScale * (1-Math.abs(.36 - this.distanceAlongCurve)));
        }
        else if (this.distanceAlongCurve > .68) {
            this.setScale(this.fullScale * (1-Math.abs(.68 - this.distanceAlongCurve)));
        }

        if(this.x < this.scene.player.x - this.scene.player.width/2)
        this.body.enable = false;

        if(!this.isFollowing()) {
            this.reset()
        }

        if(this.x > game.config.width * (1-.12)) {
            //console.log("Off")
            this.setMask(this.offMask);
        }

        if(this.x < game.config.width * (.16)) {
            //console.log("On")
            this.setMask(this.onMask);
        }

        if(!this.isFollowing()) {
            this.reset()
        }
    }   

}