// Array destructuring (skipping elements, rest)
let [first, second, third, , ...rest] = [1, 2, 3, 4, 5, 6];

// Object destructuring (defaults, alternate key names)
let { alpha: myVar = 'hello world', bravo } = { alpha: 'A', bravo: 'B' };

// Arrow functions
let myFunc = (param) => console.log(param);

// Ternary
let msg = isTrue ? 'True' : 'Not True';

// Spread
let myArray = [...[1, 2, 3], ...[4, 5, 6]];

// Template literals
console.log(`Hello ${myArray}`);

// Async/Await?

// Operators
console.log(1 + 2);

// Function
function aFunc() {
    let a = 4;
    return a;
}
