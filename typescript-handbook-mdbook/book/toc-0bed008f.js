// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="index.html">Giriş</a></span></li><li class="chapter-item expanded "><li class="spacer"></li></li><li class="chapter-item expanded "><li class="part-title">Bölüm I — Başlangıç</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part1/typescript-nedir.html"><strong aria-hidden="true">1.</strong> TypeScript Nedir?</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part1/neden-typescript.html"><strong aria-hidden="true">2.</strong> Neden TypeScript?</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part1/kurulum.html"><strong aria-hidden="true">3.</strong> Kurulum &amp; İlk Program</a></span></li><li class="chapter-item expanded "><li class="spacer"></li></li><li class="chapter-item expanded "><li class="part-title">Bölüm II — Temel Tipler</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part2/primitive-tipler.html"><strong aria-hidden="true">4.</strong> Primitive Tipler</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part2/any-unknown-never.html"><strong aria-hidden="true">5.</strong> any, unknown, never</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part2/arrays-tuples.html"><strong aria-hidden="true">6.</strong> Arrays &amp; Tuples</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part2/enum.html"><strong aria-hidden="true">7.</strong> Enum</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part2/union-type-inference.html"><strong aria-hidden="true">8.</strong> Union Types &amp; Type Inference</a></span></li><li class="chapter-item expanded "><li class="spacer"></li></li><li class="chapter-item expanded "><li class="part-title">Bölüm III — Objeler &amp; Arayüzler</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part3/object-types.html"><strong aria-hidden="true">9.</strong> Object Types</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part3/interface.html"><strong aria-hidden="true">10.</strong> Interface</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part3/type-alias.html"><strong aria-hidden="true">11.</strong> Type Alias</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part3/interface-vs-type.html"><strong aria-hidden="true">12.</strong> Interface vs Type</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part3/optional-readonly-nested.html"><strong aria-hidden="true">13.</strong> Optional, Readonly &amp; Nested</a></span></li><li class="chapter-item expanded "><li class="spacer"></li></li><li class="chapter-item expanded "><li class="part-title">Bölüm IV — Fonksiyonlar</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part4/parametre-return.html"><strong aria-hidden="true">14.</strong> Parametre &amp; Return Tipleri</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part4/void-never.html"><strong aria-hidden="true">15.</strong> void &amp; never</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part4/optional-default-rest.html"><strong aria-hidden="true">16.</strong> Optional, Default &amp; Rest Parametreler</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part4/arrow-function-types.html"><strong aria-hidden="true">17.</strong> Arrow Functions &amp; Fonksiyon Tipleri</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part4/overloading.html"><strong aria-hidden="true">18.</strong> Function Overloading</a></span></li><li class="chapter-item expanded "><li class="spacer"></li></li><li class="chapter-item expanded "><li class="part-title">Bölüm V — Generics</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part5/generic-nedir.html"><strong aria-hidden="true">19.</strong> Generic Nedir?</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part5/generic-fonksiyon.html"><strong aria-hidden="true">20.</strong> Generic Fonksiyonlar</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part5/generic-interface-type.html"><strong aria-hidden="true">21.</strong> Generic Interface &amp; Type</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part5/constraints.html"><strong aria-hidden="true">22.</strong> Constraints &amp; Çoklu Generic</a></span></li><li class="chapter-item expanded "><li class="spacer"></li></li><li class="chapter-item expanded "><li class="part-title">Bölüm VI — Utility Types</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part6/partial-required-readonly.html"><strong aria-hidden="true">23.</strong> Partial, Required &amp; Readonly</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part6/pick-omit-record.html"><strong aria-hidden="true">24.</strong> Pick, Omit &amp; Record</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part6/exclude-extract-nonnullable.html"><strong aria-hidden="true">25.</strong> Exclude, Extract &amp; NonNullable</a></span></li><li class="chapter-item expanded "><li class="spacer"></li></li><li class="chapter-item expanded "><li class="part-title">Bölüm VII — Type Narrowing &amp; Guards</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part7/narrowing-nedir.html"><strong aria-hidden="true">26.</strong> Type Narrowing Nedir?</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part7/typeof-instanceof.html"><strong aria-hidden="true">27.</strong> typeof &amp; instanceof Guards</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part7/in-discriminated.html"><strong aria-hidden="true">28.</strong> in Guard &amp; Discriminated Unions</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part7/custom-type-guards.html"><strong aria-hidden="true">29.</strong> Custom Type Guards</a></span></li><li class="chapter-item expanded "><li class="spacer"></li></li><li class="chapter-item expanded "><li class="part-title">Bölüm VIII — Classes &amp; OOP</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part8/class-temelleri.html"><strong aria-hidden="true">30.</strong> Class Temelleri</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part8/access-modifiers.html"><strong aria-hidden="true">31.</strong> Access Modifiers</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part8/inheritance-abstract.html"><strong aria-hidden="true">32.</strong> Inheritance &amp; Abstract Classes</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part8/getters-setters-static.html"><strong aria-hidden="true">33.</strong> Getters, Setters &amp; Static</a></span></li><li class="chapter-item expanded "><li class="spacer"></li></li><li class="chapter-item expanded "><li class="part-title">Bölüm IX — Modules &amp; Imports</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part9/module-sistemi.html"><strong aria-hidden="true">34.</strong> Module Sistemi</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part9/import-export.html"><strong aria-hidden="true">35.</strong> Import/Export Patterns</a></span></li><li class="chapter-item expanded "><li class="spacer"></li></li><li class="chapter-item expanded "><li class="part-title">Bölüm X — Async &amp; Promise</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part10/promise-types.html"><strong aria-hidden="true">36.</strong> Promise&lt;T&gt; Tipleri</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part10/async-await.html"><strong aria-hidden="true">37.</strong> async/await ile TypeScript</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part10/error-handling.html"><strong aria-hidden="true">38.</strong> Hata Yönetimi</a></span></li><li class="chapter-item expanded "><li class="spacer"></li></li><li class="chapter-item expanded "><li class="part-title">Bölüm XI — React + TypeScript</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part11/component-props.html"><strong aria-hidden="true">39.</strong> Component Props</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part11/hooks.html"><strong aria-hidden="true">40.</strong> Hooks ile TypeScript</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part11/event-types.html"><strong aria-hidden="true">41.</strong> Event Tipleri</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part11/api-entegrasyon.html"><strong aria-hidden="true">42.</strong> API Entegrasyonu</a></span></li><li class="chapter-item expanded "><li class="spacer"></li></li><li class="chapter-item expanded "><li class="part-title">Bölüm XII — TypeScript ile AI Geliştirme</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part12/neden-typescript.html"><strong aria-hidden="true">43.</strong> Neden TypeScript?</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part12/claude-api-tipleme.html"><strong aria-hidden="true">44.</strong> Claude API Tipleme</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part12/tool-use-agent.html"><strong aria-hidden="true">45.</strong> Tool Use &amp; Agent Döngüsü</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part12/rag-pipeline.html"><strong aria-hidden="true">46.</strong> RAG Pipeline Tipleme</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="part12/vercel-ai-sdk.html"><strong aria-hidden="true">47.</strong> Vercel AI SDK &amp; Full-Stack</a></span></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split('#')[0].split('?')[0];
        if (current_page.endsWith('/')) {
            current_page += 'index.html';
        }
        const links = Array.prototype.slice.call(this.querySelectorAll('a'));
        const l = links.length;
        for (let i = 0; i < l; ++i) {
            const link = links[i];
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The 'index' page is supposed to alias the first chapter in the book.
            if (link.href === current_page
                || i === 0
                && path_to_root === ''
                && current_page.endsWith('/index.html')) {
                link.classList.add('active');
                let parent = link.parentElement;
                while (parent) {
                    if (parent.tagName === 'LI' && parent.classList.contains('chapter-item')) {
                        parent.classList.add('expanded');
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', e => {
            if (e.target.tagName === 'A') {
                const clientRect = e.target.getBoundingClientRect();
                const sidebarRect = this.getBoundingClientRect();
                sessionStorage.setItem('sidebar-scroll-offset', clientRect.top - sidebarRect.top);
            }
        }, { passive: true });
        const sidebarScrollOffset = sessionStorage.getItem('sidebar-scroll-offset');
        sessionStorage.removeItem('sidebar-scroll-offset');
        if (sidebarScrollOffset !== null) {
            // preserve sidebar scroll position when navigating via links within sidebar
            const activeSection = this.querySelector('.active');
            if (activeSection) {
                const clientRect = activeSection.getBoundingClientRect();
                const sidebarRect = this.getBoundingClientRect();
                const currentOffset = clientRect.top - sidebarRect.top;
                this.scrollTop += currentOffset - parseFloat(sidebarScrollOffset);
            }
        } else {
            // scroll sidebar to current active section when navigating via
            // 'next/previous chapter' buttons
            const activeSection = document.querySelector('#mdbook-sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        const sidebarAnchorToggles = document.querySelectorAll('.chapter-fold-toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(el => {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define('mdbook-sidebar-scrollbox', MDBookSidebarScrollbox);


// ---------------------------------------------------------------------------
// Support for dynamically adding headers to the sidebar.

(function() {
    // This is used to detect which direction the page has scrolled since the
    // last scroll event.
    let lastKnownScrollPosition = 0;
    // This is the threshold in px from the top of the screen where it will
    // consider a header the "current" header when scrolling down.
    const defaultDownThreshold = 150;
    // Same as defaultDownThreshold, except when scrolling up.
    const defaultUpThreshold = 300;
    // The threshold is a virtual horizontal line on the screen where it
    // considers the "current" header to be above the line. The threshold is
    // modified dynamically to handle headers that are near the bottom of the
    // screen, and to slightly offset the behavior when scrolling up vs down.
    let threshold = defaultDownThreshold;
    // This is used to disable updates while scrolling. This is needed when
    // clicking the header in the sidebar, which triggers a scroll event. It
    // is somewhat finicky to detect when the scroll has finished, so this
    // uses a relatively dumb system of disabling scroll updates for a short
    // time after the click.
    let disableScroll = false;
    // Array of header elements on the page.
    let headers;
    // Array of li elements that are initially collapsed headers in the sidebar.
    // I'm not sure why eslint seems to have a false positive here.
    // eslint-disable-next-line prefer-const
    let headerToggles = [];
    // This is a debugging tool for the threshold which you can enable in the console.
    let thresholdDebug = false;

    // Updates the threshold based on the scroll position.
    function updateThreshold() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // The number of pixels below the viewport, at most documentHeight.
        // This is used to push the threshold down to the bottom of the page
        // as the user scrolls towards the bottom.
        const pixelsBelow = Math.max(0, documentHeight - (scrollTop + windowHeight));
        // The number of pixels above the viewport, at least defaultDownThreshold.
        // Similar to pixelsBelow, this is used to push the threshold back towards
        // the top when reaching the top of the page.
        const pixelsAbove = Math.max(0, defaultDownThreshold - scrollTop);
        // How much the threshold should be offset once it gets close to the
        // bottom of the page.
        const bottomAdd = Math.max(0, windowHeight - pixelsBelow - defaultDownThreshold);
        let adjustedBottomAdd = bottomAdd;

        // Adjusts bottomAdd for a small document. The calculation above
        // assumes the document is at least twice the windowheight in size. If
        // it is less than that, then bottomAdd needs to be shrunk
        // proportional to the difference in size.
        if (documentHeight < windowHeight * 2) {
            const maxPixelsBelow = documentHeight - windowHeight;
            const t = 1 - pixelsBelow / Math.max(1, maxPixelsBelow);
            const clamp = Math.max(0, Math.min(1, t));
            adjustedBottomAdd *= clamp;
        }

        let scrollingDown = true;
        if (scrollTop < lastKnownScrollPosition) {
            scrollingDown = false;
        }

        if (scrollingDown) {
            // When scrolling down, move the threshold up towards the default
            // downwards threshold position. If near the bottom of the page,
            // adjustedBottomAdd will offset the threshold towards the bottom
            // of the page.
            const amountScrolledDown = scrollTop - lastKnownScrollPosition;
            const adjustedDefault = defaultDownThreshold + adjustedBottomAdd;
            threshold = Math.max(adjustedDefault, threshold - amountScrolledDown);
        } else {
            // When scrolling up, move the threshold down towards the default
            // upwards threshold position. If near the bottom of the page,
            // quickly transition the threshold back up where it normally
            // belongs.
            const amountScrolledUp = lastKnownScrollPosition - scrollTop;
            const adjustedDefault = defaultUpThreshold - pixelsAbove
                + Math.max(0, adjustedBottomAdd - defaultDownThreshold);
            threshold = Math.min(adjustedDefault, threshold + amountScrolledUp);
        }

        if (documentHeight <= windowHeight) {
            threshold = 0;
        }

        if (thresholdDebug) {
            const id = 'mdbook-threshold-debug-data';
            let data = document.getElementById(id);
            if (data === null) {
                data = document.createElement('div');
                data.id = id;
                data.style.cssText = `
                    position: fixed;
                    top: 50px;
                    right: 10px;
                    background-color: 0xeeeeee;
                    z-index: 9999;
                    pointer-events: none;
                `;
                document.body.appendChild(data);
            }
            data.innerHTML = `
                <table>
                  <tr><td>documentHeight</td><td>${documentHeight.toFixed(1)}</td></tr>
                  <tr><td>windowHeight</td><td>${windowHeight.toFixed(1)}</td></tr>
                  <tr><td>scrollTop</td><td>${scrollTop.toFixed(1)}</td></tr>
                  <tr><td>pixelsAbove</td><td>${pixelsAbove.toFixed(1)}</td></tr>
                  <tr><td>pixelsBelow</td><td>${pixelsBelow.toFixed(1)}</td></tr>
                  <tr><td>bottomAdd</td><td>${bottomAdd.toFixed(1)}</td></tr>
                  <tr><td>adjustedBottomAdd</td><td>${adjustedBottomAdd.toFixed(1)}</td></tr>
                  <tr><td>scrollingDown</td><td>${scrollingDown}</td></tr>
                  <tr><td>threshold</td><td>${threshold.toFixed(1)}</td></tr>
                </table>
            `;
            drawDebugLine();
        }

        lastKnownScrollPosition = scrollTop;
    }

    function drawDebugLine() {
        if (!document.body) {
            return;
        }
        const id = 'mdbook-threshold-debug-line';
        const existingLine = document.getElementById(id);
        if (existingLine) {
            existingLine.remove();
        }
        const line = document.createElement('div');
        line.id = id;
        line.style.cssText = `
            position: fixed;
            top: ${threshold}px;
            left: 0;
            width: 100vw;
            height: 2px;
            background-color: red;
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(line);
    }

    function mdbookEnableThresholdDebug() {
        thresholdDebug = true;
        updateThreshold();
        drawDebugLine();
    }

    window.mdbookEnableThresholdDebug = mdbookEnableThresholdDebug;

    // Updates which headers in the sidebar should be expanded. If the current
    // header is inside a collapsed group, then it, and all its parents should
    // be expanded.
    function updateHeaderExpanded(currentA) {
        // Add expanded to all header-item li ancestors.
        let current = currentA.parentElement;
        while (current) {
            if (current.tagName === 'LI' && current.classList.contains('header-item')) {
                current.classList.add('expanded');
            }
            current = current.parentElement;
        }
    }

    // Updates which header is marked as the "current" header in the sidebar.
    // This is done with a virtual Y threshold, where headers at or below
    // that line will be considered the current one.
    function updateCurrentHeader() {
        if (!headers || !headers.length) {
            return;
        }

        // Reset the classes, which will be rebuilt below.
        const els = document.getElementsByClassName('current-header');
        for (const el of els) {
            el.classList.remove('current-header');
        }
        for (const toggle of headerToggles) {
            toggle.classList.remove('expanded');
        }

        // Find the last header that is above the threshold.
        let lastHeader = null;
        for (const header of headers) {
            const rect = header.getBoundingClientRect();
            if (rect.top <= threshold) {
                lastHeader = header;
            } else {
                break;
            }
        }
        if (lastHeader === null) {
            lastHeader = headers[0];
            const rect = lastHeader.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (rect.top >= windowHeight) {
                return;
            }
        }

        // Get the anchor in the summary.
        const href = '#' + lastHeader.id;
        const a = [...document.querySelectorAll('.header-in-summary')]
            .find(element => element.getAttribute('href') === href);
        if (!a) {
            return;
        }

        a.classList.add('current-header');

        updateHeaderExpanded(a);
    }

    // Updates which header is "current" based on the threshold line.
    function reloadCurrentHeader() {
        if (disableScroll) {
            return;
        }
        updateThreshold();
        updateCurrentHeader();
    }


    // When clicking on a header in the sidebar, this adjusts the threshold so
    // that it is located next to the header. This is so that header becomes
    // "current".
    function headerThresholdClick(event) {
        // See disableScroll description why this is done.
        disableScroll = true;
        setTimeout(() => {
            disableScroll = false;
        }, 100);
        // requestAnimationFrame is used to delay the update of the "current"
        // header until after the scroll is done, and the header is in the new
        // position.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Closest is needed because if it has child elements like <code>.
                const a = event.target.closest('a');
                const href = a.getAttribute('href');
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    threshold = targetElement.getBoundingClientRect().bottom;
                    updateCurrentHeader();
                }
            });
        });
    }

    // Takes the nodes from the given head and copies them over to the
    // destination, along with some filtering.
    function filterHeader(source, dest) {
        const clone = source.cloneNode(true);
        clone.querySelectorAll('mark').forEach(mark => {
            mark.replaceWith(...mark.childNodes);
        });
        dest.append(...clone.childNodes);
    }

    // Scans page for headers and adds them to the sidebar.
    document.addEventListener('DOMContentLoaded', function() {
        const activeSection = document.querySelector('#mdbook-sidebar .active');
        if (activeSection === null) {
            return;
        }

        const main = document.getElementsByTagName('main')[0];
        headers = Array.from(main.querySelectorAll('h2, h3, h4, h5, h6'))
            .filter(h => h.id !== '' && h.children.length && h.children[0].tagName === 'A');

        if (headers.length === 0) {
            return;
        }

        // Build a tree of headers in the sidebar.

        const stack = [];

        const firstLevel = parseInt(headers[0].tagName.charAt(1));
        for (let i = 1; i < firstLevel; i++) {
            const ol = document.createElement('ol');
            ol.classList.add('section');
            if (stack.length > 0) {
                stack[stack.length - 1].ol.appendChild(ol);
            }
            stack.push({level: i + 1, ol: ol});
        }

        // The level where it will start folding deeply nested headers.
        const foldLevel = 3;

        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            const level = parseInt(header.tagName.charAt(1));

            const currentLevel = stack[stack.length - 1].level;
            if (level > currentLevel) {
                // Begin nesting to this level.
                for (let nextLevel = currentLevel + 1; nextLevel <= level; nextLevel++) {
                    const ol = document.createElement('ol');
                    ol.classList.add('section');
                    const last = stack[stack.length - 1];
                    const lastChild = last.ol.lastChild;
                    // Handle the case where jumping more than one nesting
                    // level, which doesn't have a list item to place this new
                    // list inside of.
                    if (lastChild) {
                        lastChild.appendChild(ol);
                    } else {
                        last.ol.appendChild(ol);
                    }
                    stack.push({level: nextLevel, ol: ol});
                }
            } else if (level < currentLevel) {
                while (stack.length > 1 && stack[stack.length - 1].level > level) {
                    stack.pop();
                }
            }

            const li = document.createElement('li');
            li.classList.add('header-item');
            li.classList.add('expanded');
            if (level < foldLevel) {
                li.classList.add('expanded');
            }
            const span = document.createElement('span');
            span.classList.add('chapter-link-wrapper');
            const a = document.createElement('a');
            span.appendChild(a);
            a.href = '#' + header.id;
            a.classList.add('header-in-summary');
            filterHeader(header.children[0], a);
            a.addEventListener('click', headerThresholdClick);
            const nextHeader = headers[i + 1];
            if (nextHeader !== undefined) {
                const nextLevel = parseInt(nextHeader.tagName.charAt(1));
                if (nextLevel > level && level >= foldLevel) {
                    const toggle = document.createElement('a');
                    toggle.classList.add('chapter-fold-toggle');
                    toggle.classList.add('header-toggle');
                    toggle.addEventListener('click', () => {
                        li.classList.toggle('expanded');
                    });
                    const toggleDiv = document.createElement('div');
                    toggleDiv.textContent = '❱';
                    toggle.appendChild(toggleDiv);
                    span.appendChild(toggle);
                    headerToggles.push(li);
                }
            }
            li.appendChild(span);

            const currentParent = stack[stack.length - 1];
            currentParent.ol.appendChild(li);
        }

        const onThisPage = document.createElement('div');
        onThisPage.classList.add('on-this-page');
        onThisPage.append(stack[0].ol);
        const activeItemSpan = activeSection.parentElement;
        activeItemSpan.after(onThisPage);
    });

    document.addEventListener('DOMContentLoaded', reloadCurrentHeader);
    document.addEventListener('scroll', reloadCurrentHeader, { passive: true });
})();

