window.quizify_script_loaded = true;
var origin_URL = "https://quizify-dev.arhamcommerce.com";
var Api = origin_URL + "/quiz";
var Api_response = origin_URL + "/QuizifyResults";
var check_pop_quiz, PopupUrl;
check_pop_quiz = location.hash;

PopupUrl = check_pop_quiz.substr(0, 12);
var shortcode_id;
window.addEventListener('popstate', function (event) {
    check_pop_quiz = location.hash;
    PopupUrl = check_pop_quiz.substr(0, 12);
    Popquiz(); //Full screen quiz code
    // checkStartoverQuerystring();
});
/*
|-----------------------------------------------------------------------------
| GetQuizifyCartDetail() Update quizify products counter
|-----------------------------------------------------------------------------
|
| Function will fetch cart details with inventory ids
| and send these details to quizify product counter.
|
*/
function GetQuizifyCartDetail(find_frame) {
    GETdata('/cart.js', function (cart) {
        var ids = [];
        if (cart.items != '') {
            cart.items.forEach(function (element) {
                ids.push(element.variant_id);
            });
        }
        if (ids != '') {
            var Quizify_dstrslt = { 'update_quiz_cart': ids };
            find_frame[0].contentWindow.postMessage(Quizify_dstrslt, '*');
        }
        else {
            var Quizify_dstrslt = { 'update_quiz_cart': ids };
            find_frame[0].contentWindow.postMessage(Quizify_dstrslt, '*');
        }
    });
}

/*
|-----------------------------------------------------------------------------
| checkStartoverQuerystring() Set startover=yes as querystring on external URL
|-----------------------------------------------------------------------------
|
| This function will remove result data
| and forcefully start quiz at index 0.
|
*/
function checkStartoverQuerystring(find_frame) {
    const startOverURL = new URLSearchParams(window.location.search);
    if (startOverURL.has('startover') == true) {
        for (const [key, value] of startOverURL) {
            if (value == 'yes') {
                var Quizify_dstrslt = { 'Quizify_dstrslt': true };
                find_frame[0].contentWindow.postMessage(Quizify_dstrslt, '*');
            }
        }
    }
}
/*
|-----------------------------------------------------------------------------
| FindmyQuizifyIframe() seek all quizify iframes to call some functions.
|-----------------------------------------------------------------------------
*/
function FindmyQuizifyIframe() {
    var QuizifyEle_by_class = document.getElementsByClassName("quizify");
    var QuizifyEle_by_id = document.getElementById("quizify"); // find div if it has id.

    if (QuizifyEle_by_id) {
        if (QuizifyEle_by_id != null || QuizifyEle_by_id != undefined) {
            QuizifyEmbed_find_by_ID_CLASS(QuizifyEle_by_id);
        }
    }
    if (QuizifyEle_by_class.length != 0) {
        for (var i = 0; i < QuizifyEle_by_class.length; i++) {
            if (QuizifyEle_by_class[i] != null || QuizifyEle_by_class[i] != undefined) {
                QuizifyEmbed_find_by_ID_CLASS(QuizifyEle_by_class[i]);
            }
        }
    }
}

function QuizifyEmbed_find_by_ID_CLASS(QuizifyEle) {
    var find_id = QuizifyEle.getAttribute("data-store-id");
    var find_frame = QuizifyEle.getElementsByClassName("quizifyIframe_" + find_id);
    if (find_frame.length != 0) {
        find_frame[0].addEventListener("onload", checkStartoverQuerystring(find_frame));
        find_frame[0].addEventListener("onload", GetQuizifyCartDetail(find_frame));
        StopQuizifyIframeFinder();
    }
    else {
        StopQuizifyIframeFinder();
    }
}

function StopQuizifyIframeFinder() {
    clearInterval(findquizframe);
}
var findquizframe = setInterval(FindmyQuizifyIframe, 300);
/*-----------End---Find quizify iframe code--------------*/


/*-----------Start---Data for popup quiz--------------*/
var shortcode_styelsheet = document.createElement('link');
shortcode_styelsheet.setAttribute('rel', 'stylesheet');
shortcode_styelsheet.setAttribute('href', 'https://quizify-dev.arhamcommerce.com/css/shortcode.css');
document.head.appendChild(shortcode_styelsheet);

var script_tag = document.createElement('script');
script_tag.setAttribute('src', 'https://quizify-dev.arhamcommerce.com/js/shortcode_popup_quiz.js');
document.head.appendChild(script_tag);
/*-----------End---Data for popup quiz--------------*/

Popquiz(); //Full screen quiz code

