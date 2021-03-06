/**
 * (c) Kitodo. Key to digital objects e.V. <contact@kitodo.org>
 *
 * This file is part of the Kitodo and TYPO3 projects.
 *
 * @license GNU General Public License version 3 or later.
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 */

/**
 * This function increases the start parameter of the search form and submits
 * the form.
 *
 * @returns void
 */
function nextResultPage() {
    var currentStart = $("#tx-dlf-search-in-document-form input[id='tx-dlf-search-in-document-start']").val();
    var newStart = parseInt(currentStart) + 20;
    $("#tx-dlf-search-in-document-form input[id='tx-dlf-search-in-document-start']").val(newStart);
    $('#tx-dlf-search-in-document-form').submit();
};

/**
 * This function decreases the start parameter of the search form and submits
 * the form.
 *
 * @returns void
 */
function previousResultPage() {
    var currentStart = $("#tx-dlf-search-in-document-form input[id='tx-dlf-search-in-document-start']").val();
    var newStart = (parseInt(currentStart) > 20) ? (parseInt(currentStart) - 20) : 0;
    $("#tx-dlf-search-in-document-form input[id='tx-dlf-search-in-document-start']").val(newStart);
    $('#tx-dlf-search-in-document-form').submit();
};

/**
 * This function resets the start parameter on new queries.
 *
 * @returns void
 */
function resetStart() {
    $("#tx-dlf-search-in-document-form input[id='tx-dlf-search-in-document-start']").val(0);
}

/**
 * Add highlight effect for found search phrase.
 * @param {array} highlightIds
 * 
 * @returns void
 */
function addHighlightEffect(highlightIds) {
    if (highlightIds.length > 0) {
        highlightIds.forEach(function (highlightId) {
            var targetElement = $('#' + highlightId);
    
            if (targetElement.length > 0 && !targetElement.hasClass('highlight')) {
                targetElement.addClass('highlight');
            }
        });
    }
}

/**
 * Get base URL for snippet links.
 * 
 * @param {string} id
 * 
 * @returns {string}
 */
function getBaseUrl(id) {
    // Take the workview baseUrl from the form action.
    // The URL may be in the following form
    // - http://example.com/index.php?id=14
    // - http://example.com/workview (using slug on page with uid=14)
    var baseUrl = $("form#tx-dlf-search-in-document-form").attr('action');

    // check if action URL contains id, if not, get URL from window
    if(baseUrl.split('?')[0].indexOf(id) === -1) {
        baseUrl = $(location).attr('href');
    }

    return baseUrl;
}

/**
 * Get current URL query parameters.
 * It returns array of params in form 'param=value' if there are any params supplied in the given url. If there are none it returns empty array
 * 
 * @param {string} baseUrl
 * 
 * @returns {array} array with params or empty 
 */
function getCurrentQueryParams(baseUrl) {
    if(baseUrl.indexOf('?') > 0) {
        return baseUrl.slice(baseUrl.indexOf('?') + 1).split('&');
    }

    return [];
}

/**
 * Get all URL query parameters for snippet links.
 * All means that it includes together params which were already supplied in the page url and params which are returned as search results.
 * 
 * @param {string} baseUrl
 * @param {array} queryParams
 * 
 * @returns {array} array with params in form 'param' => 'value'
 */
function getAllQueryParams(baseUrl, queryParams) {
    var params = getCurrentQueryParams(baseUrl);

    var queryParam;
    for(var i = 0; i < params.length; i++) {
        queryParam = params[i].split('=');
        if(queryParams.indexOf(queryParam[0]) === -1) {
            queryParams.push(queryParam[0]);
            queryParams[queryParam[0]] = queryParam[1];
        }
    }
    return queryParams;
}

/**
 * Get needed URL query parameters.
 * It returns array of params as objects 'param' => 'value'. It contains exactly 3 params which are taken out of search result.
 * 
 * @param {array} element
 * 
 * @returns {array} array with params in form 'param' => 'value' 
 */
function getNeededQueryParams(element) {
    var id = $("input[id='tx-dlf-search-in-document-id']").attr('name');
    var highlightWord = $("input[id='tx-dlf-search-in-document-highlight-word']").attr('name');
    var page = $("input[id='tx-dlf-search-in-document-page']").attr('name');

    var queryParams = [];
        
    if(getBaseUrl(element['uid']).split('?')[0].indexOf(element['uid']) === -1) {
        queryParams.push(id);
        queryParams[id] = element['uid'];
    }
    queryParams.push(highlightWord);
    queryParams[highlightWord] = encodeURIComponent($("input[id='tx-dlf-search-in-document-query']").val());
    queryParams.push(page);
    queryParams[page] = element['page'];
    queryParams.push('hl');
    queryParams['hl'] = encodeURIComponent(getHighlightWords(element['words']));

    return queryParams;
}

function getHighlightWords(words) {
    var highlightWords = $("input[id='tx-dlf-search-in-document-query']").val();

    for(var i = 0; i < words.length; i++) {
        if (highlightWords === "") {
            highlightWords += words[i];
        } else {
            if(highlightWords.indexOf(words[i]) === -1) {
                highlightWords += ' ' + words[i];
            }
        }
    }

    return highlightWords;
}

/**
 * Get snippet link.
 * 
 * @param {array} element
 * 
 * @returns {string}
 */
function getLink(element) {
    var baseUrl = getBaseUrl(element['uid']);

    var queryParams = getNeededQueryParams(element);

    if (baseUrl.indexOf('?') > 0) {
        queryParams = getAllQueryParams(baseUrl, queryParams);
        baseUrl = baseUrl.split('?')[0];
    }

    var link = baseUrl + '?';

    // add query params to result link
    for(var i = 0; i < queryParams.length; i++) {
        link += queryParams[i] + '=' + queryParams[queryParams[i]] + '&';
    }
    link = link.slice(0, -1);
    return link;
}

