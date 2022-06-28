// In-page cache of the user's options
var id;

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let tablink = tabs[0].url; // or do whatever you need

    if (!tablink.includes("https://www.sahibinden.com/ilan/")) {
        document.getElementById("wrong-website-warning").hidden = false;
        document.getElementById("form-container").hidden = true;
    }
    else {
        let start = tablink.lastIndexOf("-");
        let end = tablink.lastIndexOf("/");
        id = tablink.substring(start + 1, end);
        refreshForm(id)
    }
});

const toPromise = (callback) => {
    const promise = new Promise((resolve, reject) => {
        try {
            callback(resolve, reject);
        }
        catch (err) {
            reject(err);
        }
    });
    return promise;
}

// Usage example: 
const save = async (key, value) => {
    return toPromise((resolve, reject) => {
        chrome.storage.sync.set({ [key]: value }, () => {
            if (chrome.runtime.lastError)
                reject(chrome.runtime.lastError);
            resolve(value);
        });
    });
}

const get = async (key) => {
    return toPromise((resolve, reject) => {
        chrome.storage.sync.get([key], (result) => {
            if (chrome.runtime.lastError)
                reject(chrome.runtime.lastError);
            resolve(result[key]);
        });
    });
}


const listNotes = async () => {
    return toPromise((resolve, reject) => {
        chrome.storage.sync.get(null, (results) => {
            if (chrome.runtime.lastError)
                reject(chrome.runtime.lastError);
            resolve(results);
        });
    });
}

const refreshForm = async (id) => {
    const note = await get(id);
    document.getElementById("form-header").innerHTML = "Ilan: " + note?.id ?? '';
    noteForm.price.value = note?.price ?? '';
    noteForm.note.value = note?.note ?? '';
}

const noteTemplate = ({ id, price, note }) => `
    <dl class="row border">
        <dt class="col-sm-3">Ilan No</dt>
        <dd class="col-sm-9">${id}</dd>
        <dt class="col-sm-3">Fiyat</dt>
        <dd class="col-sm-9">${price}</dd>
        <dt class="col-sm-3">Not</dt>
        <dd class="col-sm-9">${note}</dd>
    </dl>
`;

const refreshList = async () => {
    const notes = await listNotes();
    console.log(notes)
    document.getElementById("list").innerHTML = Object.values(notes).map(noteTemplate).join('');
}

// Immediately persist options changes
noteForm.note.addEventListener('change', async (event) => {
    console.log('Set Note:', event.target.value);
    const note = await get(id)
    const newNote = { ...note, note: event.target.value ,id: id }
    await save(id, newNote)
});

// Immediately persist options changes
noteForm.price.addEventListener('change', async (event) => {
    console.log('Set Price:', event.target.value);
    const note = await get(id)
    const newNote = { ...note, price: event.target.value, id: id }
    await save(id, newNote)
});

listTab.addEventListener('click', function() {
    refreshList();
});