function toggleRightPanel() {
    if (document.getElementById("right_panel").style.display == "inline") {
        document.getElementById("right_panel").style.display = "none";
        document.getElementById("questions_panel").style.display = "grid";
        document.getElementById("main_area").style.width = "100%";
        //document.getElementById("response_panel").style.width="100%";
        //document.getElementById("response_panel").style.height="17%";
    }
    else {
        document.getElementById("right_panel").style.display = "inline";
        document.getElementById("questions_panel").style.display = "grid";
        document.getElementById("main_area").style.width = "79.25%";
        //document.getElementById("response_panel").style.width="20%";
        //document.getElementById("response_panel").style.margin_top="5%";


    }
}

function hideRightPanel() {
    document.getElementById("right_panel").style.display = "none";
    document.getElementById("question_area").style.width = "100%";
}

function addToForm(node) {
    let qform = document.getElementById("question_form");
    //alert(qform);
    let navinp = node.nextSibling;
    //navinp.setAttribute("value",node.innerHTML);
    qform.appendChild(node.nextSibling);

    //alert(qform.lastChild.getAttribute("type"));
    qform.submit();
}

function confirmSubmission(node) {
    if (confirm('Once submitted you will not be able to continue attempt')) {
        let qform = document.getElementById("question_form");
        qform.setAttribute('action', '/student/saveAndEnd');
        qform.submit();
    }
}