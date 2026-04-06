// ==UserScript==
// @name         Отображение новых эмодзи для Windows 10
// @namespace    https://github.com/Vova-iz-Tambova/windows-10-emoji-square-fixer
// @version      1.0.2
// @description  Заменяет отсутствующие в Windows 10 современные эмодзи (Unicode 13-16) на актуальные картинки Twemoji 15.0.3. Поддерживает новые эмодзи: сердце-руки, растение в горшке, бабл-ти и другие. Исправлено отображение эмодзи 🤌 и 🩷.
// @author       Vova-iz-Tambova
// @homepageURL  https://github.com/Vova-iz-Tambova/windows-10-emoji-square-fixer
// @supportURL   https://github.com/Vova-iz-Tambova/windows-10-emoji-square-fixer/issues
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Регулярное выражение для поиска современных эмодзи (Unicode 13+)
    const modernEmojiRegex = /[\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu;

    function getTwemojiUrl(emoji) {
        const codePoint = emoji.codePointAt(0).toString(16);
        return `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${codePoint}.svg`;
    }

    function replaceMissingEmojis() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    if (node.parentElement?.closest?.('.emoji-fixed')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    if (modernEmojiRegex.test(node.textContent)) {
                        modernEmojiRegex.lastIndex = 0;
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_SKIP;
                }
            }
        );

        const nodesToReplace = [];
        let node;
        while (node = walker.nextNode()) {
            nodesToReplace.push(node);
        }

        for (const textNode of nodesToReplace) {
            let newHtml = textNode.textContent;
            let changed = false;

            newHtml = newHtml.replace(modernEmojiRegex, (match) => {
                const imgUrl = getTwemojiUrl(match);
                changed = true;
                return `<img src="${imgUrl}" alt="${match}" title="${match}" style="height: 1.2em; width: 1.2em; vertical-align: middle; display: inline-block;" onerror="this.style.display='none'">`;
            });

            if (changed) {
                const wrapper = document.createElement('span');
                wrapper.classList.add('emoji-fixed');
                wrapper.innerHTML = newHtml;
                textNode.parentNode.replaceChild(wrapper, textNode);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', replaceMissingEmojis);
    } else {
        replaceMissingEmojis();
    }

    const observer = new MutationObserver(() => replaceMissingEmojis());
    observer.observe(document.body, { childList: true, subtree: true });
})();