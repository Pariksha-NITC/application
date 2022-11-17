function toggleRightPanel() {
    if (document.getElementById("right_panel").style.display == "inline") {
        document.getElementById("right_panel").style.display = "none";
        document.getElementById("questions_panel").style.display = "grid";
        document.getElementById("question_area").style.width = "100%";
    }
    else {
        document.getElementById("right_panel").style.display = "inline";
        document.getElementById("questions_panel").style.display = "grid";
        document.getElementById("question_area").style.width = "79.25%";
    }
}
function hideRightPanel() {
    document.getElementById("right_panel").style.display = "none";
    document.getElementById("question_area").style.width = "100%";
}