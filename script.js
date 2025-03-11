// 1. handling where it will display cards with movie details as I start typing

document
  .getElementById("search-input")
  .addEventListener("input", async (event) => {
    const searchingFor = event.target.value;

    //for testing purpose, will check if every keystore is being looged or not in console
    // console.log(`I'm searching for : ${searchingFor}`);
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?s=${searchingFor}&apikey=a691cf51`
      );
      const data = await response.json();
      // console.log(data);
      const movies = data.Search;

      //   console.log(movies);      //check if its logging accordingly

      const resultUlEl = document.getElementById("search-results");
      resultUlEl.innerHTML = ""; //clearing prev results

      movies.forEach((movie) => {
        //display the movie card with poster, title and favourite button
        resultUlEl.innerHTML += `
        <div class="movie-card" data-imdbid="${movie.imdbID}" onclick="showMovieDetails('${movie.imdbID}')">
            <div class="favourite-icon" onclick="toggleFavourite(event, '${movie.imdbID}')">
                <i class="far fa-heart"></i>
            </div>
            <img
                src="${movie.Poster}"
                alt="${movie.Title}"
                class="movie-poster"
            />
            <div class="movie-info">
                <h3 class="movie-title">${movie.Title}</h3>
                <p class="movie-year">${movie.Year}</p>
            </div>
        </div>
        `;
      });

      document.querySelectorAll(".movie-card").forEach((card) => {
        card.addEventListener("click", (e) => {
          if (!e.target.classList.contains("favourite-icon")) {
            showMovieDetails(card.getAttribute("data-imdbid"));
          }
        });
      });
    } catch (err) {
      console.error(err);
    }
  });

// function to display movie details on movie.htlm page
function showMovieDetails(imdbId) {
  //storing the imdbID in local storage for further use in the movie.html for displaying movie details:
  localStorage.setItem("selectedMovieId", imdbId);
  window.location.href = "movie.html";
}

// simple conditional check if the current page is movie.html it will call displayMovieDetails();
// this will run after the above function: showMovieDetails(imdbID)
if (window.location.pathname.includes("movie.html")) {
  displayMovieDetails();
}

//function for displaying the movie details on movie.html page
async function displayMovieDetails() {
  //here I'm getting the imdbID that was earlier stored in the localStorage with key : 'selectedMovieId'
  const imdbID = localStorage.getItem("selectedMovieId");

  // retrieve a list of favorite movies from the browser’s localStorage and parse it into a JavaScript array.
  // If there is no item in local storage with the key 'favouriteMovies', it will result in empty array.
  const favourites = JSON.parse(localStorage.getItem("favouriteMovies")) || [];

  const isFavourite = favourites.includes(imdbID); // Checking if the movie is in the favorites list
  try {
    const response = await fetch(
     
      `https://www.omdbapi.com/?i=${imdbID}&apikey=a691cf51`
      
    );

    const movie = await response.json();

    const detailsContainer = document.getElementById("movie-details");
    //will show movie details on movie.html page
    detailsContainer.innerHTML = `
    <div class="movie-card-details">
        <div class="favourite-icon" onclick="toggleFavourite(event, '${
          movie.imdbID
        }')">
        <i class="${
          isFavourite ? "fas" : "far"
        } fa-heart"></i> <!-- Updating class based on favorite status -->
        </div>
        <img src="${movie.Poster}" alt="${
      movie.Title
    }" class="movie-poster-details">
        <div class="movie-info-details">
          <h2 class="movie-title-details"><strong>${movie.Title}</strong></h2>
          <p>
            <span class="movie-detail">📅   ${movie.Year}</span>
            <span class="movie-detail">📍   ${movie.Country}</span>
            <span class="movie-detail"><strong>Rating:</strong> ${
              movie.imdbRating
            }/10</span>
          </p>

          <p><strong>Actors:</strong> ${movie.Actors}</p>
          <p><strong>Director:</strong> ${movie.Director}</p>
          <p><strong>Writers:</strong> ${movie.Writer}</p>
          <p><strong>Genre:</strong> ${movie.Genre}</p>
          <p><strong>Release Date:</strong> ${movie.Released}</p>
          <p><strong>Box Office:</strong> ${movie.BoxOffice}</p>
          <p><strong>Runtime:</strong> ${movie.Runtime}</p>
          
          <p>${movie.Plot}</p>
          <p><strong>🎖</strong> ${movie.Awards}</p>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
  }
}

//handling add/remove from/to favourites
async function loadFavouriteMovies() {
  //getting the ul element "favourites-list" from favourites.html
  const favouritesList = document.getElementById("favourites-list");
  const favourites = JSON.parse(localStorage.getItem("favouriteMovies")) || [];

  //initially setting the html to empty
  favouritesList.innerHTML = "";

  favourites.forEach((imdbID) => {
    //will iterate over the favourites array and displays the movies in favourites
    fetch( `https://www.omdbapi.com/?i=${imdbID}&apikey=a691cf51`)
      .then((response) => response.json())
      .then((movie) => {
        const movieCard = document.createElement("li");
        movieCard.className = "movie-card";
        movieCard.setAttribute("data-imdbid", imdbID);
        movieCard.innerHTML = `
          <img src="${movie.Poster}" alt="${movie.title}" class="movie-poster" />
          <div class="movie-info">
            <h3 class="movie-title">${movie.Title}</h3>
            <p class="movie-year">${movie.Year}</p>
            <p class="movie-rating">${movie.imdbRating}/10</p>
            <div
              class="favourite-icon"
              onclick="toggleFavourite(event, '${movie.imdbID}')"
            >
              <i class="fas fa-heart"></i>
            </div>
          </div>
        `;

        //added below this event listener to redirect form favourites page to movie.html when a card is clicked
        //using selectedMovieId that is stored in localSotrage
        movieCard.addEventListener("click", () => {
          localStorage.setItem("selectedMovieId", imdbID);
          window.location.href = "movie.html";
        });

        // appending the movie card to favouritesList
        favouritesList.appendChild(movieCard);
      })
      .catch((err) => console.error(err));
  });
}

