// In-page cache of the user's options
var tablink;

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    tablink = tabs[0].url; // or do whatever you need
    refreshForm(tablink)
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
    const noteKey = tablink+'-note'
    saveData(noteKey, event.target.value)
});

// Immediately persist options changes
noteForm.price.addEventListener('change', async (event) => {
    console.log('Set Price:', event.target.value);
    const priceKey = tablink+'-price'
    await saveData(priceKey, event.target.value)
});