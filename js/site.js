"use strict";

$(document).ready(function () {
	/* Video Lightbox */
	if (!!$.prototype.simpleLightboxVideo) {
		$('.video').simpleLightboxVideo();
	}

	/*ScrollUp*/
	if (!!$.prototype.scrollUp) {
		$.scrollUp();
	}

	/*Responsive Navigation*/
	function syncMobileMenu() {
		$("#nav-mobile").html($("#nav-main").html());
	}

	syncMobileMenu();
	$("#nav-trigger span").on("click",function() {
		if ($("nav#nav-mobile ul").hasClass("expanded")) {
			$("nav#nav-mobile ul.expanded").removeClass("expanded").slideUp(250);
			$(this).removeClass("open");
		} else {
			$("nav#nav-mobile ul").addClass("expanded").slideDown(250);
			$(this).addClass("open");
		}
	});

	syncMobileMenu();

	$("#nav-mobile").on("click", "a.lang-link[data-lang]", function (event) {
		event.preventDefault();
		const lang = $(this).attr("data-lang");
		if (window.i18n && typeof window.i18n.setLang === "function") {
			window.i18n.setLang(lang);
		}
	});

	$("#nav-mobile ul a").on("click",function() {
		if ($("nav#nav-mobile ul").hasClass("expanded")) {
			$("nav#nav-mobile ul.expanded").removeClass("expanded").slideUp(250);
			$("#nav-trigger span").removeClass("open");
		}
	});

	/* Sticky Navigation */
	if (!!$.prototype.stickyNavbar) {
		$('#header').stickyNavbar();
	}

	$('#content').waypoint(function (direction) {
		if (direction === 'down') {
			$('#header').addClass('nav-solid fadeInDown');
		}
		else {
			$('#header').removeClass('nav-solid fadeInDown');
		}
	});

	/* Projects modal */
	const projectModalData = [
		{
			titleKey: "projects.modal.project1.title",
			descriptionKey: "projects.modal.project1.description",
			links: [
				{ labelKey: "projects.modal.project1.link", url: "https://kaznakov.github.io/awosd" }
			],
			screenshots: [
				"images/projects_images/project_image_001.jpg"
			]
		},
		{
			titleKey: "projects.modal.project2.title",
			descriptionKey: "projects.modal.project2.description",
			links: [
				{ labelKey: "projects.modal.project2.link", url: "https://kaznakov.net" }
			],
			screenshots: [
				"images/projects_images/project_image_002.jpg"
			]
		},
		{
			titleKey: "projects.modal.project3.title",
			descriptionKey: "projects.modal.project3.description",
			links: [
				{ labelKey: "projects.modal.project3.link", url: "https://apps.apple.com/us/app/scanyomail/id6756759760" }
			],
			screenshots: [
				"images/projects_images/project_image_003.jpg"
			]
		},
		{
			titleKey: "projects.modal.project4.title",
			descriptionKey: "projects.modal.project4.description",
			links: [
				{ labelKey: "projects.modal.project4.link", url: "#" }
			],
			screenshots: [
				"images/projects_images/project_image_004.jpg"
			]
		},
		{
			titleKey: "projects.modal.project5.title",
			descriptionKey: "projects.modal.project5.description",
			links: [
				{ labelKey: "projects.modal.project5.link", url: "#" }
			],
			screenshots: [
				"images/projects_images/project_image_005.jpg"
			]
		},
		{
			titleKey: "projects.modal.project6.title",
			descriptionKey: "projects.modal.project6.description",
			links: [
				{ labelKey: "projects.modal.project6.link", url: "#" }
			],
			screenshots: [
				"images/projects_images/project_image_006.jpg"
			]
		}
	];

	function translateModalText(key) {
		if (window.i18n && typeof window.i18n.t === "function") {
			return window.i18n.t(key);
		}
		return key;
	}

	function buildProjectModal() {
		const modal = document.createElement("div");
		modal.className = "project-modal";
		modal.setAttribute("aria-hidden", "true");
		modal.innerHTML = [
			'<div class="project-modal__overlay" data-project-modal-close></div>',
			'<div class="project-modal__dialog" role="dialog" aria-modal="true" aria-label="Project details">',
			'<button class="project-modal__close" type="button" aria-label="Close project details" data-project-modal-close>&times;</button>',
			'<div class="project-modal__content">',
			'<p class="project-modal__kicker"></p>',
			'<h3 class="project-modal__title"></h3>',
			'<p class="project-modal__description"></p>',
			'<div class="project-modal__links"></div>',
			'<div class="project-modal__screenshots"></div>',
			"</div>",
			"</div>"
		].join("");
		document.body.appendChild(modal);
		return modal;
	}

	function fillProjectModal(modal, data) {
		modal.querySelector(".project-modal__kicker").textContent = translateModalText("projects.modal.kicker");
		modal.querySelector(".project-modal__title").textContent = translateModalText(data.titleKey);
		modal.querySelector(".project-modal__description").textContent = translateModalText(data.descriptionKey);

		const linksContainer = modal.querySelector(".project-modal__links");
		linksContainer.innerHTML = "";
		data.links.forEach(function (link) {
			const anchor = document.createElement("a");
			anchor.href = link.url;
			anchor.textContent = translateModalText(link.labelKey);
			anchor.target = "_blank";
			anchor.rel = "noopener noreferrer";
			linksContainer.appendChild(anchor);
		});

		const screenshotsContainer = modal.querySelector(".project-modal__screenshots");
		screenshotsContainer.innerHTML = "";
		data.screenshots.forEach(function (src) {
			const image = document.createElement("img");
			image.src = src;
			image.alt = translateModalText(data.titleKey);
			screenshotsContainer.appendChild(image);
		});
	}

	function openProjectModal(modal) {
		modal.classList.add("is-open");
		modal.setAttribute("aria-hidden", "false");
		document.body.classList.add("project-modal-open");
	}

	function closeProjectModal(modal) {
		modal.classList.remove("is-open");
		modal.setAttribute("aria-hidden", "true");
		document.body.classList.remove("project-modal-open");
		activeProjectIndex = null;
	}

	const projectModal = buildProjectModal();
	let activeProjectIndex = null;

	function refreshProjectModalLanguage() {
		if (activeProjectIndex === null) {
			return;
		}
		const data = projectModalData[activeProjectIndex];
		if (!data) {
			return;
		}
		fillProjectModal(projectModal, data);
		const dialog = projectModal.querySelector(".project-modal__dialog");
		dialog.setAttribute("aria-label", translateModalText("projects.modal.ariaLabel"));
		const closeButton = projectModal.querySelector(".project-modal__close");
		closeButton.setAttribute("aria-label", translateModalText("projects.modal.close"));
	}

	projectModal.addEventListener("click", function (event) {
		if (event.target && event.target.hasAttribute("data-project-modal-close")) {
			closeProjectModal(projectModal);
		}
	});

	document.addEventListener("keydown", function (event) {
		if (event.key === "Escape" && projectModal.classList.contains("is-open")) {
			closeProjectModal(projectModal);
		}
	});

	window.addEventListener("kaz:langChanged", function () {
		if (projectModal.classList.contains("is-open")) {
			refreshProjectModalLanguage();
		}
	});

	const projectItems = $("#projects .carousel-track .carousel-item");

	projectItems.on("click", function (event) {
		event.preventDefault();
		event.stopImmediatePropagation();
		let index = Number($(this).attr("data-project-index"));
		if (Number.isNaN(index)) {
			index = projectItems.index(this);
		}
		const data = projectModalData[index];
		if (!data) {
			return;
		}
		activeProjectIndex = index;
		fillProjectModal(projectModal, data);
		refreshProjectModalLanguage();
		openProjectModal(projectModal);
	});

});


/* Preloader and animations */
$(window).load(function () { // makes sure the whole site is loaded
	$('#status').fadeOut(); // will first fade out the loading animation
	$('#preloader').delay(350).fadeOut('slow'); // will fade out the white DIV that covers the website.
	$('body').delay(350).css({'overflow-y': 'visible'});

	/* WOW Elements */
	if (typeof WOW == 'function') {
		new WOW().init();
	}

	/* Parallax Effects */
	if (!!$.prototype.enllax) {
		$(window).enllax();
	}

});
