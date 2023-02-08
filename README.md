Firefox addon that injects links on goodread pages, that link to searches on [Anna's Archive](https://annas-archive.org/) for the corresponding books.

### Todo list
- [ ] only test for new books after scrolling: test 1s, 2s, 5s, 10s, and 15s after scrolling, then give up
- [ ] settings page to change default settings of `getBaseURL`
- [ ] identify other places where links could be shown
- [ ] find other places where links shouldnt be injected (`DONT_MATCH`)
- [ ] remove the `(Hardback)`, `(Paperback)`, etc. extensions for some books in the search query
- [ ] replace logo with higher quality one
- [ ] increase margin between text and logo
- [ ] implement support for userscripts:
- [ ] userscript header (should be ignored by add-ons)
- [ ] possibility to use imgur link if `browser.runtime.getURL` doesn't work
