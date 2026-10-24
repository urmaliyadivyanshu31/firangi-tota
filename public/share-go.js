// A share link's page (/s/<code>) sends a person on to the game; link-preview crawlers do not run it.
var a = document.querySelector('a[data-go]')
if (a) location.replace(a.href)
