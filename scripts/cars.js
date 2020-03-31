var car1;
var car2;

var cHeight;
var cWidth;

const maxSkids = 20;

window.onresize = function(){
    cWidth = window.innerWidth;
    cHeight =  window.innerHeight;
    this.myGameArea.canvas.width = cWidth;
    this.myGameArea.canvas.height = cHeight;
}

window.onload = function(){
    cWidth = window.innerWidth;
    cHeight = window.innerHeight;

    car1 = new car(30, 75, 225, 225, 0);

    car2 = new car(30, 75, 100, 300, 1);
    
    myGameArea.start();
}

var smoke;

function trail(point, active, maxStep) {
    this.points = [point];      //Points in Trail
    this.active = true;         //Is trail being added to
    this.length = 250;          //maximum amount of points in a trail
    this.step = 0;              //keep track of updates since last point added to trail
    this.maxStep = maxStep;           //steps needed to add a point
    this.add = function (point) {
        this.step++;
        if (this.step >= this.maxStep) {
            this.step = 0
            this.points.push(point);
        } else {
            this.points[this.points.length - 1] = point;
            return;
        }
        if (this.points.length >= this.length)
            this.points.shift();
    }
}

function point(xPos, yPos, ang, turn) {
    this.x = xPos;
    this.y = yPos;
    this.angle = ang;
}