/*
|-----------------------------------------------------------------------------
| Track Analytics: It will find the product detail page and update line items
|                  as per product result page.
|-----------------------------------------------------------------------------
*/
(function () {
    const urlParts = window.location.pathname.split('/');
    const currentHandle = urlParts[urlParts.length - 1];

    const cookies = document.cookie.split(';');
    cookies.forEach(c => {
        const [rawName, rawValue] = c.trim().split('=');
        if (rawName.startsWith('quizify_analytics_track_')) {
            try {
                const parsed = JSON.parse(decodeURIComponent(rawValue));
                const quizID = parsed.quiz_id;
                const quizTitle = parsed.quiz_title || '';
                const quiz_shortcode = parsed.quiz_shortcode || '';
                const products = parsed.products || [];

                function addHiddenFieldsIfNeeded(form) {
                    if (!form.querySelector('input[name="properties[_Quizify Title]"]')) {
                        const hidden1 = document.createElement('input');
                        hidden1.type = 'hidden';
                        hidden1.name = 'properties[_Quizify Title]';
                        hidden1.value = quizTitle;

                        const hidden2 = document.createElement('input');
                        hidden2.type = 'hidden';
                        hidden2.name = 'properties[_Source]';
                        hidden2.value = 'Quizify';

                        const hidden3 = document.createElement('input');
                        hidden3.type = 'hidden';
                        hidden3.name = 'properties[_Quizify ID]';
                        hidden3.value = quizID;

                        form.appendChild(hidden1);
                        form.appendChild(hidden2);
                        form.appendChild(hidden3);

                        // console.log('Quizify: Added hidden fields to form');
                    }
                }

                function attachSubmitClick(form) {
                    const submitButtons = form.querySelectorAll('button[type="submit"]');
                    submitButtons.forEach(btn => {
                        if (!btn.dataset.quizifyAttached) { // avoid adding twice
                            btn.dataset.quizifyAttached = 'true';
                            btn.addEventListener('click', function () {
                                var data = {
                                    'analytic_type': 'add_to_cart',
                                    'shortcode_id': quiz_shortcode,
                                    'add_to_cart': 1,
                                    'quiz_domain': null
                                };
                                var params = new URLSearchParams(data).toString();

                                fetch(origin_URL + '/track_analytics', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                    body: params
                                })
                                    .then(response => {
                                        if (!response.ok) {
                                            throw new Error('Analytics tracking failed. Status: ' + response.status);
                                        }
                                        return response.text();
                                    })
                                    .then(() => {
                                        //   console.log('Quizify: Analytics tracked successfully');
                                    })
                                    .catch(error => {
                                        //   console.error('Quizify: Analytics error', error);
                                    });
                            });
                        }
                    });
                }

                // match by handle
                function processFormsByHandle() {
                    products.forEach(product => {
                        if (product.handle === currentHandle) {
                            const forms = document.querySelectorAll('form[action$="/cart/add"]');
                            forms.forEach(form => {
                                addHiddenFieldsIfNeeded(form);
                                attachSubmitClick(form);
                            });
                        }
                    });
                }

                // match by product id
                function processFormsByProductId() {
                    const forms = document.querySelectorAll('form[action$="/cart/add"]');
                    forms.forEach(form => {
                        const productIdInput = form.querySelector('input[name="product-id"]');
                        if (productIdInput) {
                            const formProductId = productIdInput.value;
                            products.forEach(product => {
                                const parts = product.id.split('/');
                                const cookieProductId = parts[parts.length - 1];
                                if (cookieProductId === formProductId) {
                                    addHiddenFieldsIfNeeded(form);
                                    attachSubmitClick(form);
                                }
                            });
                        }
                    });
                }

                // 🟢 STEP 1: on page load: check handle and product ids
                processFormsByHandle();
                processFormsByProductId();

                // 🟢 STEP 2: on click: do product-id check again + observe for new forms
                document.addEventListener('click', function () {
                    processFormsByProductId();

                    // observe for dynamically added forms for a few seconds
                    const observer = new MutationObserver(() => {
                        processFormsByProductId();
                    });
                    observer.observe(document.body, { childList: true, subtree: true });
                    setTimeout(() => observer.disconnect(), 3000);
                });

            } catch (e) {
                console.error('Quizify: Failed to parse quizify cookie data', e);
            }
        }
    });
})();

// =============================
// QUIZIFY OPEN PRODUCT HANDLER
// =============================
window.addEventListener("message", function (event) {
    if (!event.data) return;

    // Debug log for ALL incoming postMessages
    // console.log("[Quizify Shortcode.js] Received postMessage:", event.data);

    if (event.data.type === "quizify_open_product") {
        const url = event.data.url;

        // console.log("[Quizify Shortcode.js] Product URL request received:", url);

        if (url) {
            // console.log("[Quizify Shortcode.js] Opening product URL in parent window...");
            window.open(url, "_blank");

            // console.log("[Quizify Shortcode.js] URL opened successfully:", url);
        } else {
            // console.warn("[Quizify Shortcode.js] Received empty or invalid product URL.");
        }
    }
});

/*
|-----------------------------------------------------------------------------
| Event listener: All event listener list
|-----------------------------------------------------------------------------
*/
window.addEventListener("message", function (event) {
    if (event.data.view == 'customer_result') {
        HitToCheckout(event.data);
    }
    if (event.data.variant_id && event.data.action == 'AddQty') {
        var variant_id = event.data.variant_id;
        var fromNumber = 1;
        let isLastItem = true;
        var i = 1;
        var plain_quiz_id = event.data.plain_quiz_id; //New-Analytics-Code-S
        var plain_quiz_title = event.data.plain_quiz_title; //New-Analytics-Code-S
        var selectedSellingPlanValue = event.data.selectedSellingPlanValue; //Selling-plans
        var custom_input = event.data.custom_input;
        var quiz_prv_id = event.data.quiz_prv_id;
        var domain_name = null;
        addTocart(quiz_prv_id, variant_id, fromNumber, i, plain_quiz_id, plain_quiz_title, custom_input, type = 'single', selectedSellingPlanValue, isLastItem); //Add to cart call //Selling-plans
    }
    else if (event.data.variant_id && event.data.action == 'RemoveQty') {
        var variant_id = event.data.variant_id;
        var fromNumber = 1;
        removeQTY(variant_id, fromNumber);
    }
    //single add to cart

    //multiple cart
    if (event.data.all_variant) {
        var var_ids = event.data.all_variant;
        var custom_input = event.data.custom_input;
        var selectedSellingPlanValue = null; // Selling-plans
        var domain_name = null;
        var quiz_prv_id = event.data.quiz_prv_id;

        let index = 0;

        async function addNext() {
            if (index >= var_ids.length) {
                return;
            }

            try {
                await addTocart(
                    quiz_prv_id,
                    var_ids[index],
                    var_ids.length, // total
                    index + 1,        // current
                    plain_quiz_id,
                    plain_quiz_title,
                    custom_input,
                    'multiple',
                    selectedSellingPlanValue,
                    index == var_ids.length - 1
                );
            } catch (err) {
                // console.error('Add to cart failed for index', index, err);
            }

            index++;
            setTimeout(addNext, 1000); // wait before adding next
        }

        addNext();
    }

    //when quiz is submitted` with successfull response
    if (event.data == 'quizifyResult') {
        var evt = new CustomEvent('quizifyResult', { detail: this.response });
        window.dispatchEvent(evt);
        var check_popup = document.getElementsByClassName("quizify-pop-container");
        if (check_popup.length == 1) {
            var nFilter = document.getElementById('iframeid');
            nFilter.style.height = '99.9%';
            nFilter.style.overflow = 'auto';
            nFilter.style.minHeight = '99.9%';
            setTimeout(() => {

                nFilter.style.height = '100%';
                nFilter.style.minHeight = '100%';
            }, 5000);
        }
    }

    if (event.data.QuizifyResultCheckout == 'forwardToStore') {
        if (event.data.forward_to) {
            window.open("/" + event.data.forward_to, "_self");
        }
        else {
            window.open("/cart", "_self");
        }
    }

    if (event.data.type) {
        if (event.data.type == 'StorefrontMessage::ReplaceSection') {
            find_embed_iframe();
        }
    }
    if (event.data && event.data.name === 'quizify_global_track') {
        const quizID = event.data.quiz_id;
        const quizTitle = event.data.quiz_title || ''; // capture title if sent
        const quizShortcode = event.data.quiz_shortcode || ''; // capture title if sent
        const payload = event.data.payload;
        const cookieName = 'quizify_analytics_track_' + quizID;

        let storedObj = null;
        let storedArray = [];
        const existing = getAppCookie(cookieName);
        if (existing) {
            try {
                storedObj = JSON.parse(existing);
                storedArray = storedObj.products || [];
            } catch (e) { console.error('Failed to parse existing cookie JSON', e); }
        }

        // Merge new products
        const updatedArray = mergeUniqueProducts(storedArray, payload);

        // Build new cookie object
        const newCookieObj = {
            quiz_id: quizID,
            quiz_title: quizTitle,
            quiz_shortcode: quizShortcode,
            products: updatedArray
        };

        // Store back with 30 days expiry
        setAppCookie(cookieName, JSON.stringify(newCookieObj), 30);

    }
});


