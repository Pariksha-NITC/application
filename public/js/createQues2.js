toggleEvalPanel();
function addToForm(node) {
    let qform = document.getElementById("submitForm");
    //alert(qform);
    let navinp = node.nextSibling;
    //navinp.setAttribute("value",node.innerHTML);
    qform.appendChild(node.nextSibling);

    //alert(qform.lastChild.getAttribute("type"));
    qform.submit();
}
/*function appendQnNo(node)
{
    //onsubmit="appendQnNo(this)"
    //<input type="hidden" name="qnum" value="{{@index}}">
    let cn = node.firstChild;
    let qnum = cn.innerHTML;
    let action = node.getAttribute('action');
    let qnlink = (action + qnum);
    node.setAttribute('action',qnlink);
    node.submit();
    
}*/
const saveButton = document.getElementById("save");
saveButton.addEventListener('click', (e) => {
    e.preventDefault();
    var arr = document.querySelectorAll(".optionID");
    var answers = [];
    var i = 0;
    arr.forEach(element => {
        if (element.checked == true) {
            answers.push(i);
        }
        ++i;
    });
    var fromprecision = document.getElementsByName('fromprecision')[0] == null ? "null" : document.getElementsByName('fromprecision')[0].value;
    var toprecision = document.getElementsByName('toprecision')[0] == null ? "null" : document.getElementsByName('toprecision')[0].value;
    fetch('/teacher/createQues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            'qzid': '{{qzid}}',
            'qexistence': '{{qexistence}}',
            'qnid': '{{qnid}}',
            'qtypes': document.getElementsByName('qtypes')[0].value,
            'question': document.getElementsByName('question')[0].value,
            'duration': document.getElementsByName('duration')[0].value,
            'marks': document.getElementsByName('marks1')[0].value,
            'fromprecision': fromprecision,
            'toprecision': toprecision,
            'feedback': document.getElementsByName('feedback')[0].value,
            'options': options,
            'answers': answers
        })
    }).then(async (resp) => {
        let respBody = await resp.json();
        let msg = respBody.qnid;
        console.log(msg);
        document.getElementById('submitForm').innerHTML += '<input type="hidden" name="qnid" value="' + msg + '">';
        document.getElementById('submitForm').submit();
    });

});
const createButton = document.getElementById("create");
createButton.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('createForm').submit();
});
const deleteButton = document.getElementById("delete");
deleteButton.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('deleteForm').submit();
});