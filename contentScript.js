let isBlockifyEnabled = false;
let excludedSites = [];
let isBlockified = false;

const blockify = () => {
  if (isBlockified) return;

  if (!document.getElementById("blockStyle")) {
    const blockStyleEl = document.createElement("style");
    blockStyleEl.id = "blockStyle";
    blockStyleEl.innerHTML =
      "*::after, *::before { border-radius: 0px !important; }";
    document.head.appendChild(blockStyleEl);
  }
  let removedMaskIds = [];
  document.querySelectorAll("mask").forEach((el) => {
    removedMaskIds.push(el.id);
    el.querySelectorAll("circle").forEach((el) => el.remove());
  });
  document.querySelectorAll("*").forEach((el) => {
    if (el.getAttribute("mask")) {
      const mask = el.getAttribute("mask");
      if (!mask.startsWith("url(#")) return;
      const id = /url\(#(.+)\)/.exec(mask)[1];
      if (removedMaskIds.includes(id)) el.removeAttribute("mask");
    }
    const style = window.getComputedStyle(el);
    if (style.borderRadius !== "0px") {
      el.style.setProperty("border-radius", "0px", "important");
    }
  });

  isBlockified = true;
};

const unblockify = () => {
  if (!isBlockified) return;

  const blockStyleEl = document.getElementById("blockStyle");
  if (blockStyleEl) blockStyleEl.remove();

  document.querySelectorAll("*").forEach((el) => {
    if (el.style.borderRadius === "0px") {
      el.style.removeProperty("border-radius");
    }
  });

  isBlockified = false;
};

const observer = new MutationObserver(() => {
  if (isBlockifyEnabled && shouldBlockify()) {
    blockify();
  }
});
const observerConfig = { subtree: true, childList: true };

function shouldBlockify() {
  const currentHost = window.location.hostname.toLowerCase();
  return !excludedSites.some((site) => currentHost.includes(site));
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleBlockify") {
    isBlockifyEnabled = request.value;
    if (isBlockifyEnabled && shouldBlockify()) {
      blockify();
      observer.observe(document.body, observerConfig);
    } else {
      observer.disconnect();
      unblockify();
    }
  } else if (request.action === "updateExcludedSites") {
    excludedSites = request.excludedSites;
    if (isBlockifyEnabled) {
      if (shouldBlockify()) {
        blockify();
        observer.observe(document.body, observerConfig);
      } else {
        observer.disconnect();
        unblockify();
      }
    }
  }
});

chrome.storage.sync.get(["blockifyEnabled", "excludedSites"], (result) => {
  isBlockifyEnabled = result.blockifyEnabled || false;
  excludedSites = result.excludedSites || [];
  if (isBlockifyEnabled && shouldBlockify()) {
    blockify();
    observer.observe(document.body, observerConfig);
  }
});
