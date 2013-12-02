// Generated by CoffeeScript 1.6.3
(function() {
  var microbox, template;

  template = {
    caption: function(data) {
      return "<div class=\"caption\"><span class=\"microbox-button caption-trigger\">i</span>" + data.caption + "</div>";
    },
    image: function(data) {
      return "<img src=\"" + data.src + "\" alt=\"\" />";
    },
    lightbox: function(data) {
      var arrows, cap, captions, images, n, src, _i, _j, _len, _len1, _ref, _ref1;
      images = '';
      _ref = data.images;
      for (n = _i = 0, _len = _ref.length; _i < _len; n = ++_i) {
        src = _ref[n];
        images += template.image({
          last: n === data.images.length,
          src: src
        });
      }
      captions = '';
      _ref1 = data.captions;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        cap = _ref1[_j];
        captions += template.caption({
          caption: cap
        });
      }
      if (data.images.length > 1) {
        arrows = "<div class=\"arrows\">\n	<span class=\"microbox-button prev\">&#9656;</span>\n	<span class=\"microbox-button next\">&#9656;</span>\n</div>";
      } else {
        arrows = '';
      }
      return "<div class=\"inner\">\n	" + images + "\n</div>\n" + captions + "\n" + arrows;
    }
  };

  microbox = (function() {
    var attach, counter, getId, model, toggle, triggers;
    counter = -1;
    model = new umodel({
      visible: null,
      sets: {}
    });
    getId = function() {
      while (!(++counter in (model.get('sets')))) {
        return counter;
      }
    };
    toggle = function(set, id, index) {
      var element, images;
      console.log(set, id, index);
      element = set.element;
      element.classList.toggle('visible');
      if (element.classList.contains('visible')) {
        images = element.querySelectorAll('img');
        _.each(images, function(img) {
          return img.classList.remove('visible');
        });
        images[index].classList.add('visible');
        return model.set('visible', element);
      } else {
        return model.set('visible', null);
      }
    };
    attach = function(id, trigger) {
      var index, set;
      set = model.get("sets/" + id);
      index = set.triggers.indexOf(trigger);
      return trigger.addEventListener('click', function(e) {
        e.preventDefault();
        return toggle(set, id, index);
      });
    };
    triggers = document.querySelectorAll('a[href][rel^="lightbox"]');
    _.each(triggers, function(trigger) {
      var href, id, parts, rel, set, title;
      href = trigger.getAttribute('href');
      rel = trigger.getAttribute('rel');
      title = (trigger.getAttribute('title')) || '';
      parts = rel.split('[');
      if (parts[1]) {
        id = parts[1].slice(0, -1);
      } else {
        id = getId();
      }
      set = model.get("sets/" + id);
      if (set) {
        if ((set.triggers.indexOf(trigger)) < 0) {
          set.captions.push(title);
          set.images.push(href);
          set.triggers.push(trigger);
        }
      } else {
        model.set("sets/" + id, {
          captions: [title],
          images: [href],
          triggers: [trigger],
          active: 0
        });
      }
      return attach(id, trigger);
    });
    _.each(model.get('sets'), function(set, id) {
      var element, html;
      html = template.lightbox(set);
      element = document.createElement('div');
      element.className = 'microbox';
      element.innerHTML = html;
      document.body.appendChild(element);
      return model.set("sets/" + id + "/element", element);
    });
    return document.addEventListener('click', function(e) {
      var caption, height, newTop, screen, target, top;
      target = e.target;
      if (target.classList.contains('inner')) {
        (model.get('visible')).classList.remove('visible');
        return model.set('visible', null);
      } else if (target.classList.contains('caption-trigger')) {
        caption = target.parentNode;
        height = caption.offsetHeight;
        screen = window.innerHeight;
        top = caption.style.top;
        if ((!top) || ((parseInt(top, 10)) === screen)) {
          newTop = screen - height;
          return caption.style.top = "" + newTop + "px";
        } else {
          return caption.style.top = "" + screen + "px";
        }
      }
    });
  })();

}).call(this);
