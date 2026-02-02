/*-------------------------Start Default Variables----------------------*/
var origin_popup_URL = "https://quizify-dev.arhamcommerce.com";

var path_name = document.location.pathname;
var current_page = '';
var popupStack = [];

// Track rendered popups (quiz + page)
var renderedPopups = {};

if(path_name === "/"){
    current_page = 'home';
}
else{
    current_page = path_name;
}

var get_site_popup_data = document.querySelectorAll(".quizify-popup-pages-data");
if (!get_site_popup_data.length) {
    console.log("No shortcodefound in theme.liquid");
}
// console.log("get_site_popup_data--",get_site_popup_data); 

/*-------------------------End Default Variables----------------------*/

/*--------------------------Start Popup Check ajax call------------------------*/
function popup_check_callback(final_page_value,get_site_store_data,get_quiz_shortcode){

    const ajax_call_url = origin_popup_URL+"/popup_check";
    var host_url = window.location.host;
    const popup_check_request = new XMLHttpRequest();

    popup_check_request.addEventListener('load', function () {
        if (this.readyState === 4 && this.status === 200) {
            var responseJson = JSON.parse(this.responseText); 

            if(responseJson.popup_apply_condition == true){
                 var popup_quiz_data = responseJson.popup_quiz_data;
                var quiz_data = responseJson.quiz_data;
                // console.log('popup_quiz_data---',popup_quiz_data);

                popup_append_data(popup_quiz_data,quiz_data,final_page_value);
            }
            else{
                // console.log("CONDITION FALSE 2");
            }
        }
    });

    popup_check_request.open('POST', ajax_call_url, true);
    popup_check_request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    popup_check_request.send("host_url=" + host_url + "&final_page_value=" + final_page_value + "&get_quiz_shortcode=" + get_quiz_shortcode + "&get_site_store_data=" + get_site_store_data);

}
/*--------------------------End Popup Check ajax call------------------------*/

/*-------------------------Start Check For Popup Close LocalStorage----------------------*/

// var get_popup_local_storage = getWithExpiry('quiz_popup_hide') ? true : false;
/*-------------------------End Check For Popup Close LocalStorage------------------------*/



/*-------------------------Start Default Structure Append----------------------*/

// document.body.classList.add("quiz_popup_body");
// var target = document.querySelector(".quiz_popup_body");
// var quiz_popup_wrap = document.createElement('div');
// quiz_popup_wrap.className="quiz-popup-wrap"; 

// target.appendChild(quiz_popup_wrap);

/*-------------------------End Default Structure Append------------------------*/


/*-------------------------Start Get site popup data from div----------------------*/

