// ==UserScript==
// @name         blocky-web
// @namespace    https://kibty.town
// @version      0.1
// @description  makes the web boxy like the old days
// @author       xyzeva
// @include      http://*
// @include      https://*
// @run-at       document-start
// ==/UserScript==


'use strict';
(function () {
    const blockify = () => {
        if(!document.getElementById("blockStyle")) {
            const blockStyleEl = document.createElement("style");
            blockStyleEl.id = "blockStyle"
            blockStyleEl.innerHTML = "*::after, *::before { border-radius: 0px !important; }"
            document.head.appendChild(blockStyleEl)
        }
        let removedMaskIds = []

        document.querySelectorAll("mask").forEach((el) => {
            removedMaskIds.push(el.id)
            el.querySelectorAll("circle").forEach((el) => el.remove())
        })
        document.querySelectorAll("*").forEach((el) => {
            if(el.getAttribute("mask")) {
                const mask = el.getAttribute("mask")
                if(!mask.startsWith("url(#")) return
                const id = /url\(#(.+)\)/.exec(mask)[1]
                if(removedMaskIds.includes(id)) el.removeAttribute("mask")
            }
            const style = window.getComputedStyle(el)
            if(style.borderRadius !== "0px") el.setAttribute("style", (el.hasAttribute("style") ? el.getAttribute("style") +  ";" : "") + "border-radius: 0px !important;")
        })


    };
    window.onload = () => (new MutationObserver(blockify)).observe(document.body, {subtree: true, childList: true});
    blockify();
    setInterval(blockify, 100);

})();
