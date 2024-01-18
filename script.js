const query = document.querySelector('.search');
const button = document.querySelector('.btn');
const outputbox = document.querySelector('.outputbox');
const audio = document.getElementById('audio');

const api = 'https://api.dictionaryapi.dev/api/v2/entries/en/'; 


button.addEventListener('click', () => {
    fetchword();
});

query.addEventListener('keydown', (e) => {
    if (e.keyCode === 13 || e.key === "Enter") {
        fetchword();
    }
});





async function fetchword(){
    const word = query.value.toLowerCase();
    if(!word){
        alert('Please enter a word');
        return;
    }

    const loader = displayloader();

    let result;
    try{
        const response = await fetch(`${api}${word}`);

        if (response.status > 400) {
            throw Error(response.status);
        }
        const words = await response.json();

        result = getdefinition(words);
    }
    catch(error){
        result = displayerror(error);
    } 
    finally{
        outputbox.innerHTML = result;
        query.value = "";
        loader.remove();
    }

}
function displayloader(){
    const loader = document.createElement('div');
    loader.classList.add('loader');
    loader.innerHTML = `
    <i class="fa-solid fa-spinner icon"></i>
    <p class="description">Loading...</p>
    `;
    outputbox.appendChild(loader);
    return loader;
}

function displayerror(err) {
    const error = document.createElement('div');
    error.classList.add('error');
    error.innerHTML = `
      ${Number(err.toString().match(/\d{3}$/)) === 404
      ? `<h4 class="reason">Sorry, I couldn't find it.</h4>
          <p class="suggestion">Please check your spelling or try again later.</p>`
      : ''}
    `;
    outputbox.appendChild(error);
    return error;
}
//Function to call API and get the definition of a word from Oxford Dictionaries
function getdefinition(words) {
     return words.map((wordObj) =>
        wordObj.meanings
          .map(
            (meaning) =>
              `<section class="card">
                <section class="word-audio-container">
                  <section class="word-container">
                    <h4 class="word">${wordObj.word}</h4>
                    <p class="part-of-speech">${meaning.partOfSpeech}</p>
                    ${wordObj.origin ? `<p class="origin">Origin: ${wordObj.origin}</p>` : ''}
                  </section>
                  ${wordObj.phonetics.reduce((result, phonetic) => {
                    if (phonetic.audio && phonetic.text && !result) {
                      result = `<button class="play-audio" data-soundtrack="${phonetic.audio}" onclick="playAudio(this.dataset.soundtrack)"><i class="fa-solid fa-volume-high"></i></button>`;
                    }
                    return result;
                  }, "")}
                </section>
  
                <section class="phonetic-container">
                  ${wordObj.phonetics
                    .map((phonetic) =>
                      phonetic.audio && phonetic.text
                        ? `<button data-soundtrack="${phonetic.audio}" class="phonetic" onclick="playAudio(this.dataset.soundtrack)">${phonetic.text} <i class="fa-solid fa-volume-high"></i></button>`
                        : ""
                    )
                    .join("")}
                </section>
  
                <section class="definition-container">
                  <ol>
                    ${meaning.definitions
                      .map((definitionObj) =>
                        definitionObj.example
                          ? `<li>
                              <p class="definition">${definitionObj.definition}</p>
                              <p class="example">${definitionObj.example}</p>
                            </li>`
                          : `<li>
                              <p class="definition">${definitionObj.definition}</p>
                            </li>`
                      )
                      .join("\n")}
                  </ol>
                </section>
              </section>`
          )
          .join("\n")
      )
      .join("\n");
}
  
const playAudio = (url) => {
    audio.setAttribute('src', url);
    audio.play();
}
  