// ==UserScript==
// @name	Anna's Archive + goodreads
// @namespace	https://github.com/JonDerThan/
// @version	0.2.1
// @description Allows for quick searching of goodread books in Anna's Archive
// @match	https://www.goodreads.com/*
// @iconURL	https://raw.githubusercontent.com/JonDerThan/annas-goodreads/main/annas-archive-favicon.png
// @source	https://github.com/JonDerThan/annas-goodreads
// ==/UserScript==

"use strict"

const IS_USERSCRIPT = true
const ICON_URL = "https://raw.githubusercontent.com/JonDerThan/annas-goodreads/main/annas-archive-favicon.png"

"use strict"

const BASE_URL = "annas-archive.org"
if (!IS_USERSCRIPT) {
  const ICON_URL = browser.runtime.getURL("annas-archive-favicon.png")
}

const URL_REGEX = new RegExp(BASE_URL.replace(".", "\\."))
const BOOK_HREF_REGEX = /\/book\/show\/[^#]+$/
const DONT_MATCH = /Continue reading/

function getURL(search, lang = "", content = "book_any", filetype = "epub", sort = "") {
  return `https://${BASE_URL}/search?lang=${lang}&content=${content}&ext=${filetype}&sort=${sort}&q=${search}`
}

function findBookElems() {
  let bookElems = []

  // finds books on most pages, basically just gets the links to book pages
  let elems = document.getElementsByTagName("a")
  for (let i = 0; i < elems.length; i++) {
    let elem = elems[i]
    const title = elem.innerText

    // is link to book and is title
    if (!BOOK_HREF_REGEX.test(elem.href) ||
        !title.length ||
        DONT_MATCH.test(title)) continue

    bookElems.push([title, elem])
  }

  // find book title on books page - "book/show/"
  elems = document.getElementsByClassName("Text__title1")
  for (let i = 0; i < elems.length; i++) {
    if (elems[i].getAttribute("data-testid") !== "bookTitle") continue
    const title = elems[i].innerText
    bookElems.push([title, elems[i]])
    break
  }

  return bookElems
}

function createLink(searchStr) {
  // create img
  let img = document.createElement("img")
  img.setAttribute("src", ICON_URL)

  // create a
  const url = getURL(searchStr)
  let a = document.createElement("a")
  a.setAttribute("href", url)
  a.setAttribute("target", "_blank")
  a.appendChild(img)

  return a
}

function injectLinks() {
  let elems = findBookElems()
  elems = elems.filter((elem) => !URL_REGEX.test(elem[1].innerHTML))
  elems.forEach((elem) => {
    let a = createLink(encodeURIComponent(elem[0]))
    elem[1].appendChild(a)
  })
}

injectLinks()
// repeat every 10s, if new books appear due to infinite scrolling
setInterval(injectLinks, 10000)
