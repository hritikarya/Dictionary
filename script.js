let brainController = (function() {
    let Dkey = '38ad820a-0615-477f-9a22-6fe57a209eef';

    return {
        callAPI: async function(word) {
            try {
                let response = await fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${Dkey}`);
                let answer = await response.json();
                return answer;
            } catch(error) {
                console.log(error);
            }
        }
    }
})();
let UIcontroller = (function() {
    let DOMstrings = {
        audioID: '#myAudio',
        searchInput: '.search-input',
        searchBtn: '.search-btn',
        outputWord: '#output-word',
        outputContainer: '.output-container',
        outputPronunciation: '#output-pronunciation',
        wordType: '.word-type',
        wordMeaning: '.word-meaning',
        didYouMean: '.did-you-mean',
        didYouMeanBtn: '.did-you-mean-btn',
        didYouMeanBtnContainer: '.did-you-mean-btn-container'
    }
    return {
        DOMstrings,
        getInputFromInputField: function() {
            return document.querySelector(DOMstrings.searchInput).value;
        },
        postInputIntoInputField: function(word) {
            document.querySelector(DOMstrings.searchInput).value = word;
        },
        updateUIvalid: function(answer) {
            document.querySelector(DOMstrings.didYouMean).style.display = 'none';
            document.querySelector(DOMstrings.outputContainer).style.display = 'block';
            let html = '';
            document.querySelector(DOMstrings.outputWord).innerText = '';
            document.querySelector(DOMstrings.outputPronunciation).innerText = '';
            document.querySelector(DOMstrings.wordType).innerText = '';
            document.querySelector(DOMstrings.wordMeaning).innerHTML = '';
            document.querySelector(DOMstrings.outputWord).innerHTML = `<i class="fa fa-volume-up sound-btn" aria-hidden="true"></i> ` + document.querySelector(DOMstrings.searchInput).value;
            try {
                document.querySelector(DOMstrings.outputPronunciation).innerText = '/ '  + answer[0].hwi.prs[0].mw + ' /';
            } catch(error) {
                console.log(error);
                document.querySelector(DOMstrings.outputPronunciation).innerText = `/ ${document.querySelector(DOMstrings.searchInput).value} /`
            }
            document.querySelector(DOMstrings.wordType).innerText = answer[0].fl;
            html = `<ol>`;
            for (let i = 0; i < answer[0].shortdef.length; i++) {
                html += `<li>${answer[0].shortdef[i]}</li>`;
            }
            document.querySelector(DOMstrings.wordMeaning).insertAdjacentHTML('beforeend', html);
        },
        updateUIinvalid: function(answer) {
            let html = ``;
            document.querySelector(DOMstrings.outputContainer).style.display = 'none';
            document.querySelector(DOMstrings.didYouMean).style.display = 'block';
            for (let i = 0; i < answer.length && i < 5; i++) {
                html += `<button class="did-you-mean-btn" value="${answer[i]}">${answer[i]}</button>`;
            }
            document.querySelector(DOMstrings.didYouMeanBtnContainer).innerHTML = '';
            document.querySelector(DOMstrings.didYouMeanBtnContainer).insertAdjacentHTML('beforeend', html);
        }, 
        emptyInputBox: function() {
            document.querySelector(DOMstrings.searchInput).value = '';
        },
        emptyUI: function() {
            document.querySelector(DOMstrings.didYouMean).style.display = 'none';
            document.querySelector(DOMstrings.outputContainer).style.display = 'block';
            document.querySelector(DOMstrings.outputWord).innerText = '';
            document.querySelector(DOMstrings.outputPronunciation).innerText = '';
            document.querySelector(DOMstrings.wordType).innerText = '';
            document.querySelector(DOMstrings.wordMeaning).innerHTML = '';
            document.querySelector(DOMstrings.outputWord).innerText = 'No such word exists';
        },
        emptyForLoader: function() {
            document.querySelector(DOMstrings.didYouMean).style.display = 'none';
            document.querySelector(DOMstrings.outputContainer).style.display = 'block';
            document.querySelector(DOMstrings.outputWord).innerText = '';
            document.querySelector(DOMstrings.outputPronunciation).innerText = '';
            document.querySelector(DOMstrings.wordType).innerText = '';
            document.querySelector(DOMstrings.wordMeaning).innerHTML = '';
        },
        insertLoader: function() {
            document.querySelector('.loader').style.display = 'block';
        },
        removeLoader: function() {
            document.querySelector('.loader').style.display = 'none';
        },
        insertAudio: function(soundURL) {
            let html = '';
            html += `<audio id="myAudio"><source id="myAudioSource" src="${soundURL}"></audio>`;
            document.getElementById('audioSpan').innerHTML = '';
            document.getElementById('audioSpan').insertAdjacentHTML('afterbegin', html);
            let elem = document.querySelector(DOMstrings.audioID);
            document.getElementsByClassName('sound-btn')[0].addEventListener('click', function() {
                console.log(elem);
                elem.play();
            });
        }
    }
})();
let mainController = (function(brainCtrl, UIctrl) {
    let renderSound = (soundName) => {
        let subdirectory = soundName.charAt(0);
        if (soundName.indexOf('bix') == 0) {
            subdirectory = 'bix';
        } else if (soundName.indexOf('gg') == 0) {
            subdirectory = 'gg';
        } else if (soundName.charCodeAt(0) >= 48 && soundName.charCodeAt(0) <= 57) {
            subdirectory = 'number';
        } else if (soundName.charAt(0) == '_') {
            subdirectory = 'number';
        }
        let soundURL = `https://media.merriam-webster.com/audio/prons/en/us/wav/${subdirectory}/${soundName}.wav`;
        UIctrl.insertAudio(soundURL);
    }
    let searchForWord = async () => {
        //1. Read the input field in UIctrl
        let word = UIctrl.getInputFromInputField();
        if (word != '') {
            //2. Display the loader
            UIctrl.emptyForLoader();
            UIctrl.insertLoader();

            //3. Call the API in brainCtrl
            let answer = await brainCtrl.callAPI(word);
            console.log(answer);

            // console.log(typeof answer); is object
            //4. Update the UI in UIctrl
            UIctrl.removeLoader();
            if (answer.length > 0) {
                if(answer[0].meta) {
                    //we got a valid word
                    //1. remove 'did-you-mean'
                    //2. insert 'output-container'
                    UIctrl.updateUIvalid(answer);
                    UIctrl.emptyInputBox();
                    let soundName = answer[0].hwi.prs[0].sound.audio;
                    if (soundName) {
                        renderSound(soundName);
                    } else {
                        //no sound possible
                    }
                } else {
                    //we got an invalid word
                    //1. remove 'output-container'
                    //2. insert 'did-you-mean'
                    UIctrl.updateUIinvalid(answer);
                    let dymBtn0 = document.querySelectorAll(UIctrl.DOMstrings.didYouMeanBtn)[0];
                    let dymBtn1 = document.querySelectorAll(UIctrl.DOMstrings.didYouMeanBtn)[1];
                    let dymBtn2 = document.querySelectorAll(UIctrl.DOMstrings.didYouMeanBtn)[2];
                    let dymBtn3 = document.querySelectorAll(UIctrl.DOMstrings.didYouMeanBtn)[3];
                    let dymBtn4 = document.querySelectorAll(UIctrl.DOMstrings.didYouMeanBtn)[4];
                    dymBtn0.addEventListener('click', function() {
                        UIctrl.postInputIntoInputField(dymBtn0.innerHTML);
                        searchForWord();
                    });
                    dymBtn1.addEventListener('click', function() {
                        UIctrl.postInputIntoInputField(dymBtn1.innerHTML);
                        searchForWord();
                    });
                    dymBtn2.addEventListener('click', function() {
                        UIctrl.postInputIntoInputField(dymBtn2.innerHTML);
                        searchForWord();
                    });
                    dymBtn3.addEventListener('click', function() {
                        UIctrl.postInputIntoInputField(dymBtn3.innerHTML);
                        searchForWord();
                    });
                    dymBtn4.addEventListener('click', function() {
                       UIctrl.postInputIntoInputField(dymBtn4.innerHTML);
                        searchForWord();
                    });
                }
            } else {
                //No results found
                UIctrl.emptyUI();
            }
        }
    }
    document.querySelector(UIctrl.DOMstrings.searchBtn).addEventListener('click', searchForWord)
    document.addEventListener('keypress', function(event) {
        if (event.keyCode == 13 || event.which == 13) {
            searchForWord();
        }
    })
    document.getElementsByClassName('sound-btn')[0].addEventListener('click', function() {
        let elem = document.querySelector(UIctrl.DOMstrings.audioID);
        elem.play();
    })
    
    
    // console.log(document.querySelectorAll(UIctrl.DOMstrings.didYouMeanBtn)[0].innerHTML);
})(brainController, UIcontroller);


