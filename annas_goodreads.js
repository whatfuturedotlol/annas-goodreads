"use strict"

function getBaseURL(lang = "", content = "book_any", filetype = "epub", sort = "") {
  return `https://annas-archive.org/search?lang=${lang}&content=${content}&ext=${filetype}&sort=${sort}&q=`
}
const BASE_URL = getBaseURL()
const URL_REGEX = /annas-archive\.org/

const BOOK_HREF_REGEX = /\/book\/show\/[^#]+$/
const DONT_MATCH = /Continue reading/

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
  const imgURL = browser.runtime.getURL("annas-archive-favicon.png")
  let img = document.createElement("img")
  img.setAttribute("src", imgURL)

  // create a
  const url = BASE_URL + searchStr
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