for (let get_site_popup_data_div of get_site_popup_data){

    var get_quiz_shortcode = get_site_popup_data_div.getAttribute('data-quiz-shortcode');
    var get_site_store_data = get_site_popup_data_div.getAttribute('data-quiz-store');
    var get_site_data_attr = get_site_popup_data_div.getAttribute('data-popup-pages-data').split(',')[0].trim();

    // Get quiz attributes
    var check_match_page = false;
    var non_product_collection_page = false;
    var page_type = '';
    var replace_popup_url_string = '';
    var final_page_value = '';
    // var check_for_any_page = false;

    var check_for_product = get_site_data_attr.indexOf("q_specific_product");
    var check_for_collection = get_site_data_attr.indexOf("q_specific_collection");

    if (check_for_product > -1) {
        page_type = 'product';
        replace_popup_url_string = get_site_data_attr.replace('q_specific_product_','');
    }
    else if(check_for_collection > -1){
        page_type = 'collection';
        replace_popup_url_string = get_site_data_attr.replace('q_specific_collection_','');
    }
    else if(get_site_data_attr == 'home'|| get_site_data_attr == 'search' || get_site_data_attr == 'products' || get_site_data_attr == 'collections'){
        page_type = 'normal_page';
        replace_popup_url_string = get_site_data_attr;
    }

    // console.log('IN LOOP replace_popup_url_string=====',replace_popup_url_string);

    //replace_popup_url_string = get_site_data_attr_array[k].replace('data-','');

    if (get_site_data_attr === 'any_page') {
        check_match_page = true;
        replace_popup_url_string = 'any_page';
    } else {
        check_match_page = current_page.indexOf(replace_popup_url_string) !== -1;
    }
    // if(check_match_page === true){
    //     console.log('IN LOOP-Match-',replace_popup_url_string);
    // }
    // else{
    //     console.log('IN LOOP-Not-Match-',get_site_data_attr_array[k]);
    // }

    if(check_match_page === true){
        if(page_type === "collection" || page_type === "product"){
            non_product_collection_page = false;
            final_page_value = replace_popup_url_string;
        }
        else{
            non_product_collection_page = true;
            final_page_value = replace_popup_url_string;
        }

    }

    if(get_quiz_shortcode){
        if(get_site_popup_data_div){

            if (get_quiz_shortcode && final_page_value) {
                document.body.classList.add("quiz_popup_body");

                var popupKey = get_quiz_shortcode + '|' + current_page;
                if (renderedPopups[popupKey]) continue;
                renderedPopups[popupKey] = true;

                popup_check_callback(final_page_value, get_site_store_data, get_quiz_shortcode);
            }
        }
    }else{
        document.body.classList.add("quiz_popup_body");
        popup_check_callback(final_page_value, get_site_store_data, 'latest');
        break;
    }
    
    /*---------------------------End Popup Structure Data-----------------------------*/
};

/*---------------------------Start Popup Append Data Call---------------------------*/
function popup_append_data(popup_quiz_data, quiz_data, final_page_value){
    var final_quiz_shortcode = quiz_data.shortcode;
    var popup_delay_millisec = (popup_quiz_data.popup_delay || 0) * 1000;
    var popup_type = popup_quiz_data.popup_frequency;
    var quiz_frequency = (popup_type == "never") ? "never" : (popup_type || 0) * 60000; // per-quiz
    var storageKey = 'quiz_popup_hide_' + final_quiz_shortcode + '_' + final_page_value;
    var get_popup_local_storage = getWithExpiry(storageKey) ? true : false;

    if(get_popup_local_storage == false && final_quiz_shortcode){
        setTimeout(function(){ 
            popup_function(final_quiz_shortcode, quiz_frequency, final_page_value);
        }, popup_delay_millisec);
    }
}
/*---------------------------End Popup Append Data Call-----------------------------*/


/*---------------------------Start Popup Structure Data-----------------------------*/
function closeQuizModal(shortcode, quiz_frequency, final_page_value) {
    // 🔹 Find popup content
    var popupInside = document.getElementById('quiz-popup-inside-' + shortcode);
    if (!popupInside) return;

    // 🔹 Find its wrapper
    var popupWrap = popupInside.closest('.quiz-popup-wrap');
    if (!popupWrap) return;

    // 🔹 Remove this popup only
    popupWrap.remove();

    // 🔹 Remove from stack
    popupStack = popupStack.filter(function(item) {
        return item !== popupWrap;
    });
    // console.log("quiz_frequency:", quiz_frequency);
    // 🔹 Set localStorage for THIS quiz only
    if (quiz_frequency === "never") {
        setWithExpiry('quiz_popup_hide_' + shortcode + '_' + final_page_value, true, "never");
    } else {
        quiz_frequency = Number(quiz_frequency);
        setWithExpiry('quiz_popup_hide_' + shortcode + '_' + final_page_value, true, quiz_frequency);
    }

    // 🔹 Restore previous popup or cleanup
    if (popupStack.length === 0) {
        document.body.classList.remove("quiz_popup_body");
    } else {
        updatePopupStack();
    }
}

