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
        console.log(res);
        let inn = "";
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

function createCard({ id, title, poster_path: poster, overview, genre_ids: genres }) {
    const newCard = document.createElement('div');
    newCard.classList.add('m-2', 'd-flex', 'border');
    newCard.style.cursor = 'pointer';
    // newCard.style.width = '200px';
    newCard.dataset.id = id;
    let inn = '';
    inn += '<div style="width:200px">';
    const posterUrl = poster ? `${IMGURL}w200/${poster}` : './assets/img/empty_poster.jpg';
    inn += `<img src="${posterUrl}">`;
    // inn += '<div class="card-img-overlay">';
    // inn += '</div>';
    inn += '</div>';
    inn += '<div class="p-2">';
    inn += '<h4>';
    inn += title;
    inn += '</h4>';
    inn += '<div class="mb-2">';
    inn += overview;
    inn += '</div>';
    inn += '<div>';
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
    // `<ul class="pagination justify-content-center" style="margin:20px 0">
    // <li class="page-item"><button class="page-link">Previous</button></li>
    // <li class="page-item active"><button class="page-link">1</button></li>
    // <li class="page-item"><button class="page-link">2</button></li>
    // <li class="page-item "><span class="page-link">...</span></li>
    // <li class="page-item"><button class="page-link">3</button></li>
    // <li class="page-item"><button class="page-link">Next</button></li>
    // </ul>`;

    const getNaviBtn = (query, goto, text) => `<li class="page-item${page===goto?' active':''}"><button class="page-link" onclick="doSearch('${query}',${goto})">${text}</button></li>`

    let counter = 0;  // Max 5 page buttons
    let nextPage = Math.max(2, page - 2);
    let inn = '<ul class="pagination justify-content-center" style="margin:20px 0">';
    // // Always previous button
    // if (page > 1) {
    //     inn += getNaviBtn(query, page-1, 'Previous');
    // }
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

    // // Always Next button
    // if (page < pages) {
    //     inn += getNaviBtn(query, page+1, 'Next');
    // }

    inn += '</ul>';
    return inn;

}

////////////////////////////////////////////////////////////////////////////////
// Listeners
searchForm.addEventListener("submit", goSearch);

////////////////////////////////////////////////////////////////////////////////
// Init

getGenres();
