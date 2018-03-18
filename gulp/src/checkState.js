export const X_WINS = "X_WINS";
export const O_WINS = "O_WINS";
export const CAT_GAME = "CAT_GAME";
export const NOT_OVER = "NOT_OVER";

export const checkState = (grid) => {
	//is there a winner?
	let x,y;
	for(x = 0;x<3;x++){
		if(grid[x][0].value === false){
			continue;
		}
		if(grid[x][0].value == grid[x][1].value && grid[x][0].value == grid[x][2].value){
			if(grid[x][0].value == "X"){
				return X_WINS;
			}else{
				return O_WINS;
			}
		}
	}

	for(y=0;y<3;y++){
		if(grid[0][y].value === false){
			continue;
		}
		if(grid[0][y].value == grid[1][y].value && grid[0][y].value == grid[2][y].value){
			if(grid[0][y].value == "X"){
				return X_WINS;
			}else{
				return O_WINS;
			}
		}
	}

	if(grid[1][1].value !== false){
		if(grid[0][0].value == grid[1][1].value && grid[0][0].value == grid[2][2].value){
			if(grid[1][1].value == "X"){
				return X_WINS;
			}else{
				return O_WINS;
			}
		}
		if(grid[2][0].value == grid[1][1].value && grid[2][0].value == grid[0][2].value){
			if(grid[1][1].value == "X"){
				return X_WINS;
			}else{
				return O_WINS;
			}
		}
	}

	//is there a move left?
	for(x=0;x<3;x++){
		for(y=0;y<3;y++){
			if(grid[x][y].value === false){
				return NOT_OVER;
			}
		}
	}

	return CAT_GAME;
};
