export const AI = (grid) => {
	let choices = [];
	let x,y;
	x=0;
	while(grid[x] !== undefined){
		y=0;
		while(grid[x][y] !== undefined){
			if(grid[x][y].value === false){
				choices.push(grid[x][y]);
			}
			y++;
		}
		x++;
	}

	let choice;
	if(choices.length == 1){
		choice = choices[0];
	}

	choice =choices[Math.floor(Math.random() * 1000) % choices.length];

	choice.value = "O";
	choice.domNode.innerHTML = "0";
};