/*-----------------Start---Full screen quiz close preview code-------------*/
function CloseQuizPreview() {
    document.querySelectorAll('.quizify-pop-container').forEach(function (a) {
        a.remove();
    });
    const body_ef = document.getElementById("quizify_add_body_overflow");
    body_ef.remove();
    var check_pop_quiz = location.hash
    var PopupUrl = check_pop_quiz.substr(0, 12);
    if (check_pop_quiz) {
        if (PopupUrl == 'quizify-pop' || PopupUrl == '#quizify-pop' || PopupUrl == '/#quizify-pop') {
            window.location.hash = '';

            // popup close event
            var evt = new CustomEvent('quizifyPopupClosed');
            window.dispatchEvent(evt);
        }
    }
};
/*-----------------End---Full screen quiz close preview code-------------*/

/*-----------------Start---Full screen quiz code-------------*/
function Popquiz() {

    var check_pop_quiz = location.hash
    var PopupUrl = check_pop_quiz.substr(0, 12);
    var PopShorcodeLength = check_pop_quiz.split(PopupUrl + '-');
    // console.log('Quizify URL Analysis:', {
    //     hash: check_pop_quiz,
    //     popupUrl: PopupUrl,
    //     shortcodeLength: PopShorcodeLength
    // });

    if (check_pop_quiz) {
        if (PopupUrl == 'quizify-pop' || PopupUrl == '#quizify-pop' || PopupUrl == '/#quizify-pop') {
            document.body.classList.add("quizify_pop");
            document.querySelector("html").classList.add("quizify_pop");
            var GetShortcodeLength = PopShorcodeLength[1].length;

            var quizify_prv_by_id = document.getElementById("quizifybadge"); // find div if it has id.
            if (GetShortcodeLength > 3) {
                var domain_name = null;
            }
            else {
                if (quizify_prv_by_id != null) {
                    var domain_name = quizify_prv_by_id.getAttribute("data-domain");
                }
            }

            // Extract locale from query string or use Shopify.locale if available, otherwise use null
            var locale = null;
            var urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('locale')) {
                locale = urlParams.get('locale');
            } else if (typeof Shopify !== 'undefined' && Shopify.locale) {
                locale = Shopify.locale;
            }

            ////Build quiz elements////
            var left_text = check_pop_quiz.split('#quizify-pop-');
            shortcode_id = left_text[1];

            // Parse size parameter from URL
            var size = 'fullsize'; // default size
            if (left_text[1] && left_text[1].includes('&size=')) {
                var sizeParts = left_text[1].split('&size=');
                shortcode_id = sizeParts[0]; // Update shortcode_id to remove size parameter
                if (sizeParts[1]) {
                    size = sizeParts[1];
                }
            }

            var first_quiz_div = document.createElement('div');
            first_quiz_div.className = "quizify-pop-container";
            first_quiz_div.setAttribute("style", "display: block;position:relative");
            first_quiz_div.setAttribute("id", "QuizifyPopContainer");
            var loader_backdrop = document.createElement('div');
            loader_backdrop.className = "quizify_backdrop";
            loader_backdrop.setAttribute("style", "display: block !important;");
            let loader = document.createElement('div');
            loader.className = "quizify_loading";
            loader.setAttribute("style", "display: block !important;");
            var second_quiz_div = document.createElement('div');
            second_quiz_div.className = "quizify-pop-inner";
            second_quiz_div.setAttribute("style", "display: block;margin:0;border:0;padding:0;outline: 0;box-sizing: border-box;position: fixed;top: 0px;left: 0px;width: 100%;height: 100%;background-color: rgba(0, 0, 0, 0.5);z-index: 9999999;");

            var third_quiz_div = document.createElement('div');
            third_quiz_div.className = "quizify-fullscreen-sec " + size + " quizify_" + shortcode_id;
            third_quiz_div.setAttribute("style", "opacity: 1;position: relative;width: 100%;height: 80%;max-width: 1280px;margin: 0px auto;border-radius: 8px;padding: 0px;z-index: 22;top: 50%;transform: translateY(-50%);box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px;display: flex;flex-flow: column;overflow: hidden;");

            var fourth_quiz_div = document.createElement('iframe');

            function setAttributes(el, attrs) {
                for (var key in attrs) {
                    el.setAttribute(key, attrs[key]);
                }
            }
            setAttributes(fourth_quiz_div, {
                "id": "iframeid",
                "data-domain": window.location.host,
                'data-type': 'quizify-popup',
                'title': 'Quizify ‑ Product Quiz Builder',
                "src": Api + "/" + shortcode_id + "/" + (domain_name || 'null') + "/" + (locale || 'null') + '?quizify-pop-quiz',
                "style": "width: 100%;height:100%;min-height: 100%; border:none; overflow:scroll;  top:0px; left:0px; bottom:0px;display: block;"
            });
            fourth_quiz_div.onload = function () {
                let loadingElement = document.getElementsByClassName("quizify_loading")[0];
                let loadingdrop = document.getElementsByClassName("quizify_backdrop")[0];
                if (loadingElement) {
                    loadingElement.remove();
                }
                if (loadingdrop) {
                    loadingdrop.remove();
                }
            };
            // console.log('Quizify Container Created:', {
            //     className: third_quiz_div.className,
            //     size: size,
            //     shortcodeId: shortcode_id
            // });
            var add_overflow_body =
                'body {' +
                'overflow:hidden' +
                '}';
            var setDeleteprop =
                '.quizify-close-btn {' +
                'position: absolute;' +
                'right: 20px;' +
                'top: 20px;' +
                'width: 25px;' +
                'height: 25px;' +
                'opacity: 0.3;' +
                'z-index: 2147483647;' +
                'cursor:pointer;' +
                '}';
            setDeleteprop +=

                setDeleteprop += '@media(max-width:1024px){' +
                '.quizify-close-btn {' +
                'top: 20px;' +
                'right: 30px;' +
                '}' +
                '}';
            setDeleteprop +=
                '.quizify_backdrop{' +
                'position: fixed;' +
                ' top: 0;' +
                'left: 0;' +
                'height: 100%;' +
                'width: 100%;' +
                'background-color: #ffffff;' +
                'opacity: 0.7;' +
                'z-index: 2147483646;' +
                '}';
            setDeleteprop +=
                '.quizify_loading {' +
                'height: 5px;' +  // Set the height to match quizify-loader
                'width: 150px;' + // Set the width to match quizify-loader
                'border-radius: 20px;' + // Border radius from quizify-loader
                'background: #ddd;' + // Background color from quizify-loader
                'position: fixed;' +
                'left: 50%;' +
                'top: 50%;' +
                'transform: translate(-50%, -50%);' + // Center it like quizify-loader
                'z-index: 2147483647;' +
                'overflow: hidden;' +
                '}' +
                '.quizify_loading::before {' +
                'content: "";' +
                'display: block;' +
                'height: 100%;' +
                'width: 0;' +
                'background: #000;' +
                'animation: progress 10s linear infinite;' +
                '}' +
                '@keyframes progress {' +
                '100% {' +
                'width: 100%;' +
                '}' +
                '}';
            setDeleteprop += '.quizify-close-btn:hover {' +
                'opacity: 1;' +
                '}';
            setDeleteprop += '.quizify-close-btn:before, .quizify-close-btn:after {' +
                ' position: absolute;' +
                'left: 15px;' +
                ' content: " ";' +
                ' height: 25px;' +
                ' width: 2px;' +
                'background-color: #333;' +
                '}';
            setDeleteprop += '.quizify-close-btn:before {' +
                ' transform: rotate(45deg);' +
                '}';
            setDeleteprop += '.quizify-close-btn:after {' +
                'transform: rotate(-45deg);' +
                '}';

            var closeEle = document.createElement('style');
            closeEle.type = 'text/css';
            closeEle.appendChild(document.createTextNode(setDeleteprop));

            var add_body_of = document.createElement('style');
            add_body_of.type = 'text/css';
            add_body_of.setAttribute("id", 'quizify_add_body_overflow');
            add_body_of.appendChild(document.createTextNode(add_overflow_body));

            var closeIcon = document.createElement('span');
            closeIcon.className = "quizify-close-btn";
            closeIcon.setAttribute("onclick", 'CloseQuizPreview()'); //Full screen quiz close preview code
            ////Append quiz props to body////

            document.body.append(first_quiz_div);
            document.head.append(closeEle, add_body_of);
            first_quiz_div.appendChild(second_quiz_div);
            first_quiz_div.appendChild(loader_backdrop);
            first_quiz_div.appendChild(loader);
            second_quiz_div.appendChild(third_quiz_div);
            third_quiz_div.appendChild(closeIcon);
            third_quiz_div.appendChild(fourth_quiz_div);

            // Add size-specific CSS
            var sizeStyles = `
                /* Fullsize*/
                .quizify-fullscreen-sec.fullsize {
                    max-width: 100% !important;
                    height: 100% !important;
                }
                
                /* Medium size*/
                .quizify-fullscreen-sec.medium {
                    max-width: 1280px !important;
                    height: 80% !important;
                    box-shadow: unset !important;
                    padding: 20px !important;
                }
                .quizify-fullscreen-sec.medium .quizify-close-btn {
                    right: 35px !important;
                    top: 35px !important;
                }
                .quizify-fullscreen-sec.medium iframe{
                    border-radius: 8px;
                    box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px;
                }

                 /* Small size*/
                .quizify-fullscreen-sec.small {
                    max-width: 840px !important;
                    height: 60% !important;
                    padding: 20px !important;
                    box-shadow: unset !important;
                }
                .quizify-fullscreen-sec.small .quizify-close-btn {
                    right: 35px !important;
                    top: 35px !important;
                }
                .quizify-fullscreen-sec.small iframe{
                    border-radius: 8px;
                    box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px;
                }

                /*client close button CSS*/
                .quizify-fullscreen-sec.quizify_17b488286538fb82e8b39b987cde4063 .quizify-close-btn {
                    opacity: 1 !important;
                }
               
                
            `;

            var styleElement = document.createElement('style');
            styleElement.type = 'text/css';
            styleElement.appendChild(document.createTextNode(sizeStyles));
            document.head.appendChild(styleElement);


            var PopAccessByquizify = { 'PopAccessByquizify': true };
            setTimeout(function () {
                var destination = document.getElementById('iframeid').contentWindow;
                destination.postMessage(PopAccessByquizify, '*');
            }, 1000);
        }
    }
}
/*-----------------End---Full screen quiz code-------------*/

