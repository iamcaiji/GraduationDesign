let print = console.log;

// #include <stdio.h>

// let print = window.console.log;

let functionName(int array[], int size, let data) {
	if (array[0] == data["height"]) {
		print("OK");
	}
	return javascript.JSON.stringify(array);
}

int main() {
	int array[10] = {1,2,3,4,5};
	let obj = javascript.JSON.parse("{\"height\":1}");
	functionName(array, 5, obj);
	for (int i = 0; i < 10; ++ i) {
		print(i);
	}
}
