/**
 * Create the 'Get sale price' link.
 * @param {String} text - The text to display on the button.
 * @param {Node} elemInjectParent - The node to inject the link into.
 * @param {Node} elemInjectBefore - The node the injected link should be placed before.
 * @param {String} itemId - The listing's item ID.
 */
function createBonoboLink(text, elemInjectParent, elemInjectBefore, itemId = 0) {
  if (itemId === 0) {
    console.error('Bonobo could not find the item\'s ID.');
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.classList.add('bonobo-link-wrapper', 's-item__detail', 's-item__detail--primary');

  const child = document.createElement('span');

  const link = document.createElement('a');
  link.classList.add('bonobo-link');
  link.href = `https://cgi.ebay.${getTLD()}/ws/eBayISAPI.dll?viewItem&item=${itemId}`;
  link.innerText = text;
  link.tabIndex = '0';

  child.appendChild(link);
  wrapper.appendChild(child);

  if (elemInjectBefore) {
    elemInjectParent.insertBefore(wrapper, elemInjectBefore);
    return;
  }

  elemInjectParent.appendChild(wrapper);
}

/**
 * Extract the listing's item ID from its link.
 * @param {String} href - The listing's `<a>` element `href` value.
 */
function getItemIdFromLink(href = '') {
  return href.match(/\/([A-Za-z0-9]+)\?/)[1];
}

/**
 * Get the top level domain (e.g. `".co.uk"`).
 * This is used to ensure the user gets taken to the same domain when revealing the price.
 */
function getTLD() {
  return window.location.host.match(/ebay\.([a-zA-Z]{1,4}(\.[a-zA-Z]{1,4})?)/)[1];
}

(function() {
  if (window.location.host.substr(0, 3) === 'cgi') {
    // We're on the revealed price page, highlight the sell price.
    document.querySelector('[itemprop="offers"]').closest('td').classList.add('bonobo');
    return;
  }

  if (window.location.pathname.substr(0, 4) === '/itm') {
    // We're on an item page.
    const itemPriceElem = document.querySelector('#prcIsum:not([itemprop])');

    if (!itemPriceElem) {
      // There is no item price elem (it was an auction or hasn't been sold yet).
      return;
    }

    let parent;
    const approxPriceElem = document.querySelector('.convPrice');

    if (approxPriceElem) {
      parent = approxPriceElem;
    } else {
      parent = itemPriceElem;
    }
    
    createBonoboLink('This may not be the real sale price. Click here to check.', parent, undefined, getItemIdFromLink(window.location.href));
    
  }

  const listElems = document.querySelectorAll('.STRIKETHROUGH.POSITIVE, .sboffer');

	if (!listElems.length) {
    // This only works on the list view, but if we're on the item view we can at least add a link.
    return;
  }

  // We're on a multi-list view.
  listElems.forEach(elem => {
    let itemLink;
    let elemInjectParent;
    let elemInjectBefore;

    const elemItemInfo = elem.closest('.s-item__info');
    if (elemItemInfo) {
      // We're on the UK, US or AU eBay websites.
      itemLink = elemItemInfo.querySelector('a').href;
      elemInjectParent = elem.closest('.s-item__details');
      elemInjectBefore = elemItemInfo.querySelector('.s-item__similar-items').parentNode;
    }

    const altElemItemInfo = elem.closest('.sresult');
    if (altElemItemInfo) {
      itemLink = altElemItemInfo.querySelector('a').href;
      elemInjectParent = altElemItemInfo.querySelector('.group');
      elemInjectBefore = elemInjectParent.querySelector('a');
    }

    if (!itemLink) {
      console.error(`Bonobo could not parse the item on ${getTLD()}.`);
      return;
    }

    createBonoboLink('Get sale price', elemInjectParent, elemInjectBefore, getItemIdFromLink(itemLink));
  });
})();