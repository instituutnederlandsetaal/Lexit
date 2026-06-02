// twtexteditor.js - Reusable WYSIWYG Markdown Editor
// Usage: twtexteditor('mydiv')
(function (global) {
    function twtexteditor(containerId, inputElementToSync = null, autocomplete_api_url = 'https://jsonplaceholder.typicode.com/posts?title=', onInputChange = null) {
        console.log('twtexteditor init:', containerId, autocomplete_api_url);

        if (!containerId) throw new Error('Container ID is required');
        const container = document.querySelector(containerId);
        if (!container) throw new Error('Container not found: ' + containerId);

        if (inputElementToSync) {
            if (typeof inputElementToSync === 'string') {
                inputElementToSync = document.querySelector(inputElementToSync);
                if (!inputElementToSync) throw new Error('Input element to sync not found: ' + inputElementToSync);
            } else if (!(inputElementToSync instanceof HTMLTextAreaElement || inputElementToSync instanceof HTMLInputElement)) {
                throw new Error('inputElementToSync must be a selector string or an HTMLInputElement/HTMLTextAreaElement');
            }
        }

        container.classList.add('twtexteditor');
        const editorHTML = `
            <div class="toolbar">
                <button data-action="bold"><b>B</b></button>
                <button data-action="italic"><i>I</i></button>
                <button data-action="strike">S</button>
                <span class="spacer"></span>
                <button data-action="sup">X<sup>2</sup></button>
                <button data-action="sub">X<sub>2</sub></button>
                <button data-action="list">• List</button>
                <div>
                <button data-action="link">🔗 Link</button>
                    <div class="link-popup" role="dialog" aria-hidden="true">
                        <input class="link-input" id="link-input" placeholder="URL or item name (e.g. https://...)" autocomplete="off" autocapitalize="none" spellcheck="false" autocorrect="off"/>
                        <button class="insert-link">Insert</button>
                        <button class="cancel-link">Cancel</button>
                    </div>
                </div>
            </div>
            <div class="editor-area" contenteditable="true" spellcheck="false"></div>
            <textarea class="markdown-output" rows="8" placeholder="Markdown output (keeps <sup> <sub> tags)"></textarea>
            <div class="link-hover-popup">
                <input class="hover-link-input" type="text" />
                <button class="hover-update-btn">Update</button>
                <button class="hover-remove-btn">Remove</button>
            </div>
            `;

        // const editorHTML = `
        //     <div class="toolbar">toolbar
        //     </div>
        //     `;
        container.insertAdjacentHTML('beforeend', editorHTML);
        // Element references (scoped)
        const toolbar = container.querySelector('.toolbar');
        const editor = container.querySelector('.editor-area');
        const linkPopup = container.querySelector('.link-popup');
        const linkInput = container.querySelector('.link-input');
        const insertLinkBtn = container.querySelector('.insert-link');
        const cancelLinkBtn = container.querySelector('.cancel-link');
        const markdownOutput = container.querySelector('.markdown-output');
        const linkHoverPopup = container.querySelector('.link-hover-popup');
        const hoverLinkInput = container.querySelector('.hover-link-input');
        const hoverUpdateBtn = container.querySelector('.hover-update-btn');
        const hoverRemoveBtn = container.querySelector('.hover-remove-btn');

        if (inputElementToSync && inputElementToSync.value) {
            markdownOutput.value = inputElementToSync.value;
            // Simple conversion from Markdown to HTML for initial content
            let html = markdownOutput.value
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
                .replace(/\*(.+?)\*/g, '<i>$1</i>')
                .replace(/~~(.+?)~~/g, '<s>$1</s>')
                .replace(/<sup>(.+?)<\/sup>/g, '<sup>$1</sup>')
                .replace(/<sub>(.+?)<\/sub>/g, '<sub>$1</sub>')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
                .replace(/^- (.+)$/gm, '<li>$1</li>')
                .replace(/<li>(.+)<\/li>/g, '<ul><li>$1</li></ul>')
                .replace(/\n{2,}/g, '</p><p>')
                .replace(/\n/g, '<br/>');
            editor.innerHTML = html;
            console.log('Initial HTML:', html);
            
        }

        // Selection state
        let savedRange = null;
        function saveSelection() {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) { savedRange = null; return; }
            savedRange = sel.getRangeAt(0).cloneRange();
        }
        function restoreSelection() {
            const sel = window.getSelection();
            sel.removeAllRanges();
            if (savedRange) sel.addRange(savedRange.cloneRange());
        }

        // Formatting actions
        function toggleExec(command) {
            restoreSelection();
            // execCommand is deprecated, but no replacement exists yet
            if (typeof document.execCommand === 'function') {
                document.execCommand(command, false, null);
            } else {
                console.warn('execCommand is not supported in this browser.');
            }
            editor.focus();
            saveSelection();
            renderMarkdown();
        }

        // Sup/Sub toggle
        function unwrapTagInRange(root, range, tagName) {
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
                acceptNode(node) {
                    if (node.tagName && node.tagName.toLowerCase() === tagName.toLowerCase() && range.intersectsNode(node)) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_SKIP;
                }
            });
            const nodes = [];
            let n;
            while ((n = walker.nextNode())) nodes.push(n);
            for (const el of nodes) {
                const frag = document.createDocumentFragment();
                while (el.firstChild) frag.appendChild(el.firstChild);
                el.parentNode.replaceChild(frag, el);
            }
        }
        function toggleInlineTag(tagName) {
            restoreSelection();
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;
            const range = sel.getRangeAt(0);
            if (range.collapsed) return;
            const root = editor;
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
                acceptNode(node) {
                    if (node.tagName && node.tagName.toLowerCase() === tagName.toLowerCase() && range.intersectsNode(node)) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_SKIP;
                }
            });
            let found = false;
            while (walker.nextNode()) found = true;
            if (found) {
                unwrapTagInRange(root, range, tagName);
            } else {
                const wrapper = document.createElement(tagName);
                wrapper.appendChild(range.extractContents());
                range.insertNode(wrapper);
                const newRange = document.createRange();
                newRange.selectNodeContents(wrapper);
                const sel2 = window.getSelection();
                sel2.removeAllRanges();
                sel2.addRange(newRange);
                savedRange = newRange.cloneRange();
            }
            editor.focus();
            saveSelection();
            renderMarkdown();
        }

        // Toolbar actions
        toolbar.addEventListener('click', (ev) => {
            const btn = ev.target.closest('button');
            if (!btn) return;
            const action = btn.dataset.action;
            if (action === 'link') saveSelection();
            switch (action) {
                case 'bold': toggleExec('bold'); break;
                case 'italic': toggleExec('italic'); break;
                case 'strike': toggleExec('strikeThrough'); break;
                case 'list': toggleExec('insertUnorderedList'); break;
                case 'sup': toggleInlineTag('sup'); break;
                case 'sub': toggleInlineTag('sub'); break;
                case 'link': {
                    linkPopup.style.display = 'block';
                    linkPopup.setAttribute('aria-hidden', 'false');
                    linkInput.value = '';
                    linkInput.focus();
                    break;
                }
            }
        });

        // Link dropdown (autocomplete)
        let debounceTimer = null;
        function showLinkDropdown(results) {
            let oldList = container.querySelector('.link-dropdown-list');
            if (oldList) oldList.remove();
            if (!results.length) return;
            const list = document.createElement('ul');
            list.className = 'link-dropdown-list';
            for (const item of results) {
                const li = document.createElement('li');
                li.innerHTML = `<span>${item.title}</span><span class="subtitle">ID: ${item.id}</span>`;
                li.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    linkInput.value = `${item.title}/${item.id}`;
                    linkInput.dispatchEvent(new Event('input'));
                    list.remove();
                });
                list.appendChild(li);
            }
            linkInput.parentNode.appendChild(list);
        }
        function loadLink() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const url = linkInput.value.trim();
                if (!url) return showLinkDropdown([]);
                if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('www.')) return showLinkDropdown([]);
                fetch(`${autocomplete_api_url}${encodeURIComponent(url)}`)
                    .then(r => r.json())
                    .then(data => showLinkDropdown(data));
            }, 300);
        }
        linkInput.addEventListener('keyup', loadLink);

        // Pressing Enter in the input triggers insertLinkBtn click
        linkInput.addEventListener('keydown', function onEnter(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                insertLinkBtn.click();
            }
        });

        // Pressing Escape closes the link popup
        linkInput.addEventListener('keydown', function onEscape(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                linkPopup.style.display = 'none';
            }
        });

        // Link insert/cancel
        insertLinkBtn.addEventListener('click', () => {
            const url = linkInput.value.trim();
            if (!url) { linkPopup.style.display = 'none'; return; }
            restoreSelection();
            document.execCommand('createLink', false, url);
            linkPopup.style.display = 'none';
            linkPopup.setAttribute('aria-hidden', 'true');
            saveSelection();
            renderMarkdown();
            editor.focus();
        });
        cancelLinkBtn.addEventListener('click', () => {
            linkPopup.style.display = 'none';
            linkPopup.setAttribute('aria-hidden', 'true');
            editor.focus();
        });

        // Close popup on outside click
        document.addEventListener('click', (e) => {
            if (!linkPopup.contains(e.target) && !e.target.closest('button[data-action="link"]')) {
                linkPopup.style.display = 'none';
                linkPopup.setAttribute('aria-hidden', 'true');
            }
        });

        // Link hover popup
        let hoveredLink = null;
        let popupHideTimeout = null;
        function showLinkHoverPopup(link) {
            hoveredLink = link;
            const rect = link.getBoundingClientRect();
            linkHoverPopup.style.left = (rect.left + window.scrollX) + 'px';
            linkHoverPopup.style.top = (rect.bottom + window.scrollY + 4) + 'px';
            hoverLinkInput.value = link.getAttribute('href') || '';
            linkHoverPopup.style.display = 'block';
        }
        function hideLinkHoverPopup() {
            linkHoverPopup.style.display = 'none';
            hoveredLink = null;
        }
        editor.addEventListener('mouseover', (e) => {
            const link = e.target.closest('a');
            if (link && editor.contains(link)) {
                clearTimeout(popupHideTimeout);
                showLinkHoverPopup(link);
            }
        });
        editor.addEventListener('mouseout', (e) => {
            const link = e.target.closest('a');
            if (link && editor.contains(link)) {
                popupHideTimeout = setTimeout(() => {
                    if (!linkHoverPopup.matches(':hover')) hideLinkHoverPopup();
                }, 120);
            }
        });
        linkHoverPopup.addEventListener('mouseenter', () => {
            clearTimeout(popupHideTimeout);
            if (hoveredLink) linkHoverPopup.style.display = 'block';
        });
        linkHoverPopup.addEventListener('mouseleave', () => {
            popupHideTimeout = setTimeout(() => hideLinkHoverPopup(), 120);
        });
        hoverUpdateBtn.addEventListener('click', () => {
            if (hoveredLink) {
                hoveredLink.setAttribute('href', hoverLinkInput.value);
                linkHoverPopup.style.display = 'none';
                renderMarkdown();
            }
        });
        hoverRemoveBtn.addEventListener('click', () => {
            if (hoveredLink) {
                const text = hoveredLink.textContent;
                hoveredLink.replaceWith(document.createTextNode(text));
                linkHoverPopup.style.display = 'none';
                renderMarkdown();
            }
        });

        // Markdown conversion
        function domToMarkdown(node) {
            if (!node) return '';
            if (node.nodeType === Node.TEXT_NODE) return node.nodeValue || '';
            if (node.nodeType === Node.ELEMENT_NODE) {
                const tag = node.tagName.toLowerCase();
                if (tag === 'b' || tag === 'strong') return `**${childrenToMarkdown(node)}**`;
                if (tag === 'i' || tag === 'em') return `*${childrenToMarkdown(node)}*`;
                if (tag === 's' || tag === 'strike' || tag === 'del') return `~~${childrenToMarkdown(node)}~~`;
                if (tag === 'a') return `[${childrenToMarkdown(node)}](${node.getAttribute('href') || ''})`;
                if (tag === 'sup') return `<sup>${childrenToMarkdown(node)}</sup>`;
                if (tag === 'sub') return `<sub>${childrenToMarkdown(node)}</sub>`;
                if (tag === 'br') return '\n';
                if (tag === 'ul') {
                    let out = '';
                    for (const ch of node.children) {
                        if (ch.tagName.toLowerCase() === 'li') {
                            let liText = childrenToMarkdown(ch).trim();
                            liText = liText.replace(/\n+$/, '');
                            out += '- ' + liText + '\n';
                        }
                    }
                    return out;
                }
                if (tag === 'li') return childrenToMarkdown(node) + '\n';
                if (tag === 'p' || tag === 'div') {
                    const inner = childrenToMarkdown(node).trim();
                    return inner ? inner + '\n\n' : '\n';
                }
                return childrenToMarkdown(node);
            }
            return '';
        }
        function childrenToMarkdown(node) {
            let out = '';
            for (const child of node.childNodes) out += domToMarkdown(child);
            return out;
        }
        function renderMarkdown() {
            const tmp = document.createElement('div');
            for (const c of editor.childNodes) tmp.appendChild(c.cloneNode(true));
            let md = childrenToMarkdown(tmp);
            md = md.replace(/\n{3,}/g, '\n\n').trim();
            markdownOutput.value = md;
            console.log('Markdown:', md);
            console.log('HTML:', editor.innerHTML);
            console.log('inputElementToSync:', inputElementToSync);

            $(".dataTables_scrollBody td.definitie").text(md);

            let inputElementToSyncOldValue = inputElementToSync ? inputElementToSync.value : null;
            if (inputElementToSync) inputElementToSync.value = md;
            
            // if the inputElementToSync changes, call the onInputChange callback
            if (inputElementToSync && inputElementToSyncOldValue !== md) {
                if (onInputChange && typeof onInputChange === 'function') {
                    onInputChange();
                } else {
                    console.warn('onInputChange is not a function:', onInputChange);
                }
            }
        }

        // Editor events
        editor.addEventListener('input', renderMarkdown);
        function maybeSaveSelection() {
            if (linkPopup.style.display !== 'block') saveSelection();
        }
        editor.addEventListener('keyup', maybeSaveSelection);
        editor.addEventListener('mouseup', maybeSaveSelection);

        // Initialization
        // editor.innerHTML = '';
        saveSelection();
        renderMarkdown();

        // Keyboard shortcuts
        container.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault(); saveSelection(); toggleExec('bold');
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
                e.preventDefault(); saveSelection(); toggleExec('italic');
            }
        });
    }
    global.twtexteditor = twtexteditor;
})(window);
