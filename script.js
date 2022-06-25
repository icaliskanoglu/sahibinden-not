// In-page cache of the user's options
var prefix;

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let tablink = tabs[0].url; // or do whatever you need

    if(!tablink.includes("https://www.sahibinden.com/ilan/")){
        document.getElementById("wrong-website-warning").hidden = false;
        document.getElementById("form-container").hidden = true;
    }
    else{
        let start = tablink.lastIndexOf("-");
        let end = tablink.lastIndexOf("/");
        prefix = tablink.substring(start+1, end);
        refreshForm(prefix)
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
const saveData = async (key, value) => {
    return toPromise((resolve, reject) => {
        chrome.storage.local.set({ [key]: value }, () => {
            if (chrome.runtime.lastError)
                reject(chrome.runtime.lastError);
            resolve(value);
        });
    });
}

const getData = async (key) => {
    return toPromise((resolve, reject) => {
        chrome.storage.local.get([key], (result) => {
            if (chrome.runtime.lastError)
                reject(chrome.runtime.lastError);
            resolve(result);
        });
    });
}

const refreshForm = async (base) => {
    const priceKey = base+'-price'
    const priceReslt = await getData(priceKey);
    noteForm.price.value = priceReslt[priceKey] ?? '';

    const noteKey = base+'-note'
    const noteResult = await getData(noteKey);
    noteForm.note.value = noteResult[noteKey] ?? '';
}

// Immediately persist options changes
noteForm.note.addEventListener('change', async (event) => {
    console.log('Set Note:', event.target.value);
    const noteKey = prefix+'-note'
    saveData(noteKey, event.target.value)
});

// Immediately persist options changes
noteForm.price.addEventListener('change', async (event) => {
    console.log('Set Price:', event.target.value);
    const priceKey = prefix+'-price'
    await saveData(priceKey, event.target.value)
});