/*
|-----------------------------------------------------------------------------
| Quiz Embed preview start
|-----------------------------------------------------------------------------
*/
find_embed_iframe();
function find_embed_iframe() {
    var quizify_prv_by_id = document.getElementById("quizify"); // find div if it has id.
    var quizify_prv_by_class = document.getElementsByClassName("quizify"); // find div if it has classes.

    // Condition for check div with classes.
    if (quizify_prv_by_class.length != 0) {
        for (var qr = 0; qr < quizify_prv_by_class.length; qr++) {
            if (quizify_prv_by_class[qr] != null || quizify_prv_by_class[qr] != undefined) {
                embed_iframe(quizify_prv_by_class[qr]);
            }
        }
    }
    else {
        // Condition for check div only with id.
        if (quizify_prv_by_id) {
            if (quizify_prv_by_id != null || quizify_prv_by_id != undefined) {
                embed_iframe(quizify_prv_by_id);
            }
        }
    }
}
function preventeDuplication() {
    const maxAttempts = 33; // ~10 seconds
    let attempts = 0;
    const interval = setInterval(() => {
        const success = hideDuplicateIframe();
        attempts++;
        if (success || attempts >= maxAttempts) {
            clearInterval(interval);
        }
    }, 300);

}
function hideDuplicateIframe() {
    const container = document.querySelector(".quizify");
    if (!container) return;

    const iframes = container.querySelectorAll("iframe#iframeid");
    if (iframes.length > 1) {
        iframes[1].style.display = "none";
        return true; // Stop polling
    }
    return false; // Keep polling
}


