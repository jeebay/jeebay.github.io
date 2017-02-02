(function(root) {

const $platformOutput = $('#platform_output');
const $bowserOutput = $('#bowser_output');
const $ua = $('#ua');

const ua = root.navigator.userAgent;
const browser = root.bowser._detect(ua);

$ua.html(`${window.navigator.userAgent}`);

Object.keys(root.platform).forEach(key => {
    if (key !== 'parse') {
        $platformOutput.append($(`<li><pre>platform.${key} = ${platform[key]}</pre></li>`))
    }
});

Object.keys(browser).forEach(key => {
    $bowserOutput.append($(`<li><pre>bowser.${key} = ${browser[key]}</pre></li>`))
});

})(window);