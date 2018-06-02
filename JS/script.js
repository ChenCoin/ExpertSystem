// 全局变量
var start = false;
var data;
var ItemSelect = NaN;
var ConditionNum = 0;
var PageCancel = function () { };
var PageConfirm = function () { };


// 按钮事件
function database() {
    document.getElementById("database").style.textDecoration = "underline";
    document.getElementById("reason").style.textDecoration = "none";
    $("#databasebtn").show();
    afterRead();
}

function reason() {
    document.getElementById("database").style.textDecoration = "none";
    document.getElementById("reason").style.textDecoration = "underline";
    $("#databasebtn").hide();
    reasonView();
}

function reasonView() {
    var rules = data.rules;
    var txt = "<button onClick=\"ReasonData()\" class=\"btn btn-default btn-sm\">推理</button>";
    var allCondition = [];

    rules.forEach(function (item, index, input) {
        var conditions = item.condition;
        for (var i = 0; i < conditions.length; i++) {
            var exist = false;
            for (var j = 0; j < allCondition.length; j++) {
                if (conditions[i] == allCondition[j]) exist = true;
            }
            if (!exist) allCondition[allCondition.length] = conditions[i];
        }
    })

    allCondition.forEach(function (item, index, input) {
        txt += "<div class=\"checkbox\">";
        txt += "<label><input name=\"condition\" type=\"checkbox\" value=\"" + item + "\">" + item + "</label>";
        txt += "</div>";
    })

    $("#context").remove();
    txt = "<div id=\"context\">" + txt + "</div>";
    $("#view").append(txt);
    RadioInit();
}

function ReasonData() {
    var conditions = document.getElementsByName('condition');
    var cond = [];
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i].checked) cond[cond.length] = conditions[i].value;
    }
    var condUsed = cond.slice();
    var end = [];
    while (true) {
        for (var i = 0; i < data.rules.length; i++) {
            // 去除已加入的条件
            var had = false;
            for (var x = 0; x < cond.length; x++) {
                if (cond[x] == data.rules[i].conclusion) {
                    had = true;
                    break;
                }
            }
            if (had) continue;

            // 将条件与某一条规则的使用条件相匹配
            var all = true;
            for (var j = 0; j < data.rules[i].condition.length; j++) {
                var one = false;
                for (var k = 0; k < cond.length; k++) {
                    if (data.rules[i].condition[j] == cond[k]) {
                        one = true;
                        break;
                    }
                }
                if (!one) all = false;
            }
            if (all) {
                end[end.length] = data.rules[i].conclusion;
                condUsed = condUsed.concat(data.rules[i].condition);
            }
        }
        if (end.length == 0)
            break;
        cond = cond.concat(end);
        end.length = 0;
    }
    var ret = [];
    var n = 0;
    for (var i = 0; i < cond.length; i++) {
        var notUsed = true;
        for (var j = 0; j < condUsed.length; j++) {
            if (cond[i] == condUsed[j]) {
                notUsed = false;
                break;
            }
        }
        if(notUsed)ret[n++] = cond[i];
    }
    for (var i = 0; i < ret.length; i++) {
        for (var j = 0; j < ret.length; j++) {
            if (i != j && ret[i] == ret[j])
                ret.splice(j, 1);
        }
    }
    alert("结论：" + ret);
}

function moreCondition() {
    $("#conditionbox").append("<input type=\"text\" class=\"form-control\" id=\"condition" + (++ConditionNum) + "\" placeholder=\"请输入条件\">");
}

function Add() {
    PageShow(
        "添加规则",
        "<p>结论：</p>" +
        "<input type=\"text\" class=\"form-control\" id=\"conclusion\" placeholder=\"请输入结论\">" +
        "<br/>" +
        "<p style=\"display:inline;\">条件：</p>" +
        "<button class=\"btn btn-default btn-sm\" onClick=\"moreCondition()\">更多条件</button>" +
        "<div id=\"conditionbox\">" +
        "    <input type=\"text\" class=\"form-control\" id=\"condition0\" placeholder=\"请输入条件\">" +
        "</div>",
        function () {
            ConditionNum = 0;
            PageHide();
        },
        function () {
            var array = [];
            while (ConditionNum >= 0) {
                array[ConditionNum] = $("#condition" + ConditionNum).val();
                ConditionNum--;
            }
            var conclusion = $("#conclusion").val();
            var rule = { "conclusion": conclusion, "condition": array };
            data.rules[data.rules.length] = rule;
            afterRead();
            ConditionNum = 0;
            PageHide();
        }
    );
}

