// document.write('<script type="text/javascript" src="./test2.js"></script>')
// window.alert("kkkkkk")
// var a = 10

// import {foo} from './test2.js'

// foo()

class Tree {
    constructor(level, text, father) {
        this.level = level
        this.text = text
        this.val = ""
        this.type = ""
        this.code = ""
        this.child_list = []
        this.tree_list = []
        this.child_cnt = 0
        this.father_node = father

        this.returnVal = null
    }
}

// 采用栈式和引用链的形式
class Variables {
    constructor() {
        this.type = []
        this.name = []
        this.val = []
        this.r1 = [] //保存函数的时候，保存其返回类型
        this.r2 = null // 保存函数的时候，保存其参数数组
        this.father = null
    }

    push(type, name, val, r1, r2) {
        this.type.push(type)
        this.name.push(name)
        this.val.push(val)
        this.r1.push(r1)
        this.r2 = r2
    }
}

var text //输入的源代码
var tokenArray, tokenArrayMark
var grammaUsed = []
var grammaAnalysisSuccess = false
var start = ["Program"]
var relationship = []
var root = new Tree(-1, "Program", null)
var index = 0
var isFinished = false
var cnt = 0
var globalVariable = new Variables()

function getTokens(text) {
    const keywords = ["int", "double", "let", "void", "char", "string", "short", "float", "long",
                "+", "-", "*", "/", "^", "%", "=", "==", "!=", ",", ";", "\'", "\"", "+=", "-=", "*=", "/=",
                "{", "}", "[", "]", "(", ")", ".", ":", "->", "++", "--", "!", "~", "&", "<<", ">>", "<", ">",
                "<=", ">=", "|", "||", "&&", "?", ":","main",
                "auto", "register", "stack", "const", "volatile", "extern", "bool", "true", "false",
                "class", "public", "private", "protected", "friend", "mutable", "explicit", "this", "virtual",
                "template", "typename", "inline", "new", "delete", "try", "catch", "throw",
                "if", "else", "switch", "case", "default", "for", "while", "do", "return", "continue", "break",
                "const", "goto", "struct", "typedef", "sizeof", "signed", "unsigned", "enum", "operator", "using"];

    const operators = ["+", "-", "*", "/", "^", "%", "=", "==", "!=", ",", ";", "\'", "\"", "+=", "-=", "*=", "/=",
                    "{", "}", "[", "]", "(", ")", ".", ":", "->", "++", "--", "!", "~", "&", "<<", ">>", "<", ">",
                    "<=", ">=", "|", "||", "&&", "?", ":"];

    // console.log(keywords);

    //使用数组代替栈
    var codeStack = []
    tokenArray = []
    tokenArrayMark = []

    //词法分析阶段
    for (var i = 0; i < text.length; ++ i) {
        let ch = text.charAt(i);
        if (ch == '\n') {
            console.log("\\n")
        } else if (ch == '\t') {
            console.log('\\t')
        } else if (ch == '\r') {
            console.log('\\r')
        } else {
            console.log(ch)
        }
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
                keywords.includes(str) ? tokenArrayMark.push(str) : tokenArrayMark.push("id")
                // console.log(str, "===", str.length)
            }
        }

        //如果在栈的顶部已经发现了运算符(+ += - -=),要注意区分
        else if (operators.includes(ch)) {
            //如果是.的情况
            if (ch == '.') {
                continue
            }

            if (ch == "\"") {
                let temp = "\""
                ++ i
                while(!(text.charAt(i) == "\"" && text.charAt(i - 1) != "\\")) {
                    if (text.charAt(i) == "\\") {

                    } else {
                        temp += text.charAt(i)
                    }
                    ++ i
                }
                temp += "\""
                tokenArray.push(temp);
                tokenArrayMark.push("id");
                codeStack = []
                continue
            }

            if (ch == "\'") {
                let temp = "\'"
                ++ i
                while(!(text.charAt(i) == "\'" && text.charAt(i - 1) != "\\")) {
                    if (text.charAt(i) == "\\") {

                    } else {
                        temp += text.charAt(i)
                    }
                    ++ i
                }
                temp += "\'"
                tokenArray.push(temp);
                tokenArrayMark.push("id");
                codeStack = []
                continue
            }

            let str = codeStack.join('');

            //如果是+=的情况
            if (i + 1 < text.length && operators.includes(ch + text.charAt(i + 1))) {
                if (str.length > 1) {
                    tokenArray.push(str.substr(0, str.length - 1));
                    keywords.includes(str.substr(0, str.length - 1)) ? tokenArrayMark.push(str.substr(0, str.length - 1)) : tokenArrayMark.push("id");
                }
                tokenArray.push(ch + text.charAt(i + 1));
                tokenArrayMark.push(ch + text.charAt(i + 1));
                codeStack = []
                ++ i;
            }

            //如果是+的情况
            else if (keywords.includes(ch)) {
                if (str.length > 1) {
                    tokenArray.push(str.substr(0, str.length - 1));
                    keywords.includes(str.substr(0, str.length - 1)) ? tokenArrayMark.push(str.substr(0, str.length - 1)) : tokenArrayMark.push("id");
                }
                tokenArray.push(ch);
                tokenArrayMark.push(ch);
                codeStack = []
            }


            //还有一种情况是getchar，这个暂时不用处理，因为不知道这个是一个id还是一个关键字

            //以下是一些特殊情况
            //比如遇到的keyword是 双引号 “ 或者 单引号 ‘ 直接将其
            
        }
    }

    //for 循坏结束后清空数组
    if (codeStack.length != 0) {
        tokenArray.push(codeStack.join(''))
        keywords.includes(codeStack.join('')) ? tokenArrayMark.push(codeStack.join('')) : tokenArrayMark.push('id')
    }
    console.log(tokenArray.length, tokenArrayMark.length)
    codeStack = []

    //特殊标记arrayname
    for (var i = tokenArrayMark.length - 1; i >= 0; -- i) {
        if (tokenArrayMark[i] == "[") {
            if (i >= 0 && tokenArrayMark[i - 1] == "id"){
                tokenArrayMark[i - 1] = "arrayname"
            }
        }
    }

    var tokenData = ""
    for (var k = 0; k < tokenArray.length; ++ k) {
        tokenData += "[" + tokenArrayMark[k] + "," + tokenArray[k] + "]" + "\n";
    }
    
    _tokenArray = tokenArray
    _tokenArrayMark = tokenArrayMark
    console.log(tokenData)

}