function embed_iframe(quizify_prv) {
    // Force Quizify Shopify App Block to full width
    // 1. Force quizify itself
    quizify_prv.style.width = '100%';
    quizify_prv.style.maxWidth = '100%';
    quizify_prv.style.display = 'block';
    quizify_prv.style.boxSizing = 'border-box';

    // 2. Fix rte-formatter if present
    const rteWrapper = quizify_prv.closest('rte-formatter');

    if (rteWrapper) {
        console.log('[Quizify] Found rte-formatter wrapper:', rteWrapper);

        rteWrapper.style.width = '100%';
        rteWrapper.style.maxWidth = '100%';
        rteWrapper.style.display = 'block';
        rteWrapper.style.setProperty('--width', '100%');
        rteWrapper.style.setProperty('--max-width', '100%');

    }

    // 3. Also handle Shopify App Block if present
    const appBlock = quizify_prv.closest('.shopify-app-block[data-block-handle="quizify_preview"]');
    if (appBlock) {
        console.log('[Quizify] Found Shopify App Block wrapper:', appBlock);
        appBlock.style.width = '100%';
        appBlock.style.maxWidth = '100%';
    }

    var get_id = quizify_prv.getAttribute("data-store-id");
    var get_shop_domain = quizify_prv.getAttribute("data-shop-domain");
    var quizify_domain_tail = null;

    shortcode_id = get_id;
    if (get_id.length <= 3) {
        quizify_domain_tail = get_shop_domain;
    }
    else {
        quizify_domain_tail = null;
    }

    // Extract locale from query string or use Shopify.locale if available, otherwise use null
    var locale = null;
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('locale')) {
        locale = urlParams.get('locale');
    } else if (typeof Shopify !== 'undefined' && Shopify.locale) {
        locale = Shopify.locale;
    }

    // AccessQuizFrameLoader(get_id,quizify_prv,quizify_domain_tail);

    var iframe = document.createElement('iframe');
    iframe.id = 'iframeid';
    iframe.onload = function () {
        AccessQuizFrameLoaderAfter(quizify_prv); // Ensure this function exists and works
    };
    iframe.setAttribute('data-frameid', get_id);
    iframe.setAttribute('class', 'quizifyIframe_' + get_id);
    iframe.setAttribute('data-domain', quizify_domain_tail);
    iframe.setAttribute('title', 'Quizify ‑ Product Quiz Builder');
    iframe.src = Api + "/" + get_id + "/" + (quizify_domain_tail || 'null') + "/" + (locale || 'null');
    iframe.style = 'display: block; top:0px; left:0px; bottom:0px;min-height:500px;right:0px; width:100%;border:none; margin:0; padding:0; overflow:hidden; z-index:999999;';

    // Append the iframe to the parent element
    quizify_prv.appendChild(iframe);
    preventeDuplication();
    /*-----------------Start---Iframe height resize call-------------*/
    var find_frame;
    function resize_iframe_page() {
        window.addEventListener("message", myListener, false);

        function myListener(event) {
            if (event.origin !== origin_URL) {
                return;
            }
        }
        var zino_resize = function (event) {
            if (event.origin !== origin_URL) {
                return;
            }
            var get_post_id;
            if (event.data != undefined || event.data != 'undefined' && event.data.quiz_ids) {
                if (event.data.quiz_ids && event.data.quiz_ids.quiz_shortcode_id) {
                    get_post_id = event.data.quiz_ids.quiz_shortcode_id;
                    find_frame = quizify_prv.getElementsByClassName("quizifyIframe_" + get_post_id);
                }
            }

            if (find_frame && find_frame.length == 1) {
                var quizheight = 0;
                var midpix = 0;
                if (event.data != undefined || event.data != 'undefined') {
                    if (event.data.quizify_frame_height) {
                        quizheight = event.data.quizify_frame_height;
                        midpix = quizheight + 50;
                        find_frame[0].style.height = quizheight + "px";
                    }
                    if (event.data.autoscroll) {
                        if (event.data.autoscroll == 'true' || event.data.autoscroll == true) {
                            const yOffset = -event.data.ScrollToTop;
                            const y = find_frame[0].getBoundingClientRect().top + window.pageYOffset + yOffset;
                            window.scrollTo({
                                top: y,
                                behavior: 'smooth'
                            });
                        }
                    }
                    // if (quizheight <= 100) {
                    //     midpix = quizheight + 450;
                    // }
                    // else {
                    // }

                } else {
                    find_frame[0].style.minHeight = '500px';
                }
                setTimeout(function () {
                    if (event.data == "No_frame") {
                        find_frame[0].remove()
                    }
                }, 1000);
            }
        };
        if (window.addEventListener) {
            window.addEventListener("message", zino_resize, false);

        } else if (window.attachEvent) {
            window.attachEvent("onmessage", zino_resize);

        }
    }

    /*-----------------End---Iframe height resize call-------------*/

    resize_iframe_page(); //Iframe height resize call

    window.onresize = function (event) {
        resize_iframe_page(); //Iframe height resize call
    };
}
function AccessQuizFrameLoaderAfter() {
    const loaderContainer = document.querySelector('.quizify-loader');
    if (loaderContainer) {
        loaderContainer.remove();
    }
}