function Motify() {
    ConditionNum = data.rules[ItemSelect].condition.length - 1;
    var str = "<p>结论：</p>" +
        "<input type=\"text\" class=\"form-control\" id=\"conclusion\" placeholder=\"请输入结论\">" +
        "<br/>" +
        "<p style=\"display:inline;\">条件：</p>" +
        "<button class=\"btn btn-default btn-sm\" onClick=\"moreCondition()\">更多条件</button>" +
        "<div id=\"conditionbox\">";
    for (var i = 0; i < ConditionNum + 1; i++) {
        str += "    <input type=\"text\" class=\"form-control\" id=\"condition" + i + "\" placeholder=\"请输入条件\">"
    }
    str += "</div>";

    PageShow(
        "修改规则",
        str,
        function () {
            ConditionNum = 0;
            PageHide();
        },
        function () {
            var conclusion = $("#conclusion").val();
            var condition = [];
            var length = ConditionNum + 1;
            for (var i = 0; i < length; i++) {
                condition[i] = $("#condition" + i).val();
            }
            var rule = { "conclusion": conclusion, "condition": condition };
            data.rules[ItemSelect] = rule;
            afterRead();
            ConditionNum = 0;
            PageHide();
        },
        function () {
            $("#conclusion").val(data.rules[ItemSelect].conclusion);
            var length = data.rules[ItemSelect].condition.length;
            for (var i = 0; i < length; i++) {
                $("#condition" + i).val(data.rules[ItemSelect].condition[i]);
            }
        }
    );
}

function Delete() {
    PageShow(
        "删除规则",
        "结论：" + data.rules[ItemSelect].conclusion + "<br/>" + "条件：" + data.rules[ItemSelect].condition,
        function () {
            PageHide();
        },
        function () {
            data.rules.splice(ItemSelect, 1);
            afterRead();
            PageHide();
        }
    );
}

function Cancel() {
    PageCancel();
}

function Confirm() {
    PageConfirm();
}

var RadioFirst = true;
function RadioInit() {
    RadioSelect = true;
    document.getElementById("add").style.visibility = "visible";
    document.getElementById("motify").style.visibility = "hidden";
    document.getElementById("delete").style.visibility = "hidden";
    $(":radio").click(function () {
        RadioSelect = false;
        if (RadioFirst) {
            document.getElementById("motify").style.visibility = "visible";
            document.getElementById("delete").style.visibility = "visible";
        }
        ItemSelect = parseInt($(this).val());
    });
}

function afterRead() {
    var rules = data.rules;
    var txt = "";
    rules.forEach(function (item, index, input) {
        var conditions = item.condition;
        txt += "<div class=\"radio\" id=\"rule" + index + "\">";
        txt += "	<label>";
        txt += "		<input type=\"radio\" name=\"rule\" value=\"" + index + "\">";
        txt += "		规则 " + (index + 1);
        txt += "		<p>结论：" + item.conclusion + "</p>";
        txt += "		<p>条件：" + conditions + "</p>";
        txt += "	</label>";
        txt += "</div>";
    })

    $("#context").remove();
    txt = "<div id=\"context\">" + txt + "</div>";
    $("#view").append(txt);
    RadioInit();
}

// Page页面的显示和隐藏
function PageShow(title, content, cancel, confirm, more) {
    document.getElementById("page").style.visibility = "visible";
    $("#boxtitle").text(title);
    $("#boxcontent").html(content);
    PageCancel = cancel;
    PageConfirm = confirm;
    more = more || function () { };
    more();
}

function PageHide() {
    document.getElementById("page").style.visibility = "hidden";
}


// 文本读取与保存
var fileName = "Text.txt";
function fileimport() {
    var selectedFile = document.getElementById("files").files[0];
    var name = selectedFile.name;
    var size = selectedFile.size;
    fileName = name;

    var reader = new FileReader();
    reader.readAsText(selectedFile, 'utf-8');

    reader.onload = function () {
        start = true;
        data = eval('(' + this.result + ')');
        afterRead();
        document.getElementById("database").style.visibility = "visible";
        document.getElementById("reason").style.visibility = "visible";
    };
}

$(document).ready(function () {
    $("#import").click(function () {
        $("#files").click();
    });

    $("#export").click(function () {
        if (start) {
            var content = JSON.stringify(data);
            var blob = new Blob([content], { type: "application/json;charset=utf-8" });
            saveAs(blob, "data.json");
        } else {
            alert("你都没有开始，保存什么文件");
        }
    });
})