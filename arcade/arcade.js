(function () {
  function navigate(url) { if (!url) return; window.location.href = url; }
  var cab = document.querySelector('.arcade-cabinet');
  if (!cab) return;
  var prev = cab.getAttribute('data-prev');
  var next = cab.getAttribute('data-next');

  // Arrow links are already anchors; add keyboard and joystick behavior
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') navigate(prev);
    if (e.key === 'ArrowRight') navigate(next);
  });

  // Add click listeners for arrow buttons
  var leftArrow = cab.querySelector('.joy-arrow.left');
  var rightArrow = cab.querySelector('.joy-arrow.right');

  if (leftArrow && prev) {
    leftArrow.addEventListener('click', function () { navigate(prev); });
  }

  if (rightArrow && next) {
    rightArrow.addEventListener('click', function () { navigate(next); });
  }

  var joy = document.querySelector('.joystick');
  if (joy) {
    var stick = joy.querySelector('.stick');
    var bounds = 22; // px travel
    var enabledL = joy.getAttribute('data-enabled-left') === '1';
    var enabledR = joy.getAttribute('data-enabled-right') === '1';
    function reset() { stick.style.transform = 'translate(-50%,-50%)'; }
    function drag(dir) {
      if (dir === 'L' && enabledL) { stick.style.transform = 'translate(calc(-50% - ' + bounds + 'px),-50%)'; setTimeout(function () { navigate(prev); }, 120); }
      if (dir === 'R' && enabledR) { stick.style.transform = 'translate(calc(-50% + ' + bounds + 'px),-50%)'; setTimeout(function () { navigate(next); }, 120); }
      setTimeout(reset, 160);
    }
    joy.addEventListener('click', function (e) {
      var rect = joy.getBoundingClientRect();
      var mid = rect.left + rect.width / 2;
      if (e.clientX < mid) drag('L'); else drag('R');
    });
  }
})();
