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
const alertBox = document.querySelector('#alert-box');
const myModal = new bootstrap.Modal(document.getElementById('myModal'));
const modalTitle = document.querySelector('#modal-title');
const modalImg = document.querySelector('#modal-img');
const modalText = document.querySelector('#modal-text');

////////////////////////////////////////////////////////////////////////////////
// Globals
let lang = "en";
let genres = {};
let results = {};

////////////////////////////////////////////////////////////////////////////////
// Classes

////////////////////////////////////////////////////////////////////////////////
// Utils
function getSearchURL(query, page=1) {
    let url = SEARCHURL;
    url += "&language=" + selectLang.value;
    url += "&query=" + query;
    url += "&page=" + page;
    return url;
}

function cutText(text) {
    return text.length > MAX_TEXT_LENGTH ? text.substring(0, MAX_TEXT_LENGTH) + '...' : text;
}

function reportError(text) {
    alertBox.innerHTML = `<div class="alert alert-danger alert-dismissible">
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    ${text}</div>`;
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

function getMovieData(id, callback) {
    callback(results[id]);
}

function goSearch(ev) {
    ev.preventDefault();

    const query = searchInput.value;
    if (query.length < 2) {
        reportError("Two characters minimum.");
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
        results = {};
        res.results.forEach(movie => {
            results[movie.id] = movie;
            container.appendChild(createCard(movie));
        });
        // Pagination bar
        const paginationBar = createNavigation(query, res.page, res.total_pages);
        document.querySelectorAll('.pagination-bar')
            .forEach(bar=>bar.innerHTML=paginationBar);
    });
}

function createCard(data) {
    const { id,
        title,
        original_title: origTitle,
        poster_path: poster,
        overview,
        genre_ids: genres,
        vote_average: stars} = data;

    const newCard = document.createElement('div');
    newCard.classList.add('m-2', 'd-flex', 'border');
    newCard.style.cursor = 'pointer';
    newCard.style.width = '600px';
    newCard.style.height = '302px';
    newCard.dataset.id = id;
    let inn = '';
    inn += '<div style="width:200px">';
    const posterUrl = poster ? `${IMGURL}w200${poster}` : './assets/img/empty_poster.jpg';
    inn += `<img src="${posterUrl}">`;
    inn += '</div>';

    inn += '<div class="d-flex flex-column justify-content-between w-100">';
    inn += '  <div>';
    inn += `      <h4 class="card-header">${title}</h4>`;
    inn += '    <div class="p-2">';
    if (title !== origTitle) {
        inn += `  <h6>(${origTitle})</h6>`;
    }
    inn +=        cutText(overview);
    inn += '    </div>';
    inn += '  </div>';
    inn += '  <div class="p-2 d-flex justify-content-between">';
    inn += '    <div>';
    inn +=        getStars(stars);
    inn += '    </div>';
    inn += '    <div>';
    inn +=        listGenres(genres);
    inn += '    </div>';
    inn += '  </div>';
    inn += '</div>';

    newCard.innerHTML = inn;
    newCard.addEventListener("click", goMovieDetails);
    return newCard;
}

function goMovieDetails(ev) {

    getMovieData(ev.currentTarget.dataset.id, (data) => {
        let title = data.title;
        if (data.original_title !== data.title) {
            title += ` <small>(${data.original_title})</small>`;
        }
        modalTitle.innerHTML = title;
        modalImg.innerHTML = `<img src="${IMGURL}w500${data.poster_path}">`;
        let content = '<p>' + data.release_date.substring(0, 4) + '</p>';
        content += `<p>${data.overview}</p>`;
        modalText.innerHTML = `${content}`;
        myModal.show();
    });

}

function listGenres(genresArray) {
    return genresArray.map(genId => genres[genId]).join(', ');
}

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
    if (pages >= page) {
        inn += getNaviBtn(query, pages, pages);
    }

    inn += '</ul>';
    return inn;
}

/**
 * Get a number 0-10 and return a 5 starts rating.
 */
function getStars(num) {
    let inn = '<span class="text-warning">';
    for (let i=0; i<10; i+=2) {
        if      (num > i)   { inn += '<i class="bi bi-star-fill"></i>'; }
        else if (num > i-1) { inn += '<i class="bi bi-star-half"></i>'; }
        else                { inn += '<i class="bi bi-star"></i>';      }
    }
    inn += '</span>';
    return inn;
}


////////////////////////////////////////////////////////////////////////////////
// Listeners
searchForm.addEventListener("submit", goSearch);

////////////////////////////////////////////////////////////////////////////////
// Init

getGenres();