var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.width = cWidth;
        this.canvas.height = cHeight;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 15);
        window.addEventListener('keydown', function (e) {
            e.preventDefault();
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
    },
    stop: function () {
        clearInterval(this.interval);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function car(width, height, x, y, type) {
    const maxSpeeds = [10, 15];
    const maxAngles = [4,5];
    const accels = [.1,.3];
    const brakes = [.3, .2];
    const colors = ['rgba(0,0,255)', 'rgba(255,0,0)'];
    const upBinds = [38,87];
    const downBinds = [40,83];
    const leftBinds = [37,65];
    const rightBinds = [39,68];

    this.up = upBinds[type];
    this.down = downBinds[type];
    this.right = rightBinds[type];
    this.left = leftBinds[type];
    this.skids = [];
    this.carImg = document.getElementById("car" + type);
    this.wheelImg = document.getElementById("sWheel");
    this.type = type;
    this.width = width;
    this.height = height;
    this.speed = 0;
    this.maxSpeed = maxSpeeds[type];
    this.accel = accels[type];
    this.brake = brakes[type];
    this.decel = .03;
    this.angle = 0;
    this.turnAngle = 0;
    this.turnRate = .4
    this.maxAngle = maxAngles[type];
    this.moveAngle = 0;
    this.break = false;
    this.x = x;
    this.y = y;



    this.update = function () {
        if (this.speed < 0) {
            this.speed += this.decel;
            if (this.speed > 0) this.speed = 0;
        } else {
            if (this.speed > 0) {
                this.speed -= this.decel;
                if (this.speed < 0) this.speed = 0;
            }
        }

        if (myGameArea.keys && myGameArea.keys[this.left]) {
            this.turnAngle -= this.turnRate;
            if (this.turnAngle < this.maxAngle * -1)
                this.turnAngle = this.maxAngle * -1;
        }
        if (myGameArea.keys && myGameArea.keys[this.right]) {
            this.turnAngle += this.turnRate;
            if (this.turnAngle > this.maxAngle)
                this.turnAngle = this.maxAngle;
        }


        if (this.turnAngle < 0) {
            this.turnAngle += this.turnRate / 2;
            if (this.turnAngle > 0)
                this.turnAngle = 0;
        } else {
            if (this.turnAngle > 0)
                this.turnAngle -= this.turnRate / 2;
            if (this.turnAngle < 0)
                this.turnAngle = 0;
        }

        if (this.speed != 0) {
            this.moveAngle = this.turnAngle;
        }
        if (this.speed == 0) {
            //myGameArea.context.fillText("mAngle  = " + this.moveAngle, 10, 50);
            if (this.moveAngle > 0) {
                this.moveAngle -= this.turnRate / 2;
                if (this.moveAngle < 0)
                    this.moveAngle = 0;
            } else if (this.moveAngle < 0) {
                this.moveAngle += this.turnRate / 2;
                if (this.moveAngle > 0)
                    this.moveAngle = 0;
            }
        }


        if (myGameArea.keys && myGameArea.keys[this.up]) {
            if (this.speed >= 0)
                this.speed += this.accel;
            else
                this.speed += this.brake;
            this.reverse = false;
        }

        myGameArea.context.fillStyle = "red";
        if (myGameArea.keys && myGameArea.keys[this.down]) {
            if (this.speed > 0)
                this.break = true;
            if (!this.break) {
                this.speed -= this.accel;
                //myGameArea.context.fillText("reverse", 10, 10);
                this.reverse = true;
            } else {
                //myGameArea.context.fillText("break", 10, 10);
                this.speed -= this.brake;
                if (this.speed < 0) {
                    this.speed = 0;
                }
            }
        } else {
            this.break = false;
        }

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if (this.speed < this.maxSpeed / -4) {
            this.speed = this.maxSpeed / -4;
        }
    }
    this.draw = function () {
        ctx = myGameArea.context;
        ctx.save();

        //-------------------- Draw Tires --------------------
        ctx.translate(this.x, this.y);     					//move to car position
        ctx.rotate(this.angle);								//rotate to car angle

        //-------------------- Rear --------------------
        ctx.fillStyle = "black";
        ctx.fillRect(this.width / -2 - 2, this.height - 25, 5, 15);
        ctx.fillRect(this.width / 2 - 3, this.height - 25, 5, 15);

        //-------------------- Passenger Left --------------------
        ctx.translate(-this.width / 2, +15);
        ctx.rotate(this.turnAngle / 5);
        ctx.translate(this.width / 2, -15);
        ctx.fillRect(-this.width / 2 - 2, 6, 7, 15);
        ctx.rotate(this.turnAngle / -5);

        //-------------------- Passenger Front --------------------
        ctx.translate(this.width, 0);
        ctx.rotate(this.turnAngle / 5);
        ctx.translate(-this.width, 0);
        ctx.fillRect(this.width - 20, 6, 7, 15);
        ctx.rotate(this.turnAngle / -5);

        ctx.restore();
        ctx.save();

        //-------------------- Draw Body --------------------
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.carImg, this.width / -2, 0, this.width, this.height);

        ctx.restore();
    }
    this.drawSteeringWheel = function (x, y) {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(x + 15, y + 15);
        ctx.rotate(this.turnAngle / 5);

        ctx.drawImage(this.wheelImg, -15, -15, 30, 30);
        ctx.restore();
    }
    this.drawTrails = function () {
        ctx = myGameArea.context;
        ctx.save();

        //-------------------- Update Trails --------------------
        var position = new point(this.x, this.y, this.angle); //current position of car

        if (this.moveAngle > 1.5 || this.moveAngle < -1.5) {  //check turn angle
            if (this.skids.length < 1) { 							//if no skids then create one
                this.skids.push(new trail(position, true, 4));
            }
            if (this.skids[this.skids.length - 1].active) { 				//add pos to active skid
                this.skids[this.skids.length - 1].add(position);
            }
            else { 											//otherwise create a new trail
                this.skids.push(new trail(position, true, 4));
            }
        } else { 												//not turning then set newest skid inactive
            if (this.skids.length > 0)
                this.skids[this.skids.length - 1].active = false;
        }
        if (this.skids.length >= maxSkids) {								//too many skids then shift
            this.skids.shift();
        }

        if (typeof smoke == 'undefined') {					//if smoke isnt created
            smoke = new trail(position, true);				//initialize smoke
            smoke.length = 5;								//set length
        } else {
            smoke.add(position);							//add pos to smoke
        }

        //-------------------- Draw Skids --------------------
        for (var ski = 0; ski < this.skids.length; ski++) {		//iterate skids
            var s = this.skids[ski];
            if (typeof s.points[0] !== 'undefined') {			//null check
                position = s.points[0];						//start pos

                //-------------------- Draw Left Skid --------------------
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(0,0,0,'+(0.6)*(1-((this.skids.length - ski)/maxSkids))+')';			//black semi-transparent
                ctx.lineWidth = 5;
                tireY = position.y + (Math.cos(position.angle + .198) * 76.5);
                tireX = position.x - Math.sin(position.angle + .198) * 76.5;
                ctx.moveTo(tireX, tireY);					//above uses angle distance formula

                for (i = 0; i < s.points.length; i++) { 		//iterate points
                    var p = s.points[i];					//store point
                    tireY = p.y + (Math.cos(p.angle + .198) * 76.5);
                    tireX = p.x - Math.sin(p.angle + .198) * 76.5;
                    ctx.lineTo(tireX, tireY);				//above uses angle distance formula
                }
                ctx.stroke();								//draw line

                //-------------------- Draw Right Skid --------------------
                ctx.beginPath();

                tireY = position.y + (Math.cos(position.angle - .198) * 76.5);
                tireX = position.x - Math.sin(position.angle - .198) * 76.5;
                ctx.moveTo(tireX, tireY);					//above uses angle distance formula

                for (i = 0; i < s.points.length; i++) {		//iterate points
                    var p = s.points[i];					//store point
                    tireY = p.y + (Math.cos(p.angle - .198) * 76.5);
                    tireX = p.x - Math.sin(p.angle - .198) * 76.5;
                    ctx.lineTo(tireX, tireY);        		//above uses angle distance for
                }
                ctx.stroke();								//draw line
            }
        }

        //-------------------- Draw Smoke --------------------
        ctx.fillStyle = 'rgba(200,200,200,.3)';
        for (i = 0; i < smoke.points.length; i++) {
            var p = smoke.points[i];
            smokeY = p.y + (Math.cos(p.angle) * 75);
            smokeX = p.x - Math.sin(p.angle) * 75;
            var size = Math.random() * 5 + 1;
            ctx.beginPath();
            ctx.arc(smokeX, smokeY, size, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    this.newPos = function () {

        if (this.speed < 0 || this.reverse == true) {
            this.angle -= this.moveAngle * Math.PI / 180;
        } else {
            this.angle += this.moveAngle * Math.PI / 180;
            this.reverse = false;
        }
        var newX = this.x + this.speed * Math.sin(this.angle);
        var newY = this.y - this.speed * Math.cos(this.angle);

        // if intersects
        // change moveangle += Pi
        //

        this.x = newX;
        this.y = newY;
    }
    this.drawSpeedGui = function (x, y) {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(x, y);

        var speedRate = Math.abs(this.speed / this.maxSpeed * 100);

        var gradient = ctx.createLinearGradient(0, 0, 100, 0);
        gradient.addColorStop(0, "green");
        gradient.addColorStop(1, "red");

        ctx.fillStyle = gradient;

        ctx.fillRect(0, 0, speedRate, 20);

        gradient = ctx.createLinearGradient(0, 0, 100, 0);
        gradient.addColorStop(0, "blue");
        gradient.addColorStop(1, "black");

        ctx.fillStyle = gradient;
        ctx.fillRect(speedRate, 0, 100 - speedRate, 20);

        ctx.translate(125, 10);
        
        ctx.fillStyle = 'rgba(0,0,0)';
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = colors[type];				
        ctx.rotate(this.angle);


        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(-5, 10);
        ctx.lineTo(5, 10);
        ctx.fill();

        ctx.strokeStyle = colors[type];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.restore();
    }


    this.drawPositionIndicator = function () {
        ctx = myGameArea.context;

        var xPos = this.x < cWidth ? this.x : cWidth;
        xPos = xPos < 0 ? 10 : xPos;

        var yPos = this.y < cHeight ? this.y : cHeight;
        yPos = yPos < 0 ? 10 : yPos;

        ctx.fillStyle = colors[type];
        ctx.fillRect(xPos - 10, 0, 10, 5);

        ctx.fillRect(0, yPos - 10, 5, 10);
    }
}

function updateGameArea() {
    myGameArea.clear();

    car1.update();
    car1.newPos();
    car2.update();
    car2.newPos();

    car2.drawTrails();
    car1.drawTrails();
    car1.draw();
    car2.draw();

    car1.drawPositionIndicator();
    car2.drawPositionIndicator();
    
    car1.drawSpeedGui(50, cHeight - 100);
    car2.drawSpeedGui(50, cHeight - 50);
    car1.drawSteeringWheel(10, cHeight - 105)
    car2.drawSteeringWheel(10, cHeight - 55)
    
}