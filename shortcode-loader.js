(function () {
    if (window.quizify_script_loaded) {
        console.log("App Embed already loaded, skipping ScriptTag");
        return;
    }

    console.log("Loading main app via ScriptTag fallback...");
    var s = document.createElement("script");
    s.src = "https://quizify-dev.arhamcommerce.com/js/shortcode.js";
    s.async = true;
    document.head.appendChild(s);
})();