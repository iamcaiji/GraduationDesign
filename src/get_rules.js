const fs = require("fs");

var data = fs.readFileSync('rules.txt');
var text = data.toString();

var array = []
array = text.split('\r\n')
var relationship = []

array.forEach(element => {
    let a = element.split(' ')
    let b = []
    for (var i = 0; i < a.length; ++ i) {
        if (!(a[i] == '' || a[i] == '->')) {
            b.push(a[i])
        } 
    }
    relationship.push(b)
})
console.log(relationship)