document.addEventListener('DOMContentLoaded', () => {
    populateRandomGif();
    initializeGrid();
});

const drawPrompt = () => {
    const storyPrompts = [
        'What are you going to do with the one life you have?',
        'Do human rights exist?',
        'What did Nietzsche mean by monsters and the abyss?',
        'How much does language affect our thinking?',
        'Why do humans have such a strong urge to distract ourselves from the real world?',
        'Are there limits to human creativity?',
        'Without religion would people become more, less, or be equally morally corrupt?',
        'Is privacy a right?',
        'What would a utopia be like, how would it function and continue to exist?',
        'Is some degree of censorship necessary?'
    ];
    const promptElement = document.getElementById("storyPrompt");
    let currentIndex = 0;
    const changePrompt = () => {
        promptElement.innerHTML = storyPrompts[currentIndex];
        currentIndex = (currentIndex + 1) % storyPrompts.length;
    };

    const intervalId = setInterval(changePrompt, 50);

    const stopAfter = Math.floor(Math.random() * 1000) + 500;
    setTimeout(() => {
        clearInterval(intervalId);
        promptElement.innerHTML = storyPrompts[Math.floor(Math.random() * storyPrompts.length)];
    }, stopAfter);
};

const allowDrop = (ev) => {
    if (ev.target.className.includes('fluxus-act') || ev.target.className.includes('grid-item')) {
        ev.preventDefault();
    }
};

const drag = (ev) => {
    ev.dataTransfer.setData('image', ev.target.id);
};

const drop = (ev) => {
    ev.preventDefault();
    const dragData = ev.dataTransfer.getData('image');
    const draggableElement = document.getElementById(dragData);
    let dropzone = ev.target;

    if (dropzone.className.includes('fluxus-act')) {
        if (dropzone.children.length > 0) {
            dropzone.removeChild(dropzone.firstChild);
        }
    } else if (dropzone.className.includes('grid-item')) {
        dropzone = dropzone.closest('.grid-item');
    } else {
        return;
    }

    if (dropzone.className.includes('fluxus-act')) {
        draggableElement.style.margin = 'auto';
        draggableElement.style.display = 'block';
    } else {
        draggableElement.removeAttribute('style');
    }

    dropzone.appendChild(draggableElement);
};

const loadRandomGif = (elementId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch('https://api.giphy.com/v1/gifs/random?api_key=xpKCFBOXswhJnnLU15aqtLXe3yadR8bf&tag=surrealism');
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const gifData = await response.json();
            let img = document.createElement('img');
            img.src = gifData.data.images.fixed_height_small.url;
            img.id = elementId;
            img.draggable = true;
            img.ondragstart = drag;
            img.width = 100;
            img.height = 100;
            img.onload = () => resolve(img);
            img.onerror = () => reject('Error loading image');
        } catch (error) {
            reject(error);
        }
    });
};

const clearPreviousGifs = () => {
    document.querySelectorAll("#selectionGrid div").forEach(el => el.innerHTML = "");
};

const populateRandomGif = async () => {
    clearPreviousGifs();

    const gifPromises = [];
    for (let i = 1; i <= 50; i++) {
        gifPromises.push(loadRandomGif(`drag${i}`));
    }

    try {
        const loadedGifs = await Promise.all(gifPromises);
        loadedGifs.forEach((img, index) => {
            document.getElementById(`gif${index + 1}`).appendChild(img);
        });

        console.log('All GIFs loaded');
    } catch (error) {
        console.error('Error loading all GIFs:', error);
    }
};

let clicks = 0;

function onSubmit() {
    const selectedGifs = [];
    document.querySelectorAll('.fluxus-act img').forEach(img => {
        selectedGifs.push(img.src);
    });

    if (clicks < 2) {
        document.querySelectorAll('.fluxus-act').forEach(act => act.innerHTML = '');
        populateRandomGif();
        clicks++;
    } else if (clicks === 2) {
        saveStory(selectedGifs);
        window.location.href = 'viewing-experience.html';
    }
}

function saveStory(selectedGifs) {
    let stories = JSON.parse(localStorage.getItem('stories')) || [];
    stories.push(selectedGifs);
    localStorage.setItem('stories', JSON.stringify(stories));
}

function createGridItem(index) {
    const gridItem = document.createElement('div');
    gridItem.id = 'gif' + index;
    gridItem.className = 'grid-item';
    gridItem.setAttribute('ondrop', 'drop(event)');
    gridItem.setAttribute('ondragover', 'allowDrop(event)');
    return gridItem;
}

function initializeGrid() {
    const selectionGrid = document.getElementById('selectionGrid');
    for (let i = 1; i <= 25; i++) {
        selectionGrid.appendChild(createGridItem(i));
    }
}