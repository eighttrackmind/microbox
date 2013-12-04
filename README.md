microbox - the very tiny lightbox
=================================

## Features

- Tiny
- Fast
- API compatible with [lightbox.js](http://lokeshdhakar.com/projects/lightbox2/)

## Dependencies

- umodel (https://github.com/eighttrackmind/umodel)
- _ (https://github.com/eighttrackmind/_)

## Usage (non-AMD)

1. Include the script and dependencies somewhere on your page (preferably right before `</body>`):

```html
...
<script src="_.js"></script>
<script src="umodel.js"></script>
<script src="microbox.min.js"></script>
</body>
</html>
```

2. Include the stylesheet somewhere in the `<head>` of your page (preferably right before `</head>`):

```html
...
<link rel="stylesheet" href="microbox.css" />
</head>
...
```

3. Add a `rel="lightbox"` attribute to any images you want to lightbox:

```html
<a href="images/fullSizedImage.png" rel="lightbox">
	<img src="images/thumbSizedImage.png" />
</a>
```

## Tested on

- Chrome
- Firefox 24
- Safari 7
- Opera 17
- Internet Explorer 9+
- iPad (iOS7)
- iPhone (iOS7)

## Todo

- Unit & layout tests
- Improve performance on old iOS/Droid
- Add swipe support when device supports touch