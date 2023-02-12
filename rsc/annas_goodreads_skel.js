"USERSCRIPT:header"
"use strict"

let ICON_URL

"USERSCRIPT:definitions"
"ADDON:definitions"

const BASE_URL = "annas-archive.org"
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
  a.style.setProperty("margin", ".25em")
  a.appendChild(img)

  return a
}

let pendingChecks = [-1, -1, -1, -1]
function refreshPendingChecks(func) {
  // clear out remaining ones:
  pendingChecks.forEach(clearTimeout)
  // set new ones
  pendingChecks[0] = setTimeout(func, 1000)
  pendingChecks[1] = setTimeout(func, 2000)
  pendingChecks[2] = setTimeout(func, 3000)
  pendingChecks[3] = setTimeout(func, 5000)
}

function injectLinks() {
  let elems = findBookElems()
  elems = elems.filter((elem) => !URL_REGEX.test(elem[1].innerHTML))
  elems.forEach((elem) => {
    let a = createLink(encodeURIComponent(elem[0]))
    elem[1].appendChild(a)
  })
  if (elems.length > 0) pendingChecks.forEach(clearTimeout)
}

injectLinks()
// repeat every 10s, if new books appear due to infinite scrolling
// setInterval(injectLinks, 10000)

let lastScroll = 0
addEventListener("scroll", (e) => {
  // checked less than .5s ago
  if (e.timeStamp - lastScroll < 500) return
  lastScroll = e.timeStamp
  refreshPendingChecks(injectLinks)
})