function grammaAnalysis() {
    find(start, tokenArrayMark)
}

function find(array1, array2) {
    if (grammaAnalysisSuccess) return
    if (array1.length == array2.length) {
        var i = 0
        var isEqual = true
        for (; i < start.length; ++ i) {
            if (array1[i] != array2[i]) {
                isEqual = false
                break
            }
        }
        if (isEqual) {
            // 语法分析成功
            grammaAnalysisSuccess = true
            console.log("语法树构建完成......")
        }
    }

    let index = findTheFirstIndexNotSame(array1, array2)
    // console.log("index:", index)
    let hasBeenUsedRelationship = []
    let canFind = false
    for (var j = 0; j < relationship.length; ++ j) {
        //找到合适的文法的情况
        if (!hasBeenUsedRelationship.includes(j) && relationship[j][0] == array1[index]) {
            canFind = true
            let cmd = relationship[j].length - 2
            if (cmd == 0) {
                if (relationship[j][1] != "null") {
                    array1[index] = relationship[j][1]
                }
                else {
                    for (let k = index; k + 1 < array1.length; ++ k) {
                        array1[k] = array1[k + 1]
                    }
                    array1.pop()
                }
            }
            else {
                for (let k = 0; k < cmd; ++ k) {
                    array1.push(" ")
                }
                for (let k = array1.length - 1; k >= index + 1 + cmd; -- k) {
                    //k - cmd >= index + 1
                    array1[k] = array1[k - cmd]
                }
                for (let k = 0; k <= cmd; ++ k) {
                    array1[k + index] = relationship[j][k + 1]
                }
            }
            let arr = []
            for (let i = 0; i < relationship[j].length; ++ i) {
                arr.push(relationship[j][i])
            }
            grammaUsed.push(arr)
            // console.log("change", array1.join(' '))
            hasBeenUsedRelationship.push(j)
            find(array1, array2)
            if (grammaAnalysisSuccess) return 
            //return之后的操作，即要把所有的操作都复原
            if (cmd == 0) {
                if (relationship[j][1] != "null") {
                    array1[index] = relationship[j][0]
                }
                else {
                    array1.push(" ")
                    for (let k = array1.length - 1; k - 1 >= index; -- k) {
                        array1[k] = array1[k - 1]
                    }
                    array1[index] = relationship[j][0]
                }
            }
            else {
                array1[index] = relationship[j][0]
                for (let k = index + 1; k + cmd < array1.length; ++ k) {
                    array1[k] = array1[k + cmd]
                }
                for (let k = 0; k < cmd; ++ k) {
                    array1.pop()
                }
            }
            grammaUsed.pop()
            // console.log("resize", array1.join(' '))
        }
    }
    if (!canFind) {
        // console.log("return")
        return 
    }
}