//function for toggling favourites (changing color of fav button, alert, etc)
function toggleFavourite(event, imdbID) {
  event.stopPropagation(); // Stop the click from affecting parent elements

  // finds closest ancestor to favourite-icon and selects the element with class 'fa-heart'
  const icon = event.target
    .closest(".favourite-icon")
    .querySelector(".fa-heart");

  // check if it contains fas, which indicates its favourites
  const isFavourite = icon.classList.contains("fas");

  // Retrieves the list of favorite movies from local storage or defaults to an empty array
  let favourites = JSON.parse(localStorage.getItem("favouriteMovies")) || [];

  if (isFavourite) {
    // Remove from favorites
    //remove fas and add fas: indicating its not a favourite
    icon.classList.remove("fas");
    icon.classList.add("far");

    //will remove the imdbID from the favourites array using filter(as it return array)
    favourites = favourites.filter((id) => id !== imdbID);
    // Update data-favourite attribute (for css)
    icon.setAttribute("data-favourite", "false");
    alert("Movie removed from favourites.");
  } else {
    // similar to that of above
    icon.classList.remove("far");
    icon.classList.add("fas");
    favourites.push(imdbID); // Add the ID to the array
    icon.setAttribute("data-favourite", "true"); // Update data-favourite attribute
    alert("movie added to favourites.");
  }

  // Update local storage
  // Convert the array into a JSON string and store it in localStorage for persistance
  localStorage.setItem("favouriteMovies", JSON.stringify(favourites));

  //  immediately remove the movie card from the list after unfavoriting
  if (isFavourite) {
    const movieCard = icon.closest(".movie-card");
    movieCard.parentNode.removeChild(movieCard);
  }
}

document.addEventListener("DOMContentLoaded", loadFavouriteMovies);