/*
|-----------------------------------------------------------------------------
| Customer result widget start
|-----------------------------------------------------------------------------
*/
var customer_resultby_id = document.getElementById("quizifyresults"); // find div if it has id.
var customer_resultby_class = document.getElementsByClassName("quizifyresults"); // find div if it has classes.
// Condition for check div with classes.
if (customer_resultby_class.length != 0) {
    for (var cr = 0; cr < customer_resultby_class.length; cr++) {
        if (customer_resultby_class[cr] != null || customer_resultby_class[cr] != undefined) {
            load_result_widgets(customer_resultby_class[cr]);
        }
    }
}
// Condition for check div only with id.
if (customer_resultby_id) {
    if (customer_resultby_id != null || customer_resultby_id != undefined) {
        load_result_widgets(customer_resultby_id);
    }
}
/*
| Load result function intialize for both id and classes condition.
*/
function load_result_widgets(customer_result) {
    var str = customer_result.innerHTML;
    var get_email_id = customer_result.getAttribute("data-source");
    var QuizId = customer_result.getAttribute("data-id");
    var encrypted_email;
    //data-shop-domain
    var getfrom_ls = localStorage.getItem("Quizify_result_widget" + QuizId);
    var check_domain = customer_result.hasAttribute("data-shop-domain");
    var quizify_domain_tail = null;
    if (check_domain == true) {
        var get_shop_domain = customer_result.getAttribute("data-shop-domain");
        quizify_domain_tail = get_shop_domain;
    }
    else {
        quizify_domain_tail = null;
    }

    if (getfrom_ls != null) {
        encrypted_email = getfrom_ls;
        customer_result.setAttribute("data-source", getfrom_ls);
    }
    else if (getfrom_ls != undefined) {
        encrypted_email = getfrom_ls;
        customer_result.setAttribute("data-source", getfrom_ls);
    }
    else {
        if (get_email_id == '' || get_email_id == undefined || get_email_id == '{{ customer.email }}') {
            encrypted_email = 'emailNotdefine';
        }
        else {
            encrypted_email = window.btoa(get_email_id);
            customer_result.setAttribute("data-source", encrypted_email);
        }
    }
    if (check_domain == true) {
        var res_one = str.replace("" + str + "", "<iframe id='quizify_result_frame' title='Quizify ‑ Product Quiz Builder' class='quizify_result_frame' data-domain='" + quizify_domain_tail + "' src=" + Api_response + "/" + encrypted_email + "/" + QuizId + "/" + quizify_domain_tail + " style='display: block; top:0px; left:0px; bottom:0px;height:700px;min-height:700px;right:0px; width:100%;border:none; margin:0; padding:0; overflow:hidden; z-index:999999;' ></iframe>");
        customer_result.innerHTML = res_one;
    }
    else {
        var res_two = str.replace("" + str + "", "<iframe id='quizify_result_frame' title='Quizify ‑ Product Quiz Builder' data-domain='" + quizify_domain_tail + "' src=" + Api_response + "/" + encrypted_email + "/" + QuizId + " style='display: block; top:0px; left:0px; bottom:0px;height:700px;min-height:700px;right:0px; width:100%;border:none; margin:0; padding:0; overflow:hidden; z-index:999999;' ></iframe>");
        customer_result.innerHTML = res_two;
    }


    function get_height_of_response_page() {
        window.addEventListener("message", myListener, false);
        function myListener(event) {
            if (event.origin !== origin_URL) {
                return;
            }
        }
        var get_heightofresponse_iframe = function (event) {
            if (event.origin !== origin_URL) {
                return;
            }

            var response_iframe = document.getElementById('quizify_result_frame');
            if (response_iframe) {
                if (event.data != undefined || event.data != 'undefined') {
                    if (event.data.enc_email) {

                        var email_enc = event.data.enc_email;
                        customer_result.setAttribute("data-source", email_enc);
                        localStorage.setItem("Quizify_result_widget" + QuizId, email_enc);
                    }
                }
            }
        };
        if (window.addEventListener) {
            window.addEventListener("message", get_heightofresponse_iframe, false);
        } else if (window.attachEvent) {
            window.attachEvent("onmessage", get_heightofresponse_iframe);
        }
    }

    get_height_of_response_page(); //Iframe height resize call
    window.onresize = function (event) {
        get_height_of_response_page(); //Iframe height resize call
    };
}
/*
| Customer result widget over
*/


/*-----------------Start---Add to cart call-------------*/
function addTocart(quiz_prv_id, variant_id, fromNumber, i, plain_quiz_id, plain_quiz_title, custom_input, type, selectedSellingPlanValue, isLastItem) {
    return new Promise((resolve, reject) => {
        var find_frame, get_shop_domain;
        var check_frame = document.getElementsByClassName("quizifyIframe_" + quiz_prv_id);
        var pop_up_irfame_id = document.getElementById('popup_iframe_id');

        if (check_frame.length != 0) {
            find_frame = check_frame;
            get_shop_domain = find_frame[0].getAttribute("data-domain");
        }
        else if (pop_up_irfame_id != null && pop_up_irfame_id.length != 0) {
            find_frame = document.getElementById('popup_iframe_id');
            get_shop_domain = find_frame.getAttribute("data-domain");
        }
        else {
            find_frame = document.getElementById('iframeid');
            get_shop_domain = find_frame.getAttribute("data-domain");
        }

        var xhr = new XMLHttpRequest();
        xhr.open("POST", '/cart/add.js', true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    // (your existing logic here)
                    var add_to_cart_info = {
                        'analytic_type': 'add_to_cart',
                        'shortcode_id': shortcode_id,
                        'add_to_cart': i,
                        'quiz_domain': (shortcode_id.length <= 3) ? get_shop_domain : null
                    };
                    if (isLastItem) {
                        setTimeout(function () {
                            var frameID = document.getElementsByClassName("quizifyIframe_" + quiz_prv_id);
                            if (frameID.length != 0) {
                                frameID[0].contentWindow.postMessage(add_to_cart_info, '*');
                                var evt = new CustomEvent('quizifyAddToCart', { detail: xhr.response });
                                window.dispatchEvent(evt);
                                UpdateCartBag();
                            }
                            else if (document.getElementById('popup_iframe_id')) {
                                document.getElementById('popup_iframe_id').contentWindow.postMessage(add_to_cart_info, '*');
                                var evt = new CustomEvent('quizifyAddToCart', { detail: xhr.response });
                                window.dispatchEvent(evt);
                                UpdateCartBag();
                            }
                            else {
                                let iframe_id = document.getElementById('iframeid');
                                if (iframe_id.length != 0) {
                                    iframe_id.contentWindow.postMessage(add_to_cart_info, '*');
                                    var evt = new CustomEvent('quizifyAddToCart', { detail: xhr.response });
                                    window.dispatchEvent(evt);
                                    UpdateCartBag();
                                }
                            }
                        }, 1000);
                    }
                    else {
                        var continue_cart = {
                            'continue_cart': true,
                            'variant_id': variant_id,
                        }
                        setTimeout(function () {
                            var frameID = document.getElementsByClassName("quizifyIframe_" + quiz_prv_id);
                            if (frameID.length != 0) {
                                frameID[0].contentWindow.postMessage(continue_cart, '*');
                            }
                            else if (document.getElementById('popup_iframe_id')) {
                                document.getElementById('popup_iframe_id').contentWindow.postMessage(continue_cart, '*');
                            }
                        }, 1000);
                    }
                    resolve(xhr.response); // ✅ resolve when done
                } else {
                    reject(this.statusText || 'Add to cart failed');
                }
            }
        }

        // (keep your existing xhr.send(...) logic)
        if (type == 'single') {
            var xhrSendData = 'quantity=' + 1 + '&id=' + variant_id + '&properties[_Source]=Quizify' + '&properties[_Quizify ID]=' + plain_quiz_id + '&properties[_Quizify Title]=' + plain_quiz_title;
            if (custom_input) {
                xhrSendData += "&properties[" + custom_input.custom_input_label + "]=" + custom_input.custom_input_value;
            }
            if (selectedSellingPlanValue) {
                xhrSendData += "&selling_plan=" + selectedSellingPlanValue;
            }
            xhr.send(xhrSendData);
        }
        else {
            if (custom_input == undefined || custom_input == null || custom_input == '') {
                xhr.send('quantity=' + 1 + '&id=' + variant_id + '&properties[_Source]=Quizify' + '&properties[_Quizify ID]=' + plain_quiz_id + '&properties[_Quizify Title]=' + plain_quiz_title);
            }
            else {
                if (custom_input.length == 0) {
                    xhr.send('quantity=' + 1 + '&id=' + variant_id + '&properties[_Source]=Quizify' + '&properties[_Quizify ID]=' + plain_quiz_id + '&properties[_Quizify Title]=' + plain_quiz_title);
                }
                else {
                    const custom_inputs_ids = custom_input.filter(item => item.id === variant_id);
                    if (custom_inputs_ids.length == 1) {
                        xhr.send('quantity=' + 1 + '&id=' + variant_id + '&properties[_Source]=Quizify' + '&properties[_Quizify ID]=' + plain_quiz_id + '&properties[_Quizify Title]=' + plain_quiz_title + '&properties[' + custom_inputs_ids[0].custom_label + ']=' + custom_inputs_ids[0].custom_input);
                    }
                    else {
                        xhr.send('quantity=' + 1 + '&id=' + variant_id + '&properties[_Source]=Quizify' + '&properties[_Quizify ID]=' + plain_quiz_id + '&properties[_Quizify Title]=' + plain_quiz_title);
                    }
                }
            }
        }
    });
}

