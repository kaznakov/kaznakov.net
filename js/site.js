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
	$("#nav-mobile").html($("#nav-main").html());
	$("#nav-trigger span").on("click",function() {
		if ($("nav#nav-mobile ul").hasClass("expanded")) {
			$("nav#nav-mobile ul.expanded").removeClass("expanded").slideUp(250);
			$(this).removeClass("open");
		} else {
			$("nav#nav-mobile ul").addClass("expanded").slideDown(250);
			$(this).addClass("open");
		}
	});

	$("#nav-mobile").html($("#nav-main").html());
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
			title: "ScanyoMail",
			description: "Сервис поиска и мониторинга e-mail адресов для маркетинга и безопасности.",
			links: [
				{ label: "Сайт проекта", url: "https://scanyomail.com" }
			],
			screenshots: [
				"images/projects_images/project_image_001.jpg"
			]
		},
		{
			title: "KAZNAKOV.NET",
			description: "Персональный сайт с AI-ассистентом и двуязычным интерфейсом.",
			links: [
				{ label: "Открыть сайт", url: "https://kaznakov.net" }
			],
			screenshots: [
				"images/projects_images/project_image_002.jpg"
			]
		},
		{
			title: "Agent Miranda",
			description: "Экспериментальный AI-агент для консультаций и демонстрации prompt-engineering.",
			links: [
				{ label: "Документация", url: "https://kaznakov.net" }
			],
			screenshots: [
				"images/projects_images/project_image_003.jpg"
			]
		}
	];

	function buildProjectModal() {
		const modal = document.createElement("div");
		modal.className = "project-modal";
		modal.setAttribute("aria-hidden", "true");
		modal.innerHTML = [
			'<div class="project-modal__overlay" data-project-modal-close></div>',
			'<div class="project-modal__dialog" role="dialog" aria-modal="true" aria-label="Project details">',
			'<button class="project-modal__close" type="button" aria-label="Close project details" data-project-modal-close>&times;</button>',
			'<div class="project-modal__content">',
			'<p class="project-modal__kicker">PROJECT</p>',
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
		modal.querySelector(".project-modal__title").textContent = data.title;
		modal.querySelector(".project-modal__description").textContent = data.description;

		const linksContainer = modal.querySelector(".project-modal__links");
		linksContainer.innerHTML = "";
		data.links.forEach(function (link) {
			const anchor = document.createElement("a");
			anchor.href = link.url;
			anchor.textContent = link.label;
			anchor.target = "_blank";
			anchor.rel = "noopener noreferrer";
			linksContainer.appendChild(anchor);
		});

		const screenshotsContainer = modal.querySelector(".project-modal__screenshots");
		screenshotsContainer.innerHTML = "";
		data.screenshots.forEach(function (src) {
			const image = document.createElement("img");
			image.src = src;
			image.alt = data.title;
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
	}

	const projectModal = buildProjectModal();

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

	$("#projects .carousel-track .carousel-item").each(function (index) {
		$(this).on("click", function (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			const data = projectModalData[index];
			if (!data) {
				return;
			}
			fillProjectModal(projectModal, data);
			openProjectModal(projectModal);
		});
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
