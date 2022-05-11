'use strict';
////////////////////////////////////////////////////////////////////////////////
// Movie Search Exercise
// for The Bridge
// by  xavimat
// 2022-05-11
//
////////////////////////////////////////////////////////////////////////////////
// Constants
const SEARCHURL = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&include_adult=false`;
const IMGURL = `https://image.tmdb.org/t/p/`;
const MAX_TEXT_LENGTH = 240;

////////////////////////////////////////////////////////////////////////////////
// DOM
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const container = document.querySelector('#container');
const selectLang = document.querySelector('#select-lang');

////////////////////////////////////////////////////////////////////////////////
// Globals
let lang = "en";
let genres = {};

////////////////////////////////////////////////////////////////////////////////
// Classes


////////////////////////////////////////////////////////////////////////////////
// Utils
function getSearchURL(query, page=1) {
    // console.log("page", page);
    let url = SEARCHURL;
    url += "&language=" + selectLang.value;
    url += "&query=" + query;
    url += "&page=" + page;
    return url;
}

function cutText(text) {
    return text.length > MAX_TEXT_LENGTH ? text.substring(0, MAX_TEXT_LENGTH) + '...' : text;
}

////////////////////////////////////////////////////////////////////////////////
// Functions

function getGenres() {
    // Get genres list from DB
    const genreURL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en`;

    axios(genreURL)
        .then(res => {
            res.data.genres.forEach(obj => { genres[obj.id] = obj.name });
        });

}


function getData(query, page, callback) {
    axios(getSearchURL(query, page))
        .then(res => callback(res.data))
        .catch(error => console.error(error));
}

function goSearch(ev) {
    ev.preventDefault();

    const query = searchInput.value;
    if (query.length < 2) {
        // reportError("Two characters minimum.");
        return;
    }

    doSearch(query, 1);
}

function doSearch(query, page) {

    // Empty former results
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    getData(query, page, (res) => {
        console.log(res.results[0]);
        res.results.forEach(movie => {
            container.appendChild(createCard(movie));
        });
        // Pagination bar
        const paginationBar = createNavigation(query, res.page, res.total_pages);
        document.querySelectorAll('.pagination-bar')
            .forEach(bar=>bar.innerHTML=paginationBar);
        console.log(res.page);
    });
}

function createCard(data) {
    const { id,
        title,
        original_title: origTitle,
        poster_path: poster,
        overview,
        genre_ids: genres } = data;

    const newCard = document.createElement('div');
    newCard.classList.add('m-2', 'd-flex', 'border');
    newCard.style.cursor = 'pointer';
    newCard.style.width = '600px';
    newCard.style.height = '300px';
    newCard.dataset.id = id;
    let inn = '';
    inn += '<div style="width:200px">';
    const posterUrl = poster ? `${IMGURL}w200/${poster}` : './assets/img/empty_poster.jpg';
    inn += `<img src="${posterUrl}">`;
    // inn += '<div class="card-img-overlay">';
    // inn += '</div>';
    inn += '</div>';
    inn += '<div class="p-2 d-flex flex-column justify-content-between">';
    inn += '<div>';
    inn += `<h4>${title}</h4>`;
    if (title !== origTitle) {
        inn += `<h6>(${origTitle})</h6>`;
    }
    inn += '<div class="mb-2">';
    inn += cutText(overview);
    inn += '</div>';
    inn += '</div>';
    inn += '<div class="align-self-end">';
    inn += listGenres(genres);
    inn += '</div>';
    inn += '</div>';

    newCard.innerHTML = inn;
    newCard.addEventListener("click", goMovieDetails);
    return newCard;
}

function goMovieDetails(ev) {
    console.log(ev.currentTarget.dataset.id);
}

function listGenres(genresArray) {
    return genresArray.map(genId => genres[genId]).join(', ');
}

/**
 *
 * @param page  current page
 * @param pages total pages
 */
function createNavigation(query, page, pages) {

    if (pages === 1) {
        return '';
    }

    const getNaviBtn = (query, goto, text) => `<li class="page-item${page===goto?' active':''}"><button class="page-link" onclick="doSearch('${query}',${goto})">${text}</button></li>`

    let counter = 0;  // Max 5 page buttons
    let nextPage = Math.max(2, page - 2);
    let inn = '<ul class="pagination justify-content-center" style="margin:20px 0">';

    // Always first button
    inn += getNaviBtn(query, 1, 1);

    if (page > 4) {
        inn += '<li class="page-item "><span class="page-link">...</span></li>';
    }

    while (counter < 5 && nextPage < pages) {
        inn += getNaviBtn(query, nextPage, nextPage);
        nextPage++;
        counter++;
    }

    if (pages - page > 3) {
        inn += '<li class="page-item "><span class="page-link">...</span></li>';
    }

    // Last button
    if (pages > page) {
        inn += getNaviBtn(query, pages, pages);
    }

    inn += '</ul>';
    return inn;
}

////////////////////////////////////////////////////////////////////////////////
// Listeners
searchForm.addEventListener("submit", goSearch);

////////////////////////////////////////////////////////////////////////////////
// Init

getGenres();
