var x = `
        <div id="qstn"> Question <textarea name="question" cols="100" rows="4" id="question" placeholder="Type in Question ..."></textarea>
        </div>`;
var y = `
        <div id="options">
            <div id="optionsSoFar"></div>
            <textarea name="option" cols="100" rows="2" id="optionArea" placeholder="Type in Option ..."></textarea><button style="border-radius:5px;width:max-content;height: fit-content;" type="button" onclick="createOption('single')">Create Option</button>
        </div>
        <div id="limits">
            <p>Duration : <input name="duration" type="text"> minutes </p>
            <p>Marks : <input name="marks1" type="text"> marks </p>
            <p>Feedback :</p> 
            <p><textarea name="feedback" cols="100" rows="1" id="feedback" placeholder="Feedback ..."></textarea></p>
        </div>`;
var t = `
        <div id="options">
            <div id="optionsSoFar"></div>
            <textarea name="option" cols="100" rows="2" id="optionArea" placeholder="Type in Option ..."></textarea><button style="border-radius:5px;width:max-content;height: fit-content;" type="button" onclick="createOption('multi')">Create Option</button>
        </div>
        <div id="limits">
            <p>Duration : <input name="duration" type="text"> minutes </p>
            <p>Marks : <input name="marks1" type="text"> marks </p>
            <p>Feedback :</p> 
            <p><textarea name="feedback" cols="100" rows="1" id="feedback" placeholder="Feedback ..."></textarea></p>
        </div>`;
var z = `
        <div id="limits">
            <p>Duration : <input name="duration" type="text"> minutes </p>
            <p>Marks : <input name="marks1" type="text"> marks </p>
            <p>Feedback :</p> 
            <p><textarea name="feedback" cols="100" rows="1" id="feedback" placeholder="Feedback ..."></textarea></p>
        </div>`;
var w = `
        <div id="limits">
            <p>Answer Range: <input name="fromprecision" type="text"> to <input name="toprecision" type="text"> </p>
            <p>Duration : <input name="duration" type="text"> minutes </p>
            <p>Marks : <input name="marks1" type="text"> marks </p>
            <p>Feedback :</p> 
            <p><textarea name="feedback" cols="100" rows="1" id="feedback" placeholder="Feedback ..."></textarea></p>
        </div>
        `;
var mcq = x + y;
var msq = x + t;
var subjective = x + z;
var integer = x + w;
var options = [];
function createOption(type) {
    var x = document.getElementById('optionArea').value;
    options.push(x);
    if (x == '') {
        alert("Field can't be empty");
    }
    else {
        var old = document.getElementById('optionsSoFar').innerHTML;
        if (old == '') {
            if (type == 'single') {
                old += '<p> Choose one of these options : </p><br>';
            }
            else {
                old += '<p> Choose options : </p><br>';
            }
        }
        if (type == 'single') {
            old += `<p> <input type="radio" class="optionID" name="option" value=${x}>${x}</p><br>`;
        }
        else {
            old += `<p> <input type="checkbox" class="optionID" name="option" value=${x}>${x}</p><br>`;
        }
        document.getElementById('optionsSoFar').innerHTML = old;
    }
}
function caterType(type) {
    var x = type.options[type.selectedIndex].value;
    if (x == 'mcq') {
        document.getElementById('holds').innerHTML = mcq;
    }
    else if (x == 'msq') {
        document.getElementById('holds').innerHTML = msq;
    }
    else if (x == 'integer') {
        document.getElementById('holds').innerHTML = integer;
    }
    else if (x == 'subjective') {
        document.getElementById('holds').innerHTML = subjective;
    }
}
function toggleRightPanel() {
    if (document.getElementById("right_panel").style.display == "inline") {
        document.getElementById("right_panel").style.display = "none";
        document.getElementById("questions_panel").style.display = "grid";
        document.getElementById("main_area").style.width = "100%";
    }
    else {
        document.getElementById("evaluation_panel").style.display = "none";
        document.getElementById("right_panel").style.display = "inline";
        document.getElementById("questions_panel").style.display = "grid";
        document.getElementById("main_area").style.width = "79.25%";
    }
}
function toggleEvalPanel() {
    if (document.getElementById("evaluation_panel").style.display == "inline") {
        document.getElementById("evaluation_panel").style.display = "none";
        document.getElementById("questions_panel").style.display = "grid";
        document.getElementById("main_area").style.width = "100%";
    }
    else {
        document.getElementById("evaluation_panel").style.display = "inline";
        document.getElementById("right_panel").style.display = "none";
        document.getElementById("questions_panel").style.display = "grid";
        document.getElementById("main_area").style.width = "70%";
    }
}
function hideRightPanel() {
    document.getElementById("right_panel").style.display = "none";
    document.getElementById("question_area").style.width = "100%";
}