function findTheFirstIndexNotSame(a, b) {
    for (let i = 0; i < a.length; ++ i) {
        if (a[i] != b[i]) {
            return i
        }
    }
    return a.length
}

function getRules() {
    // var array = text.split('\n')

    var array = [
            "Statements -> null",
            "Program -> Function Functions",
            "Functions -> Function Functions",
            "Function -> Statement Statements",
            "Functions -> null",
            "Function -> Type main ( AllParams ) Block",
            "Function -> Type id ( AllParams ) Block",
            "AllParams -> null",
            "AllParams -> Param Params",
            "Params -> , Param Params",
            "Params -> null",
            "Param -> Type id",
            "Param -> id",
            "Param -> Type arrayname [ ]",
            "Param -> arrayname [ ]",
            "Type -> int",
            "Type -> let",
            "Block -> { Statements }",
            "Statements -> Statement Statements",
            "Statement -> LocalVarDecl",
            "Statement -> AssignStmt",
            "Statement -> ReturnStmt",
            "Statement -> IfStmt",
            "Statement -> ForStmt",
            "Statement -> FunctionCallStmt",
            "Statement -> BoolStmt",
            "IfStmt -> if ( BoolStmt ) Block",
            "AssignStmt -> ++ id ;",
            "AssignStmt -> -- id ;",
            "AssignStmt -> id ++ ;",
            "AssignStmt -> id -- ;",
            "AssignStmt -> ++ id",
            "AssignStmt -> -- id",
            "AssignStmt -> id ++",
            "AssignStmt -> id --",
            "BoolStmt -> BoolV CompareSign BoolV",
            "BoolV -> id", 
            "BoolV -> Array",
            "CompareSign -> >",
            "CompareSign -> <",
            "CompareSign -> >=",
            "CompareSign -> <=",
            "CompareSign -> ==",
            "CompareSign -> !=",
            "Expression -> ( Expression )",
            "Expression -> id",
            "LocalVarDecl -> Type id ;",
            "LocalVarDecl -> Type id = id ;",
            "LocalVarDecl -> Type id = Expression ;",
            "LocalVarDecl -> Type id" ,
            "LocalVarDecl -> Type id = id", 
            "LocalVarDecl -> Type id = Expression", 
            "LocalVarDecl -> Type id = FunctionCallStmt",
            "LocalVarDecl -> Type Array = ArrayInit ;",
            "Array -> arrayname Arrs",
            "Arrs -> [ id ] Arrs",
            "Arrs -> null", 
            "ArrayInit -> { ids }",
            "ids -> id ids",
            "ids -> , id ids",
            "ids -> null",
            "AssignStmt -> id = Expression ;",
            "ReturnStmt -> return Expression ;",
            "ReturnStmt -> return FunctionCallStmt",
            "ForStmt -> for ( LocalVarDecl ; BoolStmt ; Statement ) Block",
            "FunctionCallStmt -> id ( AllParams ) ;"
    ] 

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
    // console.log(relationship)

    //语法的分析的过程其实就是从Program（开始标志）出发，使用文法规则，变成程序的模样即是符合语法的程序
    grammaAnalysis();
}

function buildTree(root, arr) {
    if (index >= arr.length) {
        isFinished = true
        return 
    }
    if (root.text == arr[index][0]) {
        ++ index
        // console.log(arr[index - 1].join(''))
        //进行特殊情况判断， a -> null
        // if (arr[index - 1][1] == "null") {
        //     root = null
        //     return 
        // }
        root.child_list = arr[index - 1].slice(1)
        root.child_cnt = root.child_list.length
        for (let i = 0; i < root.child_list.length; ++ i) {
            let temp = new Tree(root.level + 1, root.child_list[i], root)
            root.tree_list.push(temp)
            buildTree(temp, arr)
            if (isFinished) {
                return 
            }
        }
    } 
    else {
        root = null
        return
    }
}

