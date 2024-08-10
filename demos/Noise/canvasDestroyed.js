/*
Easy implementation:
beach/water scalar, colour change, populous point and click to raise as per brush style 
redraw feature  
styles and types.. round island vs.. else 
*/
///
var canvas;
var ctx;
var N = 128; // 256 = nice
var size = 4; // 2 is nice
var mouseX; 
var mouseY;
var p1;
var map1 = [];
var map2 = [];
var map3 = [];
var map4 = [];
var oct = 256;
var scalar = .8    ; // .8 grainy and okay ... 0.4 smooth af
var cutMod = .05;
var baseColour;

function init(){
	canvas = document.getElementById("farm");
	ctx = canvas.getContext("2d");
	window.addEventListener('keydown',handleKeyDown);
    window.addEventListener('mousemove',handleMouseMove);
    baseColour = Math.random()*100;
    map1 = myNoise2D(map1);
    map2 = myNoise2D(map2);
    genMap3Cut();
    cutMapBorder()
    drawAll();
}

function handleKeyDown(e) {
    if (e.key == "ArrowUp"){	
        e.preventDefault();
    }
    if (e.key == "ArrowDown"){
        e.preventDefault();
    }
    if (e.key == "ArrowLeft"){
        e.preventDefault();
    }
    if (e.key == "ArrowRight"){
        e.preventDefault();
    }
    console.log(e.key);
}
function handleMouseMove(e) {
    var canvasRect = canvas.getBoundingClientRect();
    mouseX = e.clientX -canvasRect.left;
    mouseY = e.clientY -canvasRect.top;
}

function myNoise2D(map){
    // init map
    let seed2D = new Array(N);
    for (let i = 0 ; i < N ; i++ ){
        seed2D[i] = new Array(N);
        for (let j = 0 ; j < N ; j++ ){
            seed2D[i][j] = Math.random();
        }
    }

//     var N = 128; // 256 = nice
//     var size = 4; // 2 is nice
//     var oct = 256;
//     var scalar = .8    ; // .8 grainy and okay ... 0.4 smooth af
//     var cutMod = .05;

    var scale = oct;
    var jump = N;
    var sum = 0;  
    while ( jump >= 1 ){

        for(let g = 0 ; g < N ; g+= jump){
            var offsetG;
            if (g+jump >= N){
                offsetG = Math.floor(g+jump-1);
            } else {
                offsetG = Math.floor(g+jump);
            }
            for ( let j = 0 ; j < N ; j+=jump ){
                let offsetJ;
                if (j==0 && g==0 ){ 
                    map[g][j]+= seed2D[g][j]*scale; 
                } 
                if (j==0 ) {
                    map[offsetG][j]+= seed2D[offsetG][j]*scale;
                }
                if (j+jump >= N){
                    offsetJ = Math.floor(j+jump-1);
                } else {
                    offsetJ = Math.floor(j+jump);
                }
                if (g==0 ) {
                    map[g][offsetJ]+= seed2D[g][offsetJ]*scale;    
                }
                map[offsetG][offsetJ]+= seed2D[offsetG][offsetJ]*scale;
                interpolate2D(g,offsetG,j,offsetJ,map);
            }
        }
        jump = Math.floor(jump/2);
        // sum+=scale;
        scale*=scalar;
    }
    // for (let h = 0 ; h < N ; h++ ){
    //     for (let i = 0 ; i < N ; i++ ){
    //         map[h][i] = map[h][i]/sum;
    //     }   
    // }   
    return map; 
}

