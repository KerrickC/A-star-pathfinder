//Uses heuristics to make "educated guess" in order to find shortest path
// f(n) = g(n) + h(n)
//used in pathfinding and graph traversal

//possible optimizations:
    //could use faster search when looking through open and closed sets for node
    //make diagonal travel between obstacles impossible


var cols =50;
var rows = 50;
var grid = new Array(cols);




var openSet = []; //nodes that still need to be evaluated (starts with start node)
var closedSet = []; //nodes that no longer need evaluation (starts empty)
var start;
var end;
var w,h;
var path = [];
var nosolution = false;

function removeFromArray(arr, elt){ //remove element from array function
    for(var i = arr.length -1; i>=0; i --){
        if(arr[i] == elt){
            arr.splice(i,1);
        }
    }
}

function heuristic(a,b){
   var d = dist(a.i,a.j,b.i,b.j); //built in function that calculated euclidian distance
    //var d = abs(a.i-b.i) + abs(a.j-b.j); //taxi-cab distance (more accurate than euclidian because we can only move up/down and left/right)
    return d;
}

function Route(){ //begins route
    loop(); //ends noLoop()
    openSet = [];
    closedSet = [];
    path=[];
    setup();
    draw();
}

function Node(i,j) { //create node object
    this.f = 0;
    this.g = 0; //time or steps taken to get to the node
    this.h = 0; //heuristic - educated guess time to end
    this.i = i; //node "x" grid location
    this.j = j; // node "y" grid location
    this.wall = false; //whether Node is obstacle or not

    if(random(1) < 0.3){ //randomly generates obstacle nodes (decimal number is chance node will become obstacle)
        this.wall = true;
    }

    this.neighbors = []; //neighbors of current node
    this.previous = undefined; //need to keep track in order to trace back path at end

    this.show = function(col) {
        fill(col);
        if(this.wall){
            fill(0);
        }
        noStroke();
        rect(this.i*w,this.j*h,w-1,h-1);
    }

    this.addNeighbors = function(grid){
        var i = this.i;
        var j = this.j;

        //neighbors of current node
        //if statements check if were on side of array to avoid out of bounds
        if(i < cols-1){
            this.neighbors.push(grid[i+1][j]);
        }
        if(i > 0){
            this.neighbors.push(grid[i-1][j]);
        }
        if(j < rows-1){
            this.neighbors.push(grid[i][j+1]);
        }
        if(j > 0){
            this.neighbors.push(grid[i][j-1]);
        }
        //diagonals
        if(j > 0 && i > 0){ 
            this.neighbors.push(grid[i-1][j-1]);
        }
        if(j > 0 && i < cols-1){ 
            this.neighbors.push(grid[i+1][j-1]);
        }
        if(j < rows-1 && i > 0){ 
            this.neighbors.push(grid[i-1][j+1]);
        }
        if(j < rows-1 && i < cols-1){ 
            this.neighbors.push(grid[i+1][j+1]);
        }
    }

}

function setup() {
    var canvas = createCanvas(300,300); //create canvas
    canvas.parent('sketch-div');
    var startx = document.getElementById("startx").value;
    var endx = document.getElementById("endx").value;
    var starty = document.getElementById("starty").value;
    var endy = document.getElementById("endy").value;

    
    console.log('A*');
    console.log(startx);

    w = width/cols; //adjust width and height to fill canavs
    h = height/rows; // "

    //make 2d array to store all nodes
    for(var i = 0; i < cols; i++){
        grid[i] = new Array(rows);
    }

    //fills 2D array with nodes
    for(var i = 0; i < cols; i ++){
        for(var j = 0; j < rows; j ++){
            grid[i][j] = new Node(i,j);
        }
    }

    //add neighboring nodes to neighbors
    for(var i = 0; i < cols; i ++){
        for(var j = 0; j < rows; j ++){
            grid[i][j].addNeighbors(grid);
        }
    }

    start = grid[startx][starty]; //top left of grid
    end = grid[endx][endy]; //bottom right of grid
    
    //ensure neither start nor end node can become a wall
    start.wall = false;
    end.wall = false;

    openSet.push(start); //puts start node in openSet

    //console.log(grid);


}

function draw() {
    if (openSet.length > 0){ //continue (would normally use while loop but draw() already loops)

        var winner = 0; //assume lowest is first
        for(var i = 0; i < openSet.length; i ++){
            if(openSet[i].f < openSet[winner].f) { 
                winner = i;
            }
        }

        var current = openSet[winner];

        if(current === end) { //if best option is ending, then done
           
            noLoop();
            
            console.log('Done!');

            
        }

        removeFromArray(openSet, current); //remove current from openSet
        closedSet.push(current); //add current to closedSet

        var neighbors = current.neighbors; //get neighbors of current node
        for(var i = 0; i < neighbors.length; i ++){ //loop through neighbors
            var neighbor = neighbors[i];

            if(!closedSet.includes(neighbor) && !neighbor.wall) { //if neighbor is not in closed set and not a wall, create tempG and increase by 1 (g is the time to get to that spot(amount of "jumps"))
                var tempG = current.g + 1;

                var newPath = false;

                if(openSet.includes(neighbor)){ //if evaluated before, check if tempG is less than its current G value, if it is, change current G to tempG
                    if(tempG < neighbor.g){
                        neighbor.g = tempG;
                        newPath = true;
                    }
                }else{ //if havent been evaluated before, set g val to tempG and add to openSet
                    neighbor.g = tempG;
                    newPath = true;
                    openSet.push(neighbor);
                }

                if(newPath){ //only if new path found, if not, algoritms is always updating previous location, even if current path is better
                    neighbor.h = heuristic(neighbor, end); //heuristic - "educated guess" to get to end, using raw euclidian distance as heuristic (can use others)

                    neighbor.f = neighbor.g + neighbor.h; //calculate "score" of node (f = g + h)
    
                    neighbor.previous = current; //previous node is the current node that the neighbor object is contained in
                }
            }
        }

    }else{ //no solution
        console.log("No possible path :(")
        nosolution = true;
        noLoop();
    }

    background(0); //set white background to canvas
    
    for(var i = 0; i < cols; i ++){
        for(var j = 0; j < rows; j ++){
            grid[i][j].show(color(255)); //shows node grid as white
        }
    }

    for(var i = 0; i < closedSet.length; i++){
        closedSet[i].show(color(255,0,0)); //closedSet show as red
    }

    for(var i = 0; i < openSet.length; i ++){
        openSet[i].show(color(0,255,0)); //openSet show as green

    }


    //find final path
    if(!nosolution){ //if openSet > 0 at end, no solution is possible (this avoid the code breaking and giving error) also allows for ending path to remain even if not complete
        path = [];
        var temp = current;
        path.push(temp);
        while(temp.previous){ //while node has current, add to path (adds all previous nodes to create path - like backtracking over the path taken)
            path.push(temp.previous);
            temp = temp.previous;
        }
    }

    for(var i = 0; i < path.length; i ++){
        path[i].show(color(0,0,255)); //path color blue
    }

    //draw path line
    noFill();
    stroke(255);
    beginShape();
    for(var i = 0; i < path.length; i ++){
        vertex(path[i].i * w + w/2, path[i].j * h + h/2);
    }
    endShape();


}