//优化并将获得的词法值赋值到节点的val属性上
function optim(root) {
    if (root.text == "null") {
        var index = -1
        while(root.father_node != null && root.father_node.child_cnt == 1) {
            root.father_node.text = "null"
            var temp = root.father_node
            root = null
            root = temp
            for (var i = 0; i < root.father_node.child_cnt; ++ i) {
                if (root.father_node.child_cnt[i] == root.text) {
                    index = i;
                    root.father_node.child_list[index] = "null"
                    root.father_node.tree_list[index] = null
                }
            }
            // console.log(root.father_node.child_list, root.text, index)
        }
        return 
    }
    if (root.child_cnt != 0) {
        for (let i = 0; i < root.child_cnt; ++ i) {
            optim(root.tree_list[i])
        }
    } else {
      root.val = tokenArray[cnt]
      ++ cnt  
    //   console.log(root.text, token.tokenArray[cnt - 1])
    }
}

function printTree(root) {
    //层次遍历，使用queue
    let arr = []
    arr.push(root)
    let cnt = arr.length
    let index = 0
    let str = ""
    while(arr.length != 0) {
        ++ index
        var temp = arr.shift()
        if (temp != null) {
            str += temp.text + " "
            for (let i = 0; i < temp.tree_list.length; ++ i) {
                if (temp.tree_list[i] != null) {
                    arr.push(temp.tree_list[i])
                }
            }  
        }
        else {
            // str += "null"
        }
        if (index >= cnt) {
            index = 0
            cnt = arr.length
            console.log(str)
            str = ""
        }
    }
}

var statementGroup = ["LocalVarDecl", "AssignStmt", "ReturnStmt", "IfStmt", "ForStmt", "FunctionCallStmt", "BoolStmt", "Function"]
var str = ""
function preOrderTravelsal(root) {
    if (statementGroup.includes(root.text)) {
        console.log(root.text)
    }
    if (root.child_cnt == 0) {
        return 
    }
    for (var i = 0; i < root.child_cnt; ++ i) {
        preOrderTravelsal(root.tree_list[i])
    }
}

function postOrderTravelsal(root) {
    str += "("
    for (var i = 0; i < root.child_cnt; ++ i) {
        postOrderTravelsal(root.tree_list[i])
    }
    if (root.text != "null") {
        console.log(root.text, tokenArray[cnt])
        str += root.text + " "
        ++ cnt
    }
    str += ")"
    if (root.child_cnt == 0) {
        return 
    }
}

function calculateExp(root) {
    //采用后序遍历
    for (let i = 0; i < root.child_cnt; ++ i) {
        calculateExp(root.tree_list[i])
    }

    if (root.child_list[1] == "+") {
        root.val = root.tree_list[0].val + root.tree_list[2].val
    }
    if (root.child_list[1] == "-") {
        root.val = root.tree_list[0].val - root.tree_list[2].val
    }
    if (root.child_list[1] == "*") {
        root.val = root.tree_list[0].val * root.tree_list[2].val
    }
    if (root.child_list[1] == "/") {
        root.val = root.tree_list[0].val / root.tree_list[2].val
    }
    if (root.child_list[1] == "%") {
        root.val = root.tree_list[0].val % root.tree_list[2].val
    }
    if (root.child_list[0] == "(" && root.child_list[2] == ")") {
        root.val = root.tree_list[1].val
    }
}

function getValFromVariableById(variable, id) {
    for (let i = 0; i < variable.name.length; ++ i) {
        if (variable.name[i] == id) {
            return [variable.type[i], variable.name[i], variable.val[i], variable.r1[i], variable.r2]
        }
    }
    while(variable.father != null) {
        return getValFromVariableById(variable.father, id)
    }
    return null
}

function setValFromVariableById(variable, id, val) {
    // console.log("setValFromVariableById", variable, id, val)
    for (let i = 0; i < variable.name.length; ++ i) {
        if (variable.name[i] == id) {
            variable.val[i] = val
            return
        }
    }
    while(variable.father != null) {
        setValFromVariableById(variable.father, variable. id)
        return 
    }
    return
}

// 赋值语句具体实现
function Assign(leftNode, rightNode, variable) {
    if (rightNode.text == "id") {
        let v = getValFromVariableById(variable, rightNode.val) 
        setValFromVariableById(variable, leftNode.val, v[2])
    } else if (rightNode.text == "Expression") {
        calculateExp(rightNode)
        let v = rightNode.val
        setValFromVariableById(variable, leftNode.val, v[2]) 
    }
}