function HitToCheckout(data) {
    if (data.ids) {
        var string_ids = JSON.stringify(data.ids);
        var final_string = string_ids.replace(/[{()}"]/g, '');
        var plain_quiz_id = data.plain_quiz_id; //New-Analytics-Code-S
        var plain_quiz_title = data.plain_quiz_title; //New-Analytics-Code-S
        //   var url = 'https://'+ data.domain + '/cart/' + final_string +'?properties[_Source]=Quizify' +'&properties[_Quizify ID]='+plain_quiz_id +'&properties[_Quizify Title]='+plain_quiz_title;
        var url = 'https://' + data.domain + '/cart/' + final_string;
        window.open(url, '_blank');
    }
}
/*-----------------End---Add to cart call-------------*/

/*-----------------Start---Reomove product quantity call-------------*/
function removeQTY(variant_id, fromNumber) {
    GETdata('/cart.js', function (cart) {
        var shopifyCart = cart;
        shopifyCart.items.forEach(function (item) {
            if (item.id == variant_id) {
                var q = item.quantity - 1;
                if (q < 0) {
                    q = 0;
                }
                var ud = {};
                ud[variant_id] = q;

                POSTdata(
                    '/cart/update.js',
                    { updates: ud },
                    function (response) {
                        UpdateCartBag();
                    });
            }
        });
    });
}
/*-----------------End---Reomove product quantity call-------------*/

function accessHTML(items) {
    if (items && items.length > 0) {
        GETdata('/cart.js', function (cart) {
            for (var i = 0; i < items.length; i++) {
                var el = items[i];
                el.innerHTML = cart.item_count;
            }
        });
    }
}
function GETdata(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
            callback(JSON.parse(xmlHttp.responseText));
        }
    };
    xmlHttp.open('GET', theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}
function POSTdata(theUrl, theJson, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
            callback(JSON.parse(xmlHttp.responseText));
        }
    };
    xmlHttp.open('POST', theUrl, true); // true for asynchronous
    xmlHttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xmlHttp.send(JSON.stringify(theJson));
}
function UpdateCartBag() {
    GETdata('/cart.js', function (cart) {
        const cartCount = cart.item_count;  // Get item count
        const cartIconBubble = document.querySelector('#cart-icon-bubble'); // Select the main cart icon element
        let cartCountBubble = cartIconBubble.querySelector('.cart-count-bubble'); // Check if count bubble already exists

        if (cartCount > 0) {
            if (!cartCountBubble) {
                // Create the cart-count-bubble if it doesn't exist
                cartCountBubble = document.createElement('div');
                cartCountBubble.className = 'cart-count-bubble';
                cartCountBubble.innerHTML = `
                        <span aria-hidden="true">${cartCount}</span>
                        <span class="visually-hidden">${cartCount} item${cartCount > 1 ? 's' : ''}</span>
                    `;
                // Append the bubble to the cart icon
                cartIconBubble.appendChild(cartCountBubble);
            } else {
                // If the bubble exists, just update the count
                cartCountBubble.querySelector('span[aria-hidden="true"]').textContent = cartCount;
                cartCountBubble.querySelector('.visually-hidden').textContent = `${cartCount} item${cartCount > 1 ? 's' : ''}`;
            }
        } else {
            // If the cart is empty and the count bubble exists, remove it
            if (cartCountBubble) {
                cartCountBubble.remove();
            }
        }
    });
}

function getAppCookie(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
    return null;
}

// Helper to set cookie
function setAppCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/";
}

// Helper to merge arrays by unique product id
function mergeUniqueProducts(existing, incoming) {
    const ids = new Set(
        existing.filter(p => p && p.id).map(p => p.id)
    );

    incoming.forEach(p => {
        if (p && p.id && !ids.has(p.id)) {
            existing.push(p);
            ids.add(p.id);
        }
    });

    return existing;
}

/*-------------------------------------------Cart Drawer-------------------------------------------*/
const quizParser = new DOMParser();
const quizParseHTML = (html) => quizParser.parseFromString(html, 'text/html');
const quizDelay = (ms) => new Promise(r => setTimeout(r, ms));
const quizEmptyClasses = ['is-empty', 'cart-drawer--empty'];

const quizGetCartDrawer = () => document.querySelector('.cart-drawer__dialog');
const quizRemoveEmptyClasses = (el) => el?.classList.remove(...quizEmptyClasses);

