const fs = require("fs");
const { arch } = require("os");

//read codes
// fs.readFile('test.txt', function (err, data) {
//     if (err) {
//         return console.error(err);
//     }
//     console.log("异步读取: " + data.toString());
//  });

var data = fs.readFileSync('test.txt');
var text = data.toString();
// console.log("同步读取: " + data.toString());

const keywords = ["int", "double", "var", "let", "void", "char", "string",
                "+", "-", "*", "/", "^", "%", "=", "==", ",", ";", "\'", "\"", "+=", "-=", "*=", "/=",
                "{", "}", "[", "]", "(", ")", ".", ":",
                "getchar", "putchar", "printf", "main"];

const breakwords = ["+", "-", "*", "/", "^", "%", "=", "==", ",", ";", "\'", "\"", "+=", "-=", "*=", "/=",
                "{", "}", "[", "]", "(", ")", ".", ":"];

// console.log(keywords);

//使用数组代替栈
var codeStack = []
var tokenArray = []
var tokenArrayMark = []

//词法分析阶段
for (var i = 0; i < text.length; ++ i) {
    let ch = text.charAt(i);
    codeStack.push(ch);

    //检查是否属于注释
    if (ch == '/') {
        if (i + 1 < text.length && text.charAt(i + 1) == '*') {
            codeStack.pop();
            i += 2;
            while(i + 1 < text.length) {
                if (text.charAt(i) == '*' && text.charAt(i + 1) == '/') {
                    ++ i;
                    break;
                }
                ++ i;
            }
        } 
        else if (i + 1 < text.length && text.charAt(i + 1) == '/') {
            codeStack.pop();
            i += 2;
            while(i + 1 < text.length && text.charAt(i) != '\r') {
                ++ i;
            }
            //因为下一个字符\n，所以可以直接忽略
            ++ i;
        }
    }

    //如果当前字符是空格或者缩进
    else if (ch == ' ' || ch == '\t' || ch == '\r' || ch == '\n') {
        codeStack.pop();
        var str = codeStack.join('')
        codeStack= [];

        if (str != '') {
            tokenArray.push(str)
            keywords.includes(str) ? tokenArrayMark.push(0) : tokenArrayMark.push(1)
            // console.log(str, "===", str.length)
        }
    }

    //如果在栈的顶部已经发现了运算符(+ += - -=),要注意区分
    else if (breakwords.includes(ch)) {
        let str = codeStack.join('');

        //如果是+=的情况
        if (i + 1 < text.length && breakwords.includes(ch + text.charAt(i + 1))) {
            if (str.length > 1) {
                tokenArray.push(str.substr(0, str.length - 1));
                keywords.includes(str.substr(0, str.length - 1)) ? tokenArrayMark.push(0) : tokenArrayMark.push(1);
            }
            tokenArray.push(ch + text.charAt(i + 1));
            tokenArrayMark.push(0);
            codeStack = []
            ++ i;
        }

        //如果是+的情况
        else if (keywords.includes(ch)) {
            if (str.length > 1) {
                tokenArray.push(str.substr(0, str.length - 1));
                keywords.includes(str.substr(0, str.length - 1)) ? tokenArrayMark.push(0) : tokenArrayMark.push(1);
            }
            tokenArray.push(ch);
            tokenArrayMark.push(0);
            codeStack = []
        }

        //还有一种情况是getchar，这个暂时不用处理，因为不知道这个是一个id还是一个关键字
    }
}

//for 循坏结束后清空数组
if (codeStack.length != 0) {
    tokenArray.push(codeStack.join(''))
    keywords.includes(codeStack.toString()) ? tokenArrayMark.push(0) : tokenArrayMark.push(1)
}
console.log(tokenArray.length, tokenArrayMark.length)
codeStack = []

for (var k = 0; k < tokenArray.length; ++ k) {
    console.log(tokenArray[k], "=====", tokenArrayMark[k])
}



