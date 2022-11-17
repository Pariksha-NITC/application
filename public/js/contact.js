async function addMembers() {
    const contactsTable = document.querySelector('.contacts-table-body');
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

            let phoneNo = document.createElement('td');
            phoneNo.textContent = member.phoneno;

            let email = document.createElement('td');
            email.textContent = member.email;

            row.appendChild(name);
            // row.appendChild(phoneNo);
            row.appendChild(email);
            
            row.setAttribute('class', 'contacts-data');
            row.setAttribute('cvsrc', member.cv);

            contactsTable.appendChild(row);
        });
    });
} 

async function slide() {
    const burger = document.querySelector('.burger');
	const nav = document.querySelector('.nav-links-container');
	burger.addEventListener('click', () => {
		// console.log("hi");
		nav.classList.toggle('nav-active');
	});
}

addMembers();
slide();
