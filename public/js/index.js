const slide = () => {
	const burger = document.querySelector('.burger');
	const nav = document.querySelector('.nav-links-container');

	burger.addEventListener('click', () => {
		console.log("hi");
		nav.classList.toggle('nav-active');
	});
}

slide();