function getNavigationButtons(start, numFound) {
    var buttons = "";

    if (start > 0) {
        buttons += '<input type="button" id="tx-dlf-search-in-document-button-previous" class="button-previous" onclick="previousResultPage();" value="' + $('#tx-dlf-search-in-document-label-previous').text() + '" />';
    }

    if (numFound > (start + 20)) {
        buttons += '<input type="button" id="tx-dlf-search-in-document-button-next" class="button-next" onclick="nextResultPage();" value="' + $('#tx-dlf-search-in-document-label-next').text() + '" />';
    }
    return buttons;
}

function search() {
    resetStart();

    $('#tx-dlf-search-in-document-loading').show();
    $('#tx-dlf-search-in-document-clearing').hide();
    $('#tx-dlf-search-in-document-button-next').hide();
    $('#tx-dlf-search-in-document-button-previous').hide();
    // Send the data using post
    $.post(
        // this URL needs to match to URL on which stands viewer
        "https://sdvtypo3ddbzeitungsportaldev.slub-dresden.de/",
        {
            eID: "tx_dlf_search_in_document",
            q: $("input[id='tx-dlf-search-in-document-query']").val(),
            uid: $("input[id='tx-dlf-search-in-document-id']").val(),
            start: $("input[id='tx-dlf-search-in-document-start']").val(),
            encrypted: $("input[id='tx-dlf-search-in-document-encrypted']").val(),
        },
        function (data) {
            var resultItems = [];
            var resultList = '<div class="results-active-indicator"></div><ul>';
            var start = -1;
            if (data['numFound'] > 0) {
                var page = getCurrentPage();
                data['documents'].forEach(function (element, i) {
                    if (start < 0) {
                        start = i;
                    }

                    if (element['snippet'].length > 0) {
                        resultItems[element['page']] = '<span class="structure">'
                            + $('#tx-dlf-search-in-document-label-page').text() + ' ' + element['page']
                            + '</span><br />'
                            + '<span ="textsnippet">'
                            + '<a href=\"' + getLink(element) + '\">' + element['snippet'] + '</a>'
                            + '</span>';
                    }

                    if(element['page'] == page) {
                        addHighlightEffect(element['highlight']);
                    }
                });
                // Sort result by page.
                resultItems.sort(function (a, b) {
                    return a - b;
                });
                resultItems.forEach(function (item, index) {
                    resultList += '<li>' + item + '</li>';
                });
            } else {
                resultList += '<li class="noresult">' + $('#tx-dlf-search-in-document-label-noresult').text() + '</li>';
            }
            resultList += '</ul>';
            resultList += getNavigationButtons(start, data['numFound']);
            $('#tx-dlf-search-in-document-results').html(resultList);

            addImageHighlightAfterFirstLoad(data);
        },
        "json"
    ).done(function (data) {
        $('#tx-dfgviewer-sru-results-loading').hide();
        $('#tx-dfgviewer-sru-results-clearing').show();
    });
}

function getCurrentPage() {
    var page = 1;
    var queryParams = getCurrentQueryParams(getBaseUrl(" "));

    for(var i = 0; i < queryParams.length; i++) {
        var queryParam = queryParams[i].split('=');

        if(queryParam[0] === $("input[id='tx-dlf-search-in-document-page']").attr('name')) {
            page = queryParam[1];
        }
    }

    return page;
}

function addImageHighlightAfterFirstLoad(data) {
    var queryParams = getCurrentQueryParams(getBaseUrl(" "));
    var hlParameterFound = false;
    
    for(var i = 0; i < queryParams.length; i++) {
        var queryParam = queryParams[i].split('=');

        if(queryParam[0] ==='hl') {
            hlParameterFound = true;
            break;
        }
    }

    if(!hlParameterFound && data['numFound'] > 0) {
        var page = getCurrentPage();

        data['documents'].forEach(function (element, i) {
            if(element['page'] == page) {
                if (element['words'].length > 0) {
                    if(tx_dlf_viewer.map != null) {
                        tx_dlf_viewer.displayHighlightWord(encodeURIComponent(getHighlightWords(element['words'])));
                    } else {
                        setTimeout(addImageHighlightAfterFirstLoad, 500, data);
                    }
                }
                addHighlightEffect(element['highlight'])
            }
        });
    }
}

function clearSearch() {
    $('#tx-dlf-search-in-document-results ul').remove();
    $('.results-active-indicator').remove();
    $('#tx-dlf-search-in-document-query').val('');
}

function triggerSearchAfterHitLoad() {
    var queryParams = getCurrentQueryParams(getBaseUrl(" "));

    for(var i = 0; i < queryParams.length; i++) {
        var queryParam = queryParams[i].split('=');

        if(queryParam[0].indexOf($("input[id='tx-dlf-search-in-document-highlight-word']").attr('name')) != -1) {
            $("input[id='tx-dlf-search-in-document-query']").val(decodeURIComponent(queryParam[1]));
            search();
            break;
        } else if(queryParam[0].indexOf('query') != -1) {
            $("input[id='tx-dlf-search-in-document-query']").val(decodeURIComponent(queryParam[1]).replace('+', ' '));
            search();
            break;
        }
    }
}

$(document).ready(function() {
    document.getElementById('tx-dlf-search-in-document-query').addEventListener("keydown", function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            search();
        }
    });

    triggerSearchAfterHitLoad()
});
