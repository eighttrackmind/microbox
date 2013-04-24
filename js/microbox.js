/*global define, require, module */
define(function (require, exports, module) {

	require('lib/_polyfills');

	var _ = require('lib/_util');
	var $ = require('lib/_dom');
	var template = require('lib/_template');

	var D = document;
	var regexLightbox = /^lightbox/;

	function MicroBox (opts) {

		// vars
		
		var captions = {};
		var pages = {};
		var sets = {};
		var lightboxes = {};
		var options = {
			showPager: true,
			showPagerTitle: true
		};
		var setCount = 0;
		var model = {
			activeSetId: null	
		};

		// set user-defined options
		if (opts) {
			for (var opt in opts) {
				if (options.hasOwnProperty(opt)) {
					options[opt] = opts[opt];
				}
			}
		}

		template.setOptions(options);

		// functions

		/**
		 * Helper to add image to set
		 * @param {String} setId	Unique set id
		 * @param {String} item		URL for full sized image to show onClick
		 * @param {String} caption	The image caption (description)
		 * @param {Element} *element
		 */
		function addToSet (setId, item, caption, element) {
			if (!setContains(setId, item)) {
				sets[setId].push(item);

				addCaptionNx(setId);

				captions[setId].push(caption);

				if (element) {
					element.setAttribute('data-microbox-page', sets[setId].length - 1);
				}

				build(setId);
			}
		}

		// set helpers

		function addSet (setId) {
			pages[setId] = 0;
			sets[setId] = [];
		}

		function addSetNx (setId) {
			if (!setExists(setId)) {
				addSet(setId);
			}
		}

		function getSet (setId) {
			return sets[setId];
		}

		function setContains (setId, item) {
			return sets[setId].indexOf(item) > -1;
		}

		function setExists (setId) {
			return setId in sets;
		}

		// caption helpers

		function addCaption (setId) {
			captions[setId] = [];
		}

		function addCaptionNx (setId) {
			if (!captionExists(setId)) {
				addCaption(setId);
			}
		}

		function captionExists (setId) {
			return setId in captions;
		}

		function getCaptions (setId) {
			return captions[setId];
		}

		//

		function hideAll () {
			for (var set in sets) {
				hide(set);
			}
			model.activeSetId = null;
		}

		function build (setId) {

			var captions = getCaptions(setId);
			var images = getSet(setId);
			var html = template.images(setId, images, captions);

			// remove the lightbox first if it's already rendered
			if (setRendered(setId)) {
				var element = $('#microbox-' + setId);
				document.body.removeChild(element);
			}

			// inject lightbox
			var box = template.container(setId, html);
			D.body.appendChild(box);

			// store the reference
			lightboxes[setId] = $('#microbox-' + setId);

		}

		function click (e) {

			var events = {

				// hide other lightboxes
				document: {
					fn: function () {
						hideAll();
					},
					yep: function () {
						var target = e.target;
						return !target.classList.contains('microbox-caption-trigger') && target.tagName !== 'FIGCAPTION';
					}
				},

				caption: {
					fn: function () {

						var target = e.target;

						// toggle box class
						var box = _.parent(target, function (element) {
							return element.classList.contains('microbox');
						});
						box.classList.toggle('show-caption');

						// toggle caption
						var caption = target.parentNode;
						var height = caption.offsetHeight;
						var winHeight = window.innerHeight || document.body.clientHeight;

						caption.style.top = (
							box.classList.contains('show-caption') ?
							(winHeight - height) :
							winHeight
						) + 'px';

					},
					yep: function () {
						return e.target.classList.contains('microbox-caption-trigger');
					}
				},

				// user clicked on a trigger -> show lightbox
				trigger: {
					fn: function () {
						stop(e);

						var target = this.yep();
						var setId = target.getAttribute('data-microbox-trigger');

						// this set is the active set
						if (setId === model.activeSetId) {

							// update model
							model.activeSetId = null;

							// hide this lightbox
							hide(setId);

						} else {

							// hide other lightboxes
							hideAll();

							// update model
							model.activeSetId = setId;

							// show this lightbox
							show(setId);
						}

						return;
					},
					yep: function () {
						return _.parent(e.target, function (element) {
							return element.classList.contains('microbox-trigger');
						});
					}
				}
			};
			
			// trigger events
			for (var evt in events) {
				var candidate = events[evt];
				if (candidate.yep()) {
					candidate.fn();
				}
			}

			// update model
			model.activeSetId = null;

		}

		function init() {

			var togglers = getTogglers();

			// initialize
			togglers.forEach(function (toggler) {

				var href = toggler.href;
				var setId = 'microbox-' + setCount;
				var title = toggler.title;

				// increment set counter
				++setCount;

				// prepare DOM for delegated toggling
				toggler.setAttribute('data-microbox-trigger', setId);
				toggler.classList.add('microbox-trigger');

				// collect set info
				add(setId, href, title, toggler);
			
			});

		}

		init();

		// attach delegated click event
		document.addEventListener('click', click);

		// public API
		
		/**
		 * Add images to an image set
		 * @param {String}			setId		The set ID
		 * @param {String|Array}	items		URL or array of URLs
		 * @param {String|Array}	captions	caption or array of captions
		 * @param {DOMElement}		*element
		 */
		function add (setId, items, captions, element) {
			
			// normalize items
			if (_.isString(items)) {
				items = [items];
			}

			// normalize captions
			if (_.isString(captions)) {
				captions = [captions];
			}

			// check that the set exists, lazy create if it doesn't
			addSetNx(setId);

			// add
			items.forEach(function (item, n) {
				addToSet(setId, item, captions[n], element);
			});

		}

		return {
			add: add
		};

	}



	///////////////////////////////////      helpers      ///////////////////////////////////



	function getTogglers() {
		return _.toArray($('a')).filter(
			function (item) {
				return item.rel.match(regexLightbox);
			}
		);
	}

	function stop (e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	function hide (setId) {
		$('#microbox-' + setId).classList.remove('microbox-show');
	}

	function show (setId) {
		$('#microbox-' + setId).classList.add('microbox-show');
		align(setId);
	}

	/**
	 * Vertically aligns a lightbox
	 * @param  {String} setId
	 */
	function align (setId) {
		var box = $('#microbox-' + setId);
		var img = $('img', box)[0];
		var inner = $('.inner', box);
		var height = img.offsetHeight;
		inner[0].style['margin-top'] = -height/2 + 'px';
	}

	function setRendered (setId) {
		return !!$('#microbox-' + setId);
	}



	///////////////////////////////////      public API     ///////////////////////////////////
	


	module.exports = MicroBox;



});