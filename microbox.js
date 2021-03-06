(function(root, factory) {
    if(typeof exports === 'object') {
        module.exports = factory(require('umodel'), require('u'));
    }
    else if(typeof define === 'function' && define.amd) {
        define('microbox', ['umodel', 'u'], factory);
    }
    else {
        root['microbox'] = factory(root.umodel, root.u);
    }
}(this, function(umodel, u) {
var bound, keys, microbox, template;

template = function(data, id) {
  var caption, captions, images, item, items, n, pager, src, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
  images = '';
  _ref = data.images;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    src = _ref[_i];
    images += "<img src=\"" + src + "\" alt=\"\" />";
  }
  captions = '';
  _ref1 = data.captions;
  for (n = _j = 0, _len1 = _ref1.length; _j < _len1; n = ++_j) {
    caption = _ref1[n];
    if (caption) {
      captions += "<div class=\"caption\" microbox-caption=\"" + n + "\">\n	<span class=\"microbox-button\" microbox-trigger-caption>i</span>\n	" + caption + "\n</div>";
    }
  }
  if (data.images.length > 1) {
    items = '';
    _ref2 = data.images;
    for (n = _k = 0, _len2 = _ref2.length; _k < _len2; n = ++_k) {
      item = _ref2[n];
      items += "<li microbox-trigger-set=\"" + id + "\" microbox-trigger-index=\"" + n + "\">" + (n + 1) + "</li>";
    }
    pager = "<ul class=\"microbox-pager\">\n	<li class=\"microbox-counts\">" + (data.active + 1) + "/" + data.images.length + "</li>\n	<li microbox-trigger-prev microbox-trigger-set=\"" + id + "\">&#9656;</li>\n	" + items + "\n	<li microbox-trigger-next microbox-trigger-set=\"" + id + "\">&#9656;</li>\n</ul>";
  } else {
    pager = '';
  }
  return "<span class=\"microbox-button microbox-close\" microbox-close>&times;</span>\n<div class=\"inner\">\n	" + images + "\n</div>\n" + captions + "\n" + pager;
};

bound = function(thing, min, max) {
  if (thing < min) {
    thing = min;
  } else if (thing > max) {
    thing = max;
  }
  return thing;
};

keys = {
  27: 'esc',
  37: 'left',
  39: 'right',
  65: 'a',
  68: 'd'
};

microbox = (function() {
  var attach, counter, getId, hide, init, model, next, prev, show, toggle,
    _this = this;
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
  toggle = function(id, index, show) {
    var caption, components, element, max, set, verb;
    if (index == null) {
      index = 0;
    }
    if (id == null) {
      console.error("microbox.toggle expects a set ID, given '" + id + "'");
      return false;
    }
    set = model.get("sets/" + id);
    max = set.images.length - 1;
    element = set.element;
    if (set == null) {
      console.error("microbox.toggle passed an invalid set id '" + id + "'");
      return false;
    }
    index = bound(+index, 0, max);
    if (show === true) {
      verb = 'add';
    } else if (show === false) {
      verb = 'remove';
    } else {
      verb = 'toggle';
    }
    u.classList[verb](element, 'visible');
    if (u.classList.contains(element, 'visible')) {
      components = set.components;
      u.each(components.images, function(item) {
        return u.classList.remove(item, 'visible');
      });
      u.classList.add(components.images[index], 'visible');
      components.counts.innerHTML = "" + (index + 1) + "/" + set.images.length;
      u.each(components.pagerItems, function(item) {
        return u.classList.remove(item, 'active');
      });
      u.classList.add(components.pagerItems[index], 'active');
      verb = index === 0 ? 'add' : 'remove';
      u.classList[verb](components.prev, 'disabled');
      verb = index === max ? 'add' : 'remove';
      u.classList[verb](components.next, 'disabled');
      u.each(components.captions, function(item) {
        u.classList.add(item, 'hide');
        u.classList.remove(item, 'active');
        return item.style.top = '';
      });
      components.pager.style.bottom = '';
      caption = components.captions[index];
      if (caption) {
        u.classList.remove(caption, 'hide');
      }
      set.active = index;
      return model.set('visible', set);
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
      return toggle(id, index);
    });
  };
  init = function() {
    var triggers;
    triggers = document.querySelectorAll('a[href][rel^="lightbox"]');
    u.each(triggers, function(trigger) {
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
          active: 0,
          id: id
        });
      }
      return attach(id, trigger);
    });
    return u.each(model.get('sets'), function(set, id) {
      var element, html;
      html = template(set, id);
      element = document.createElement('div');
      element.className = 'microbox';
      element.innerHTML = html;
      document.body.appendChild(element);
      set = model.get("sets/" + id);
      set.element = element;
      set.components = {
        captions: [],
        counts: element.querySelector('.microbox-counts'),
        images: element.querySelectorAll('img'),
        pager: element.querySelector('.microbox-pager'),
        pagerItems: element.querySelectorAll('[microbox-trigger-index]'),
        next: element.querySelector('[microbox-trigger-next]'),
        prev: element.querySelector('[microbox-trigger-prev]')
      };
      return u.each(element.querySelectorAll('[microbox-caption]'), function(item) {
        id = +item.getAttribute('microbox-caption');
        return set.components.captions[id] = item;
      });
    });
  };
  document.addEventListener('click', function(e) {
    var caption, height, index, newTop, pager, screen, set, target, top;
    target = e.target;
    if ((u.classList.contains(target, 'inner')) || (target.hasAttribute('microbox-close'))) {
      return hide();
    } else if ((target.hasAttribute('microbox-trigger-index')) && (target.hasAttribute('microbox-trigger-set'))) {
      set = target.getAttribute('microbox-trigger-set');
      index = target.getAttribute('microbox-trigger-index');
      return toggle(set, index, true);
    } else if ((target.hasAttribute('microbox-trigger-next')) || (target.hasAttribute('microbox-trigger-prev'))) {
      if (target.hasAttribute('microbox-trigger-next')) {
        return next();
      } else {
        return prev();
      }
    } else if (target.hasAttribute('microbox-trigger-caption')) {
      caption = target.parentNode;
      height = caption.offsetHeight;
      screen = window.innerHeight;
      top = caption.style.top;
      pager = caption.parentNode.querySelector('.microbox-pager');
      if ((!top) || ((parseInt(top, 10)) === screen)) {
        newTop = screen - height;
        caption.style.top = "" + newTop + "px";
        u.classList.add(caption, 'active');
        return pager.style.bottom = "" + (height + 10) + "px";
      } else {
        u.classList.remove(caption, 'active');
        caption.style.top = '';
        return pager.style.bottom = '';
      }
    }
  });
  window.addEventListener('keydown', function(e) {
    var key, set;
    key = keys[e.keyCode];
    set = model.get('visible');
    if (key && set) {
      switch (key) {
        case 'esc':
          return hide();
        case 'left':
        case 'a':
          return prev();
        case 'right':
        case 'd':
          return next();
      }
    }
  });
  hide = function() {
    var id, index, set;
    set = model.get('visible');
    if (set) {
      id = set.id;
      index = model.get("sets/" + id + "/active");
      return toggle(id, null, false);
    } else {
      return console.error('microbox.hide() can only be called when a set is visible');
    }
  };
  show = function(id) {
    var available;
    if (model.get("sets/" + id)) {
      return toggle(id, null, true);
    } else {
      available = u.keys(model.get("sets"));
      return console.error("Set with ID '" + id + "' does not exist. Available sets: ", available);
    }
  };
  next = function() {
    var id, index, set;
    set = model.get('visible');
    if (set) {
      id = set.id;
      index = model.get("sets/" + id + "/active");
      return toggle(id, ++index, true);
    } else {
      return console.error('microbox.next() can only be called when a set is visible');
    }
  };
  prev = function() {
    var id, index, set;
    set = model.get('visible');
    if (set) {
      id = set.id;
      index = model.get("sets/" + id + "/active");
      return toggle(id, --index, true);
    } else {
      return console.error('microbox.prev() can only be called when a set is visible');
    }
  };
  init();
  return {
    init: init,
    next: next,
    prev: prev,
    hide: hide,
    show: show
  };
})();

    return microbox;
}));