function interpolate2D(startG,endG,startJ,endJ,map){
    var midG = Math.floor((startG + endG)/2);
    var midJ = Math.floor((startJ + endJ)/2);
    if ( midG > startG && midG < endG && midJ > startJ && midJ < endJ ){
        map[midG][midJ] = (( map[startG][startJ]+map[endG][endJ]+map[endG][startJ]+map[startG][endJ])/4);
        map[startG][midJ] = ((map[startG][startJ]+map[startG][endJ])/2);
        map[midG][startJ] = ((map[startG][startJ]+map[endG][startJ])/2); 
        map[midG][endJ] = ((map[startG][endJ]+map[endG][endJ])/2);
        map[endG][midJ] = ((map[endG][startJ]+map[endG][endJ])/2);
        interpolate2D(startG,midG,startJ,midJ,map);
        interpolate2D(midG,endG,startJ,midJ,map);
        interpolate2D(startG,midG,midJ,endJ,map);
        interpolate2D(midG,endG,midJ,endJ,map);
    } else if (  midJ > startJ && midJ < endJ){ 
        map[startG][midJ] = ((map[startG][startJ]+map[startG][endJ])/2);
        map[endG][midJ] = ((map[endG][startJ]+map[endG][endJ])/2);
        interpolate2D(startG,endG,startJ,midJ,map);
        interpolate2D(startG,endG,midJ,endJ,map);
    } else if ( midG > startG && midG < endG  ){
        map[midG][startJ] = ((map[startG][startJ]+map[endG][startJ])/2); 
        map[midG][endJ] = ((map[startG][endJ]+map[endG][endJ])/2);
        interpolate2D(startG,midG,startJ,endJ,map);
        interpolate2D(midG,endG,startJ,endJ,map);
    }
}

function genMap3Cut(){
    for (let i = 0 ; i < N ; i++ ){ 
        map3[i] = new Array(N);
        map4[i] = new Array(N);
        for (let j = 0 ; j < N ; j++ ){
            map3[i][j]=0;
            map4[i][j]=0;
        }
    }
    let M = Math.floor(N*0.5);
    for (let i = 0 ; i < M ; i++ ){ 
        for (let j = 0 ; j < M ; j++ ){
            map3[M-i-1][M-j-1]= (M-i)/M*(M-j)/M;
            map3[M+i][M-j-1]= (M-i)/M*(M-j)/M;
            map3[M-i-1][M+j]= (M-i)/M*(M-j)/M;
            map3[M+i][M+j]= (M-i)/M*(M-j)/M;
        }
    }
    for (let i = 0 ; i < M ; i++ ){ 
        for (let j = 0 ; j < M ; j++ ){ 
            map4[M-i-1][M-j-1]= 1-Math.min((M-j)/M,(M-i)/M)*.4;
            map4[M+i][M-j-1]= 1-Math.min((M-j)/M,(M-i)/M)*.4;
            map4[M-i-1][M+j]= 1-Math.min((M-j)/M,(M-i)/M)*.4;
            map4[M+i][M+j]= 1-Math.min((M-j)/M,(M-i)/M)*.4;
        }
    }
}

function cutMapBorder(){
    for (let i = 0 ; i < N ; i++ ){ 
        for (let j = 0 ; j < N ; j++ ){
            map1[i][j] *= ( 1 -  map4[i][j] );
        }
    }
}

function genNoise(){
    for (let i = 0 ; i < N ; i++ ){
        map[i] = new Array(N);
        for (let j = 0 ; j < N ; j++ ){
            map[i][j] = Math.round(Math.random()*50);
        }
    }
}


function average(){
    for (let i = 1 ; i < N-1 ; i+=1 ){
        for (let j = 1 ; j < N-1 ; j+=1 ){
            map[i][j] = Math.round((map[i][j]+map[i-1][j+1]+map[i-1][j-1]+map[i-1][j+1]+map[i-1][j-1] )/5);
        }
    }
}

function pass(size){
    var add_sub = 0;
    var toggle = false;
    for (let i = 0 ; i < N ; i++ ){ 
        let temp = add_sub;
        for (let j = 0 ; j < N ; j++ ){
            if (Math.random() <= 0.25) { toggle=!toggle; }
            if (add_sub >= size){toggle = true;}
            else if (add_sub <= -size){toggle = false;}
            map[j][i] += add_sub;
            if (toggle){add_sub--;} else {add_sub++;}
        }
        add_sub = temp;
        if (toggle){add_sub--;} else {add_sub++;}
    }
}



function genEmptyGrid(){
    for (let i = 0 ; i < N ; i++ ){
        map[i] = new Array(N);
        for (let j = 0 ; j < N ; j++ ){
            map[i][j] = 0;
        }
    }
}