//只针对 ++id 和 --id
function AssignOne(leftNode, rightNode, variable) {
    // console.log("AssignOne")
    if (leftNode.text == "--") {
        let v = getValFromVariableById(variable, rightNode.val) 
        let result = (v[2] - 1) + ""
        setValFromVariableById(variable, rightNode.val, result)
    } else {
        let v = getValFromVariableById(variable, rightNode.val) 
        // console.log(rightNode.val, v)
        let result = (stringToNumber(v[2]) + 1) + ""
        setValFromVariableById(variable, rightNode.val, result)
        // console.log(rightNode.val, result)
    }
}

// 获取函数的参数
// AllParams -> null
// AllParams -> Param Params
// Params -> , Param Params
// Params -> null
// Param -> Type id
// Param -> id

function getFunctionCallAllParamsRecursion(root, array) {
    if (root.text == "id") {
        array.push(root.val)
    }
    for (let i = 0; i < root.child_cnt; ++ i) {
        getFunctionCallAllParamsRecursion(root.tree_list[i], array)
    }
}

function getFunctionCallAllParams(root) {
    result = []
    for (let i = 0; i < root.child_cnt; ++ i) {
        getFunctionCallAllParamsRecursion(root.tree_list[i], result)
    }
    return result
}

// 函数参数的 文法
// Param -> Type id
// Param -> id
// Param -> Type arrayname [ ]
// Param -> arrayname [ ]
function getFunctionAllParamsRecursion(root, array) {
    if (root.text == "Param") {
        var a
        if(root.child_cnt == 1) {
            a = [undefined, root.tree_list[i].val]
        } else if (root.child_cnt == 2) {
            a = [root.tree_list[0].tree_list[0].val, root.tree_list[1].val]
        } else if (root.child_cnt == 3) {
            a = ["array", root.tree_list[0].val, undefined]
        } else if (root.child_cnt == 4) {
            a = ["array", root.tree_list[1].val, root.tree_list[0].tree_list[0].val]
        }
        array.push(a)
        return 
    }
    for (let i = 0; i < root.child_cnt; ++ i) {
        getFunctionAllParamsRecursion(root.tree_list[i], array)
    }
}

function getFunctionAllParams(root) {
    result = []
    for (let i = 0; i < root.child_cnt; ++ i) {
        getFunctionAllParamsRecursion(root.tree_list[i], result)
    }
    return result
}

function isNumber(params) {
    var pointCnt = 0
    for (let i = 0; i < params.length; ++ i) {
        if (params.charAt(i) == '.') {
            pointCnt += 1
            if (pointCnt > 1) {
                return false
            }
            continue
        } else if (params.charAt(i) == '-') {
            if (i == 0) {
                continue
            }
            else {
                return false
            }
        } else if (params.charAt(i) > '9' || params.charAt(i) < '0') {
            return false
        }
    }
    return true
}

