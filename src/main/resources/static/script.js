let selectedFiles = []; // Keep track of all files across uploads

document.getElementById("pdf-files").addEventListener("change", function (event) {
    const newFiles = Array.from(event.target.files);

    // Limits
    const individualLimit = 15 * 1024 * 1024; // 15MB
    const totalLimit = 40 * 1024 * 1024; // 40MB

    // Check individual size
    if (newFiles.some(file => file.size > individualLimit)) {
        alert(`One or more files exceed the individual size limit of 15MB.`);
        event.target.value = null;
        return;
    }

    // Calculate new total size
    const combinedFiles = selectedFiles.concat(newFiles);
    const totalSize = combinedFiles.reduce((acc, file) => acc + file.size, 0);

    if (totalSize > totalLimit) {
        alert(`The total size of the files exceeds the limit of 40MB.`);
        event.target.value = null;
        return;
    }

    // Append new files
    selectedFiles = combinedFiles;

    // Reset input so user can upload same file again if needed
    event.target.value = null;

    updateFileList();
});


function triggerFileInput() {
 document.getElementById("pdf-files").click();
}

function removeFile(button) {
    const index = parseInt(button.parentNode.dataset.index);
    selectedFiles.splice(index, 1);
    updateFileList();
}


function moveFileUp(button) {
    const index = parseInt(button.parentNode.dataset.index);
    if (index > 0) {
        [selectedFiles[index], selectedFiles[index - 1]] = [selectedFiles[index - 1], selectedFiles[index]];
        updateFileList();
    }
}

function moveFileDown(button) {
    const index = parseInt(button.parentNode.dataset.index);
    if (index < selectedFiles.length - 1) {
        [selectedFiles[index], selectedFiles[index + 1]] = [selectedFiles[index + 1], selectedFiles[index]];
        updateFileList();
    }
}


function updateFileList() {
    const fileList = document.getElementById("file-list");
    fileList.innerHTML = "";

    selectedFiles.forEach((file, i) => {
        const fileItem = document.createElement("div");
        fileItem.className = "file-item";
        fileItem.dataset.index = i;
        fileItem.innerHTML = `
            ${file.name}
            <button class="delete-button" onclick="removeFile(this)">Delete</button>
            <span class="move-up" onclick="moveFileUp(this)">↑</span>
            <span class="move-down" onclick="moveFileDown(this)">↓</span>
        `;
        fileList.appendChild(fileItem);
    });

    // Update the actual input
    const input = document.getElementById("pdf-files");
    const dataTransfer = new DataTransfer();
    selectedFiles.forEach(file => dataTransfer.items.add(file));
    input.files = dataTransfer.files;
}

async function mergePDFs() {
    const input = document.getElementById("pdf-files");
    const files = input.files;
    const loader = document.getElementById("loader");

    if (files.length < 2) {
        alert("Please select at least two PDF files.");
        return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }
    const fileOrder = Array.from(files).map((file, index) => index);
    formData.append("fileOrder", JSON.stringify(fileOrder));

    const progressBar = document.getElementById("progress");
    const mergeButton = document.querySelector(".action-buttons button");
    const responseMessage = document.getElementById("response-message");

    // Show and animate progress bar
    progressBar.style.width = "0%";
    progressBar.style.transition = "none";
    progressBar.style.width = "30%"; // Initial fill
    progressBar.style.transition = "width 1s ease-in-out";

    // Disable the merge button
    mergeButton.disabled = true;
    mergeButton.innerText = "Merging...";

    try {
        // Simulate ongoing progress
        let fakeProgress = 30;
        const progressInterval = setInterval(() => {
            if (fakeProgress < 90) {
                fakeProgress += Math.random() * 5;
                progressBar.style.width = fakeProgress + "%";
            }
        }, 500);

        loader.style.display = "block"; // Before fetch
        const response = await fetch("/merge", {
            method: "POST",
            body: formData
        });

        clearInterval(progressInterval);
        progressBar.style.width = "100%";

        if (!response.ok) throw new Error("Merge failed");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "merged.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        responseMessage.textContent = "Merge completed successfully!";
        responseMessage.style.color = "green";
    } catch (err) {
        progressBar.style.width = "0%";
        responseMessage.textContent = "Something went wrong: " + err.message;
        responseMessage.style.color = "red";
    } finally {
        // Reset UI
        loader.style.display = "none"; // In finally block
        mergeButton.disabled = false;
        mergeButton.innerText = "Merge PDFs";
        setTimeout(() => {
            progressBar.style.width = "0%";
        }, 2000);
    }
}
