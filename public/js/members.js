var selected=-1;


async function addMembers() {
    const membsTable = document.querySelector('.membs-table-body');
    await fetch("/data/members.json")
    .then(fileData => {
        return fileData.json();
    })
    .then(jsonData => {
        let members = jsonData.members;
        members.forEach((member)=> {
            let row = document.createElement('tr');
            let name = document.createElement('td');
            name.textContent = member.name;

            let rollNo = document.createElement('td');
            rollNo.textContent = member.rollno;

            let email = document.createElement('td');
            email.textContent = member.email;

            row.appendChild(name);
            row.appendChild(rollNo);
            // row.appendChild(email);
            
            row.setAttribute('class', 'membs-data');
            row.setAttribute('cvsrc', member.cv);

            membsTable.appendChild(row);
        });
    });
} 

async function slide() {
    await addMembers();
    const burger = document.querySelector('.burger');
	const nav = document.querySelector('.nav-links-container');
	const closeCvButton = document.querySelector('.close-cv-button');
    const loaderDiv = document.querySelector('.loader-div');

	burger.addEventListener('click', () => {
		// console.log("hi");
		nav.classList.toggle('nav-active');
	});

    closeCvButton.addEventListener('click', () => {
        members[selected].classList.toggle('membs-data-selected');
        cvViewer.classList.toggle('viewer-selected');
        closeCvButton.classList.toggle('close-cv-button-active');
        selected = -1;
    });

    const membsDiv = document.querySelector('.membs');
    const members = document.querySelectorAll('.membs-data');
    const cvViewer = document.getElementById('viewer');
    var timeoutID = -1;
    members.forEach((member, index) => {
        member.addEventListener('click', ()=> {
            cvSrc = member.getAttribute('cvsrc');
            clearTimeout(timeoutID);

            if (selected != -1)
                members[selected].classList.toggle('membs-data-selected');
            
            if (selected == -1) {
    		    cvViewer.classList.toggle('viewer-selected');
                loaderDiv.classList.add('loader-div-visible');
    		    closeCvButton.classList.toggle('close-cv-button-active');
                cvViewer.setAttribute('src', cvSrc);
                selected = index;
            } else if (selected == index) {
                // cvViewer.setAttribute('src', cvSrc);
    		    cvViewer.classList.toggle('viewer-selected');
                loaderDiv.classList.remove('loader-div-visible');
    		    closeCvButton.classList.toggle('close-cv-button-active');
                selected = -1;
            } else {
                loaderDiv.classList.add('loader-div-visible');
                cvViewer.setAttribute('src', cvSrc);
                selected = index;
            }
            
            if (selected != -1) {
                members[selected].classList.toggle('membs-data-selected');
                timeoutID = setTimeout(()=> {
                    loaderDiv.classList.remove('loader-div-visible');
                }, 10000);
            }
        });
    });
    cvViewer.addEventListener('transitionend', ()=> {
        if (!cvViewer.classList.contains('viewer-selected')) {
    		membsDiv.classList.remove('membs-selected');
            cvViewer.classList.add('viewer-hidden');
        }
    });
    cvViewer.addEventListener('transitionstart', ()=> {
        if (cvViewer.classList.contains('viewer-selected')) {
            cvViewer.classList.remove('viewer-hidden');
    		membsDiv.classList.add('membs-selected');
        }
    });

    cvViewer.addEventListener('load', ()=> {
        loaderDiv.classList.remove('loader-div-visible');
    });
}


slide();
