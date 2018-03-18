import {AI} from "./ai.js";
import {
	checkState,
	X_WINS,
	O_WINS,
	CAT_GAME,
	NOT_OVER
} from "./checkState.js";
let grid = [[false,false,false],[false,false,false],[false,false,false]];
let started = false;

const setInstructions = (text) => {
	document.getElementById("instructions").innerText = text;
};

const endGame = (winner) => {
	let x,y;
	let after = 2;
	after++;
	x=0;
	while(grid[x] !== undefined){
		y=0;
		while(grid[x][y] !== undefined){
			grid[x][y].domNode.disabled = true;
			y++;
		}
		x++;
	}


	if(winner === CAT_GAME){
		setInstructions("CAT, no winner....");
	}else if(winner == X_WINS){
		setInstructions("Winner Winner Chicken Dinner! You won!");
	}else{
		setInstructions("Lost to a computer, SAD!");
	}
	let refreshButton = document.createElement("button");
	refreshButton.onclick = function(){
		location.reload();
	};
	refreshButton.innerHTML = "Reload Game";
	document.getElementById('grid').appendChild(refreshButton);
};

const gridclick = (x,y) => {
	if(started === false){
		let comp = document.getElementById("comp");
		comp.parentNode.removeChild(comp);
	}
	started = true;
	if(grid[x] === undefined || grid[x][y] === undefined){
		return;
	}
	if(grid[x][y].value !== false){
		setInstructions("That's already been taken, try somewhere else.");
		return;
	}

	grid[x][y].value = 'X';
	grid[x][y].domNode.innerHTML = "X";
	
	let state = checkState(grid);

	if(state !== NOT_OVER){
		endGame(state);
		return;
	}
	AI(grid);

	state = checkState(grid);
	if(state !== NOT_OVER){
		endGame(state);
	}
};

const startGame = () => {
	let gridDomNode = document.getElementById("grid");
	let x,y;

	x = 0;
	while(grid[x] !== undefined){
		y = 0;
		while(grid[x][y] !== undefined){
			grid[x][y] = {
				value: false,
				x: x,
				y: y
			};
			grid[x][y].domNode = document.createElement("button");
			grid[x][y].domNode.id = ""+x+y;
			grid[x][y].domNode.innerHTML = "-";
			grid[x][y].domNode.onclick = gridclick.bind(this, x,y);
			gridDomNode.appendChild(grid[x][y].domNode);

			y++;
		}
		gridDomNode.appendChild(document.createElement("br"));

		x++;
	}

	let compNode = document.getElementById("comp");
	compNode.onclick = function(){
		started = true;
		AI(grid);
		compNode.parentNode.removeChild(compNode);
	};
};


window.addEventListener("load",function(){startGame();},false);
console.log("done");