//函数调用具体实现
function exeFunctionCall(root, funcName, fv, variable) {
    // 获取函数名的值
    var fnVal = getValFromVariableById(variable, funcName)
    var str = ""
    if ((fnVal != null && fnVal[2] == "console.log") || (fnVal == null && funcName == "console.log")) {
        for (let i = 0; i < fv.length; ++ i) {
            if (isNumber(fv[i])) {
                str += (fv[i] + "")
            } else {
                let ss = fv[i].length
                // 如果这个值是字符串
                if (ss >= 2 && fv[i][0] == "\"" && fv[i][ss - 1] == "\"") {
                    str += fv[i].substr(1, ss - 2)
                }
                else if (ss >= 2 && fv[i][0] == "\'" && fv[i][ss - 1] == "\'") {
                    str += fv[i].substr(1, ss - 2)
                }
                var tt = getValFromVariableById(variable, fv[i])
                if (tt != null) {
                    str += tt[2]
                } 
            }
            if (i != fv.length - 1) {
                str += " "
            }
        }
        console.log(str)
    }

    if ((fnVal != null && fnVal[2] == "window.alert") || (fnVal == null && funcName == "window.alert")) {
        // console.log("这是window.alert")
        for (let i = 0; i < fv.length; ++ i) {
            if (isNumber(fv[i])) {
                console.log("这是数字", fv[i])
                str += (fv[i] + "")
            } else {
                let ss = fv[i].length
                // 如果这个值是字符串
                if (ss >= 2 && fv[i][0] == "\"" && fv[i][ss - 1] == "\"") {
                    str += fv[i].substr(1, ss - 2)
                }
                else if (ss >= 2 && fv[i][0] == "\'" && fv[i][ss - 1] == "\'") {
                    str += fv[i].substr(1, ss - 2)
                }
                var tt = getValFromVariableById(variable, fv[i])
                if (tt != null) {
                    str += tt[2]
                } 
            }
            if (i != fv.length - 1) {
                str += " "
            }
        }
        window.alert(str)
    }

    // 证明需要执行自己定义的函数
    if (fnVal != null && fnVal[0] == "function") {
        var tempVariable = new Variables()
        tempVariable.father = variable
        // console.log("111", fnVal)
        //要把函数的函数放到新建的符号表中
        for (let i = 0; i < fnVal[4].length; ++ i) {
            //一些特殊一点的参数，比如数组
            if (fnVal[4][i][0] == "array") {
                var result = getValFromVariableById(variable, fv[i]) 
                if (result[0] == "array") {
                  tempVariable.push("array", fnVal[4][i][1], result[2], fnVal[4][i][2])  
                  console.log("variable.push", "array", fnVal[4][i][1], result[2], fnVal[4][i][2])
                }
            }
            // 如果参数直接是数字
            else if (isNumber(fv[i])) {
                var result = getValFromVariableById(variable, fv[i])
                tempVariable.push(fnVal[4][i][0], fnVal[4][i][1], stringToNumber(fv[i]))
                console.log("variable.push", fnVal[4][i][0], fnVal[4][i][1], stringToNumber(fv[i]))
            }
            else {
                var result = getValFromVariableById(variable, fv[i])
                tempVariable.push(fnVal[4][i][0], fnVal[4][i][1], result[2])
                console.log("variable.push", fnVal[4][i][0], fnVal[4][i][1], result[2])
            }
        }
        // console.log(fnVal[2].tree_list[5])
        // Function -> Type id ( AllParams ) Block
        preOrderTravelsalAnalysis(fnVal[2].tree_list[5], tempVariable)
    }

    //在符号表中找不到这个函数名，fnVal会返回null
    if (fnVal == null) {
        if (funcName == "javascript.JSON.parse" && fv.length == 1) {
            root.returnVal = JSON.parse(fv[0].substr(1, fv[0].length - 2))
            // console.log(returnResult)
        }
        //TODO
    }

    // console.log(fnVal)
}

// 处理布尔表达式
function execBoolStmt(variable, root) {
    console.log("正在执行BoolStmt")
    var a, b
    if (root.tree_list[0].tree_list[0].text == "id") {
        a = root.tree_list[0].tree_list[0].val
    } else {
        var array_root = root.tree_list[0].tree_list[0]
        var array_number = []
        getArrayInitNumber(array_root.tree_list[1], array_number)
        var name = array_root.tree_list[0].val
        console.log(name, array_number)

        // 一维数组
        if (array_number.length == 1) {
            let result = getValFromVariableById(variable, name)
            console.log(result)
            if (isNumber(array_number[0])) {
                a = result[2][stringToNumber(array_number[0])]
                console.log(a)
            } else {
                a = result[2][array_number[0]]
                console.log(a)
            }
        }
    }
    if (root.tree_list[2].tree_list[0].text == "id") {
        b = root.tree_list[2].tree_list[0].val
    } else {
        var array_root = root.tree_list[2].tree_list[0]
        var array_number = []
        getArrayInitNumber(array_root.tree_list[1], array_number)
        var name = array_root.tree_list[0].val
        console.log(name, array_number)

        // 一维数组
        if (array_number.length == 1) {
            let result = getValFromVariableById(variable, name)
            console.log(result)
            if (isNumber(array_number[0])) {
                b = result[2].height
                console.log(b)
            } else {
                b = result[2].height
                console.log(b)
            }
        }
    }
    console.log(a, b)
    if (a == b) {
        root.val = "true"
        return
    }
    if (!isNumber(a)) {
        let result = getValFromVariableById(variable, a)
        a = result[2]
    } 
    if (!isNumber(b)) {
        let result = getValFromVariableById(variable, b)   
        b = result[2]
    } 
    if (isNumber(a) && isNumber(b)) {
        let aa = stringToNumber(a)
        let bb = stringToNumber(b)
        console.log("BoolStmt的两个数", aa, bb)
        if (root.tree_list[1].child_list[0] == "<") {
            if (aa < bb) {
                root.val = "true"
            } else {
                root.val = "false"
            }
        }
        if (root.tree_list[1].child_list[0] == ">") {
            if (aa > bb) {
                root.val = "true"
            } else {
                root.val = "false"
            }
        }
        if (root.tree_list[1].child_list[0] == "<=") {
            if (aa <= bb) {
                root.val = "true"
            } else {
                root.val = "false"
            }
        }
        if (root.tree_list[1].child_list[0] == ">=") {
            if (aa >= bb) {
                root.val = "true"
            } else {
                root.val = "false"
            }
        }
        if (root.tree_list[1].child_list[0] == "==") {
            if (aa == bb) {
                root.val = "true"
            } else {
                root.val = "false"
            }
        }
        if (root.tree_list[1].child_list[0] == "!=") {
            if (aa != bb) {
                root.val = "true"
            } else {
                root.val = "false"
            }
        }
    } else {
        if (a == b) {
            root.val = "true"
        } else {
            root.val = "false"
        }
    }
}