function popup_function(shortcode, quiz_frequency, final_page_value) {
    console.log("Creating iframe for page:", final_page_value);

    // 🔹 Create wrapper for THIS quiz only
    var quiz_popup_wrap = document.createElement('div');
    quiz_popup_wrap.className = "quiz-popup-wrap";
    quiz_popup_wrap.dataset.shortcode = shortcode;
    document.body.appendChild(quiz_popup_wrap);

    // 🔹 Push wrapper to stack
    popupStack.push(quiz_popup_wrap);
    updatePopupStack();

    var quiz_popup_inner = document.createElement('div');
    quiz_popup_inner.className = "quiz-popup-inner";
    quiz_popup_wrap.appendChild(quiz_popup_inner);

    var quiz_popup_inside = document.createElement('div');
    quiz_popup_inside.id = "quiz-popup-inside-" + shortcode;
    quiz_popup_inside.className = "quiz-popup-inside visible";
    quiz_popup_inner.appendChild(quiz_popup_inside);

    var quiz_popup_frame_wrap = document.createElement('div');
    quiz_popup_frame_wrap.id = "quiz_popup_frame_wrap-" + shortcode;
    quiz_popup_frame_wrap.className = "quiz_popup_frame_wrap";
    quiz_popup_inside.appendChild(quiz_popup_frame_wrap);

    var quiz_popup_frame_wrap_inner = document.createElement('div');
    quiz_popup_frame_wrap_inner.id = "quiz_popup_frame_wrap_inner-" + shortcode;
    quiz_popup_frame_wrap_inner.className = "quiz_popup_frame_wrap_inner popup_quiz_loader";
    quiz_popup_frame_wrap.appendChild(quiz_popup_frame_wrap_inner);

    var quiz_iframe_container = document.createElement('div');
    quiz_iframe_container.id = "quiz_iframe_container-" + shortcode;
    quiz_iframe_container.className = "quiz_iframe_container";
    quiz_popup_frame_wrap.appendChild(quiz_iframe_container);

    var iframe = document.createElement('iframe');
    iframe.id = "popup_iframe-" + shortcode;
    iframe.onload = function () {
        quiz_popup_frame_wrap_inner.classList.remove("popup_quiz_loader");
    };
    iframe.dataset.domain = window.location.host;
    iframe.className = "popup_iframe";
    iframe.src = origin_popup_URL + '/quiz/' + shortcode;
    // iframe.style.cssText = "border:0; width:100%; height:100%; display:block;";
    quiz_iframe_container.appendChild(iframe);

    var popup_close_btn_wrap = document.createElement('div');
    popup_close_btn_wrap.className = "popup_close_btn_wrap";
    popup_close_btn_wrap.innerHTML = `
        <button type="button" class="popup_close_btn"
            onclick="closeQuizModal('${shortcode}', '${quiz_frequency}', '${final_page_value}')"></button>
    `;
    quiz_iframe_container.appendChild(popup_close_btn_wrap);
}

function quizFameLoad(iframe) {
    var popupWrap = iframe.closest('.quiz_popup_frame_wrap');
    if (!popupWrap) return;

    var loader = popupWrap.querySelector('.quiz_popup_frame_wrap_inner');
    if (loader) {
        loader.classList.remove("popup_quiz_loader");
    }
}
/*---------------------------End Popup Structure Data-----------------------------*/

/*---------------------------Start Popup Get/Set Localstorage Function-----------------------------*/
function setWithExpiry(key, value, ttl) {
    const now = new Date();

    const item = {
        value: value,
        expiry: ttl === "never" ? "never" : now.getTime() + ttl,
    };

    localStorage.setItem(key, JSON.stringify(item));
}


function getWithExpiry(key) {
    const itemStr = localStorage.getItem(key);

    if (!itemStr) {
        return null;
    }

    const item = JSON.parse(itemStr);

    // Never expires
    if (item.expiry === "never") {
        return item.value;
    }

    const now = new Date();

    if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }

    return item.value;
}

function updatePopupStack() {
    popupStack.forEach(function(popup, index) {
        popup.style.zIndex = 1000 + index;
    });
}
/*---------------------------End Popup Get/Set Localstorage Function-------------------------------*/
