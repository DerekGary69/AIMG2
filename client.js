import * as chat from './chat.js';

function pageTransition(page) {
    console.log('pageTransition', page);
    let targetPage = document.getElementById(page);
    let pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    targetPage.classList.add('active');
}

window.addEventListener('DOMContentLoaded', () => {
    // Your code here

    let lastImg = '';

    const genBtn = document.getElementById('genBtn');
    
    genBtn.addEventListener('click', async () => {
        if(genBtn.inmnerHTML == 'View') {
            pageTransition('page4');
            return;
        }

        genBtn.innerHTML = 'View';
        
        let result = await genImg(null, null);
        // console.log(result.data[0].url);


        if(result.error) {
            document.getElementById('result').innerHTML = `<span class='staticText'>Error: ${result.error.message}</span>`;
            viewGenImg.disabled = false;
            return;
        }

        

        let img = document.createElement('img');
        img.src = result.data[0].url;
        lastImg = result.data[0].url;
        document.getElementById('result').innerHTML = '';
        document.getElementById('result').appendChild(img);
        viewGenImg.disabled = false;
    });

    const viewGenImg = document.getElementById('viewGenImg');
    viewGenImg.addEventListener('click', async () => {
        let viewImg = document.getElementById('viewImg');
        let viewResult = document.getElementById('viewResult');
        viewResult.style.display = 'none';
        let viewPrompt = document.getElementById('viewPrompt');
        viewPrompt.style.display = 'block';
        viewImg.src = lastImg;
    });

    async function genImg(prefix, userPrompt) {
        const key = document.getElementById('key').value;
        let viewGenImg = document.getElementById('viewGenImg');
        viewGenImg.disabled = true;
        document.getElementById('result').innerHTML = `<span class='staticText'>Loading...</span>`
        
        let promptVal = document.getElementById('prompt').value;
        let prompt = userPrompt ? userPrompt : promptVal;
        prefix ? prompt = `${prompt}. The user has also included these instructions: ${prefix}` : null;
        const image = {
            model: model,
            prompt: `${prompt}`,
        };

        let result = await chat.imageCompletion(image, key);
        return result;
    }

    const analyzeBtn = document.getElementById('analyzeImg');
    analyzeBtn.addEventListener('click', async () => {
        analyzeBtn.disabled = true;
        if(analyzeBtn.getAttribute('data-value') == 0) {
            let result = await analyzeImg();
            if(result.error) {
                alert(`Error: ${result.error.message}`);
                analyzeBtn.disabled = false;
                return;
            }
            viewResult.innerHTML = `${result.choices[0].message.content}`;
            analyzeBtn.disabled = false;
            let regenBtn = document.getElementById('regen');
            regenBtn.style.display = 'block';
            regenBtn.addEventListener('click', async () => {
                regenBtn.disabled = true;
                let result = await analyzeImg();
                viewResult.innerHTML = `${result.choices[0].message.content}`;
                regenBtn.disabled = false;
            });
            analyzeBtn.setAttribute('data-value', 1);
            analyzeBtn.innerHTML = 'Use';
            return;
        } else {
            pageTransition('page4');
            let regenBtn = document.getElementById('regen');
            regenBtn.style.display = 'none';
            analyzeBtn.setAttribute('data-value', 0);
            analyzeBtn.innerHTML = 'Go';

            let viewResult = document.getElementById('viewResult');
            let result = await genImg(viewPrompt.value, viewResult.innerHTML);
            analyzeBtn.disabled = false;

            if(result.error) {
                document.getElementById('result').innerHTML = `<span class='staticText'>Error: ${result.error.message}</span>`;
                alert(`Error: ${result.error.message}`);
                viewGenImg.disabled = false;
                return;
            }

            let img = document.createElement('img');
            img.src = result.data[0].url;
            lastImg = result.data[0].url;
            document.getElementById('result').innerHTML = '';
            document.getElementById('result').appendChild(img);
            viewGenImg.disabled = false;
        }
    });

    let model = 'dall-e-3'

    function modelButton() {
        let modelBtn = document.getElementById('model');
        model = model == 'dall-e-3' ? 'dall-e-2' : 'dall-e-3';
        modelBtn.innerHTML = model == 'dall-e-3' ? 'v3' : 'v2';
        setTimeout(() => {
            modelBtn.innerHTML = model == 'dall-e-3' ? '&#128170;' : '&#128169;';
        }, 1000);
    }

    let modelBtn = document.getElementById('model');
    modelBtn.addEventListener('click', modelButton);

    async function analyzeImg() {
        const key = document.getElementById('key').value;
        let imageUrl = document.getElementById('viewImg').src;
        let viewPrompt = document.getElementById('viewPrompt');
        let viewResult = document.getElementById('viewResult');
        let args = null;
        viewPrompt.value ? args = viewPrompt.value : args = null;
        let prev = viewResult.innerHTML ? viewResult.innerHTML : null;
        // viewPrompt.style.display = 'none';

        if(viewResult.innerHTML == `<span class='staticText'>Loading...</span>`) return;
        
        viewResult.innerHTML = `<span class='staticText'>Loading...</span>`
        viewResult.style.display = 'block';

        let result = await chat.imageViewUrl(imageUrl, args, key, prev);
        console.log(result);
        return result;
    }

    const uploadBtn = document.getElementById('upload');
    let latestBlob = null;
    uploadBtn.addEventListener('click', async () => {
        let viewResult = document.getElementById('viewResult');
        viewResult.innerHTML = '';
        let blobUrl = document.getElementById('preview').src;
        if(!blobUrl) { alert('No image selected');
        pageTransition('page3');
        return;
    }
        let blob = await fetch(blobUrl)
        .then(response => response.blob())
        .then(blob => {
            return new Promise((resolve, reject) => {
                let reader = new FileReader();
                reader.onloadend = function() {
                resolve(reader.result); // This is your base64 string
                }
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        });
        // console.log(blob);
        latestBlob = blob;
        let image = document.getElementById('viewImg');
        image.src = blob;
    });

});