//将字符串转换成数字
function stringToNumber(params) {
    var result = params * 1
    return result
}

// 获取数组定义时 [] 里面的数字 ，返回一个数组， 比如二维数组的话返回数组的length就为2
function getArrayInitNumber(params, result) {
    if (params.text == "id") {
        result.push(params.val)
        return 
    }
    for (let i = 0; i < params.child_cnt; ++ i) {
        getArrayInitNumber(params.tree_list[i], result)
    }
}

function preOrderTravelsalAnalysis(root, variable) {
    var top = variable
    // 前序主要考虑 明确嵌套层数、变量定义等内容
    if (root.text == "Function") {
        // 属于 Function -> Statement 类型
        if (root.child_cnt <= 2) {
            
        }
        // 属于正常的函数类型，即真正的Function
        if (root.child_cnt > 2) {
            // 获取函数的全部参数
            var allParams = getFunctionAllParams(root.tree_list[3])
            
            // main函数,需要执行
            if (root.tree_list[1].val == "main") {
                console.log("读取到main函数, 函数参数为", allParams)
                var tempVariable = new Variables()
                tempVariable.father = variable
                top = tempVariable
                
            }

            // 其他定义的函数
            else {
                let type = root.tree_list[0].child_list[0]
                let funcName = root.tree_list[1].val
                // console.log("读取到函数", type, funcName, "函数参数", allParams)
                
                globalVariable.push("function", funcName, root, type, allParams)
                console.log("globalVariable.push", "function", funcName, type, allParams)

                //返回，不继续执行，程序运行的时候再执行
                return 
            }
        }
    }

    //For语句
    if (root.text == "ForStmt") {
        console.log("正在执行for语句")
        var tempVariable = new Variables()
        tempVariable.father = variable

        preOrderTravelsalAnalysis(root.tree_list[2], tempVariable)
        
        while(true) {
            preOrderTravelsalAnalysis(root.tree_list[4], tempVariable)
            if (root.tree_list[4].val == "false") {
                break
            }  
            // 执行Block的子节点
            preOrderTravelsalAnalysis(root.tree_list[8], tempVariable)
            preOrderTravelsalAnalysis(root.tree_list[6], tempVariable)
        }
        return
    }

    //If语句
    if (root.text == "IfStmt") {
        console.log("正在执行IF语句")
        var tempVariable = new Variables()
        tempVariable.father = variable

        preOrderTravelsalAnalysis(root.tree_list[2], tempVariable)

        if (root.tree_list[2].val == "true") {
            preOrderTravelsalAnalysis(root.tree_list[4], tempVariable)
        }

        return 
    }

    //Bool表达式
    if (root.text == "BoolStmt") {
        //id op id 
        execBoolStmt(variable, root)
        return
    }

    //函数调用语句，需要明确调用的函数，参数
    if (root.text == "FunctionCallStmt") {
        // FunctionCallStmt -> id ( AllParams ) ;
        //获取参数数组
        let fv = getFunctionCallAllParams(root.tree_list[2])
        console.log("正在执行函数调用,函数名是", root.tree_list[0].val, "参数数组是", fv)
        //定义一个返回的参数
        exeFunctionCall(root, root.tree_list[0].val, fv, variable)
        if (root.returnVal != null) {
            console.log("函数返回", root.returnVal)
        }

        //如果是变量定义语句中的函数调用，可以直接返回
        if (root.father != null && root.father.text == "LocalVarDecl") {
            return
        }
    }

    //声明变量的语句
    if (root.text == "LocalVarDecl") {
        var type = root.tree_list[0].tree_list[0].text;
        var id = root.tree_list[1].val;
        console.log("正在执行[LocalVarDecl]", type, id, root.child_list)
        // LocalVarDecl -> Type id || LocalVarDecl -> Type id ;
        if (root.child_cnt == 2 || root.child_cnt == 3) {
             variable.push(type, id, undefined, undefined)
             console.log("variable.push", type, id)
        } 
        // LocalVarDecl -> Type id = id ;
        else if (root.child_list[3] == "id") {
            variable.push(type, id, root.tree_list[3].val, undefined)
            console.log("variable.push", type, id, root.tree_list[3].val)
        }
        //LocalVarDecl -> Type id = Expression ;
        else if (root.child_list[3] == "Expression"){
            calculateExp(root.tree_list[3])
            variable.push(type, id, root.tree_list[3].val, undefined)
            console.log("variable.push", type, id, root.tree_list[3].val)
        }
        // LocalVarDecl -> Type id = FunctionCallStmt
        else if (root.child_list[3] == "FunctionCallStmt") {
            preOrderTravelsalAnalysis(root.tree_list[3], variable)
            variable.push(type, id, root.tree_list[3].returnVal, undefined)
            console.log("variable.push", type, id, root.tree_list[3].returnVal)
        }
        // 数组
        else if (root.child_list[1] == "Array") {
            id = root.tree_list[1].tree_list[0].val
    
            var array_numer = []
            getArrayInitNumber(root.tree_list[1], array_numer)

            var init_number = []
            getArrayInitNumber(root.tree_list[3], init_number)

            console.log("获得数组名", id, "数组大小", array_numer, "初始化内容", init_number)
            
            //一维数组
            if (array_numer.length == 1) {
                let size = stringToNumber(array_numer[0])
                var _array = []
                if (type == "int") {
                    for (let i = 0; i < size; ++ i) {
                        if (i < init_number.length) {
                            _array.push(stringToNumber(init_number[i]))
                        } else {
                            _array.push(0)
                        }
                    }
                } 
                else if (type == "string" || type == "let") {
                    for (let i = 0; i < size; ++ i) {
                        if (i < init_number.length) {
                            _array.push(init_number[i])
                        } else {
                            _array.push("")
                        }
                    }
                }
                variable.push("array", id, _array, type)
                console.log("variable.push", "array", id, _array, type)
            }  
        }
        return 
    }

    //赋值语句
    if (root.text == "AssignStmt") {
        // id = id; or id = Exp ;
       if (root.child_list[1] == "=") {
           Assign(root.tree_list[0], root.tree_list[2], variable)
       } else {
           AssignOne(root.tree_list[0], root.tree_list[1], variable)  
       }
    }

    //递归主体For循环
    for (var i = 0; i < root.child_cnt; ++ i) {
        preOrderTravelsalAnalysis(root.tree_list[i], top)
    }
}

function resetGlobalVariables() {
    text = "" //输入的源代码
    tokenArray = []
    tokenArrayMark = []
    grammaUsed = []
    grammaAnalysisSuccess = false
    start = ["Program"]
    relationship = []
    root = new Tree(-1, "Program", null)
    index = 0
    isFinished = false
    cnt = 0
    globalVariable = new Variables()
}

function read () {
    resetGlobalVariables()
    // window.alert(document.getElementById('input').value)

    text = document.getElementById('input').value

    //词法分析
    getTokens(text)

    // 获取语义规则并进行语法分析
    // var rules = document.getElementById('inputa').value
    getRules()

    //建立语法树
    buildTree(root, grammaUsed)
    optim(root)
    printTree(root)
    // preOrderTravelsal(root, 0)
    // postOrderTravelsalAnalysis(root)

    //执行语句
    preOrderTravelsalAnalysis(root, globalVariable)

    //执行完成之后把所有的全局变量恢复
    resetGlobalVariables()
}