// SINGLE UNIFIED EVENT LISTENER - Works with ALL Shopify themes
window.addEventListener("quizifyAddToCart", async function () {
    //   console.log('=== Cart update started ===');
    await quizDelay(800);
    try {
        const quizCart = await fetch('/cart.js').then(r => r.json());
        // console.log('Current cart:', quizCart.item_count, 'items');
        const quizCartDrawer = quizGetCartDrawer();
        quizCartDrawer?.querySelector('dialog[open]')?.close();
        const quizDetails = quizCartDrawer?.querySelector('details[open]');
        if (quizDetails) quizDetails.open = false;
        await quizDelay(200);
        // Fetch fresh sections for NEW themes
        const quizSectionsUrl = `${window.location.pathname}?sections=cart-drawer,header&_=${Date.now()}`;
        const quizSections = await fetch(quizSectionsUrl).then(r => r.json());

        // Update cart-drawer (NEW THEME - Dawn 2.0+, Refresh, etc)
        if (quizSections['cart-drawer']) {
            const quizNewDrawer = quizParseHTML(quizSections['cart-drawer']).querySelector('.cart-drawer__dialog');
            const quizCurrentDrawer = quizGetCartDrawer();

            if (quizNewDrawer && quizCurrentDrawer) {
                quizCurrentDrawer.outerHTML = quizNewDrawer.outerHTML;
                // console.log('✓ New theme: Cart drawer replaced');
                if (quizCart.item_count > 0) quizRemoveEmptyClasses(quizGetCartDrawer());
            }
        }

        // Update header
        if (quizSections['header']) {
            const quizSectionDiv = document.getElementById('shopify-section-header');
            const quizNewSection = quizParseHTML(quizSections['header']).querySelector('.shopify-section');
            if (quizSectionDiv && quizNewSection) {
                quizSectionDiv.innerHTML = quizNewSection.innerHTML;
                // console.log('✓ Header updated');
            }
        }

        // Update OLD THEME cart-drawer (Dawn 1.0, Sense, Craft, etc)
        await quizUpdateOldThemeCartDrawer();
        await quizUpdateCartItems();
        await quizDelay(100);
        quizOpenCartDrawer();
    } catch (error) {
        // console.error('Error updating cart:', error);
        quizOpenCartDrawer();
    }
});

// Update OLD THEME cart-drawer element (Dawn 1.0, Sense, Craft, Studio, etc)
async function quizUpdateOldThemeCartDrawer() {
    const quizOldCartDrawer = document.querySelector('cart-drawer');
    if (!quizOldCartDrawer) {
        // console.log('Old theme cart-drawer not found');
        return;
    }

    //   console.log('Updating OLD theme cart-drawer...');
    try {
        const quizHtml = await fetch(`${window.location.pathname}?section_id=cart-drawer&_=${Date.now()}`).then(res => res.text());
        const quizDoc = quizParseHTML(quizHtml);
        const quizNewDrawer = quizDoc.querySelector('cart-drawer');

        if (quizNewDrawer && quizOldCartDrawer) {
            quizOldCartDrawer.innerHTML = quizNewDrawer.innerHTML;
            quizOldCartDrawer.classList.remove('is-empty');
            //   console.log('✓ Old theme: cart-drawer updated');
        }
    } catch (err) {
        // console.log('Old theme cart update error:', err);
    }
}

// Update cart items component (for NEW themes with cart-items-component)
async function quizUpdateCartItems() {
    const quizCartItemsComponent = document.querySelector('cart-items-component');
    const quizCartBubble = document.querySelector('.cart-bubble, .cart-count-bubble');
    //   console.log('Cart items component found:', !!quizCartItemsComponent);
    if (!quizCartItemsComponent && !quizCartBubble) return;

    try {
        const quizHtml = await fetch(location.href + '?_=' + Date.now()).then(res => res.text());
        const quizDoc = quizParseHTML(quizHtml);

        if (quizCartItemsComponent) {
            const quizFreshCartItems = quizDoc.querySelector('cart-items-component');
            if (quizFreshCartItems) {
                quizCartItemsComponent.innerHTML = quizFreshCartItems.innerHTML;
                // console.log('✓ Cart items component reloaded');
                quizRemoveEmptyClasses(quizGetCartDrawer());
            }
        }

        if (quizCartBubble) {
            const quizFreshBubble = quizDoc.querySelector('.cart-bubble, .cart-count-bubble');
            if (quizFreshBubble) {
                quizCartBubble.innerHTML = quizFreshBubble.innerHTML;
                quizCartBubble.classList.remove('visually-hidden');
                // console.log('✓ Cart bubble updated');
            }
        }
    } catch (err) {
        // console.log('Cart items update error:', err);
    }
}

// Universal cart drawer opener - Works with ALL Shopify themes
function quizOpenCartDrawer() {
    //   console.log('Opening cart drawer...');
    // Method 1: OLD THEME - Dawn 1.0, Sense, Craft (cart-drawer element)
    const quizOldCartDrawer = document.querySelector('cart-drawer');
    if (quizOldCartDrawer) {
        quizOldCartDrawer.classList.add('active');
        quizOldCartDrawer.classList.remove('is-empty');

        const quizDetails = quizOldCartDrawer.querySelector('details');
        if (quizDetails) {
            quizDetails.open = true;
        }

        document.body.classList.add('overflow-hidden');
        // console.log('✓ Opened OLD theme cart-drawer');
        return;
    }

    // Method 2: NEW THEME - Click cart button
    const quizCartButtons = [
        document.querySelector('button[aria-describedby*="cart"]'),
        document.querySelector('button[aria-label*="Cart"]'),
        document.querySelector('button[aria-label*="Carrito"]'),
        document.querySelector('[data-cart-toggle]'),
        document.querySelector('button[aria-controls*="cart"]'),
        document.querySelector('.cart-toggle'),
        document.querySelector('#cart-icon-bubble'),
        document.querySelector('.cart-icon-bubble'),
        document.querySelector('a[href*="/cart"]')
    ];

    const quizCartBtn = quizCartButtons.find(btn => btn !== null);

    if (quizCartBtn) {
        // console.log('✓ Clicking cart button');
        quizCartBtn.click();
        return;
    }

    console.log('Cart button not found, trying direct methods...');

    // Method 3: NEW THEME - Direct drawer manipulation
    const quizNewDrawer = quizGetCartDrawer();
    if (quizNewDrawer) {
        quizRemoveEmptyClasses(quizNewDrawer);

        const quizDetails = quizNewDrawer.querySelector('details') || quizNewDrawer.closest('details');
        if (quizDetails) {
            quizDetails.open = true;
            //   console.log('✓ Opened via details.open');
            return;
        }

        quizNewDrawer.classList.add('is-open', 'active');
        // console.log('✓ Opened via class');
        return;
    }

    // Method 4: Generic drawer fallback
    const quizGenericDrawers = [
        document.querySelector('#cart-drawer'),
        document.querySelector('.cart-drawer'),
        document.querySelector('[data-cart-drawer]')
    ];

    const quizDrawer = quizGenericDrawers.find(d => d !== null);

    if (quizDrawer) {
        quizDrawer.classList.add('active', 'is-open');
        quizDrawer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('overflow-hidden');
        // console.log('✓ Opened generic drawer');
        return;
    }

    //   console.log('⚠ Could not find cart drawer to open');
}
/*-------------------------------------------Cart Drawer-------------------------------------------*/