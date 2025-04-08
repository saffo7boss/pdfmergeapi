document.getElementById("pdf-files").addEventListener("change", function (event) {
 const files = event.target.files;
 const fileList = document.getElementById("file-list");
 const totalSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);

  // Define the limits in bytes
  const individualLimit = 15 * 1024 * 1024; // 15MB
  const totalLimit = 40 * 1024 * 1024; // 40MB

  // Check if any file exceeds the individual limit
  if (Array.from(files).some(file => file.size > individualLimit)) {
  alert(`One or more files exceed the individual size limit of 15MB.`);
  // Clear the files input to prevent uploading
  event.target.value = null;
  return;
  }

  // Check if the total size exceeds the total limit
  if (totalSize > totalLimit) {
  alert(`The total size of the files exceeds the limit of 40MB.`);
  // Clear the files input to prevent uploading
  event.target.value = null;
  return;
  }

 fileList.innerHTML = ""; // Clear previous file list

 for (let i =0; i < files.length; i++) {
 const fileItem = document.createElement("div");
 fileItem.className = "file-item";
 fileItem.dataset.index = i; // Store the index as a data attribute
 fileItem.innerHTML = `
 ${files[i].name}
 <button class="delete-button" onclick="removeFile(this)">Delete</button>
 <span class="move-up" onclick="moveFileUp(this)">↑</span>
 <span class="move-down" onclick="moveFileDown(this)">↓</span>
 `;
 fileList.appendChild(fileItem);
 }
});

function triggerFileInput() {
 document.getElementById("pdf-files").click();
}

function removeFile(button) {
 const fileItem = button.parentNode;
 const index = parseInt(fileItem.dataset.index); // Get the index from the data attribute
 const input = document.getElementById("pdf-files");
 const files = Array.from(input.files);
 files.splice(index,1);
 const dataTransfer = new DataTransfer();
 files.forEach(file => dataTransfer.items.add(file));
 input.files = dataTransfer.files;

 // Update the file list
 const fileList = document.getElementById("file-list");
 fileList.innerHTML = "";
 for (let i =0; i < files.length; i++) {
 const fileItem = document.createElement("div");
 fileItem.className = "file-item";
 fileItem.dataset.index = i; // Update the index
 fileItem.innerHTML = `
 ${files[i].name}
 <button class="delete-button" onclick="removeFile(this)">Delete</button>
 <span class="move-up" onclick="moveFileUp(this)">↑</span>
 <span class="move-down" onclick="moveFileDown(this)">↓</span>
 `;
 fileList.appendChild(fileItem);
 }
}

function moveFileUp(button) {
 const fileItem = button.parentNode;
 const index = parseInt(fileItem.dataset.index);
 if (index > 0) {
 const input = document.getElementById("pdf-files");
 const files = Array.from(input.files);
 [files[index], files[index-1]] = [files[index-1], files[index]];
 const dataTransfer = new DataTransfer();
 files.forEach(file => dataTransfer.items.add(file));
 input.files = dataTransfer.files;

 // Update the file list
 const fileList = document.getElementById("file-list");
 fileList.innerHTML = "";
 for (let i =0; i < files.length; i++) {
 const fileItem = document.createElement("div");
 fileItem.className = "file-item";
 fileItem.dataset.index = i; // Update the index
 fileItem.innerHTML = `
 ${files[i].name}
 <button class="delete-button" onclick="removeFile(this)">Delete</button>
 <span class="move-up" onclick="moveFileUp(this)">↑</span>
 <span class="move-down" onclick="moveFileDown(this)">↓</span>
 `;
 fileList.appendChild(fileItem);
 }
 }
}

function moveFileDown(button) {
 const fileItem = button.parentNode;
 const index = parseInt(fileItem.dataset.index);
 const input = document.getElementById("pdf-files");
 const files = Array.from(input.files);
 if (index < files.length - 1) {
 [files[index], files[index+1]] = [files[index+1], files[index]];
 const dataTransfer = new DataTransfer();
 files.forEach(file => dataTransfer.items.add(file));
 input.files = dataTransfer.files;

 // Update the file list
 const fileList = document.getElementById("file-list");
 fileList.innerHTML = "";
 for (let i =0; i < files.length; i++) {
 const fileItem = document.createElement("div");
 fileItem.className = "file-item";
 fileItem.dataset.index = i; // Update the index
 fileItem.innerHTML = `
 ${files[i].name}
 <button class="delete-button" onclick="removeFile(this)">Delete</button>
 <span class="move-up" onclick="moveFileUp(this)">↑</span>
 <span class="move-down" onclick="moveFileDown(this)">↓</span>
 `;
 fileList.appendChild(fileItem);
 }
 }
}
async function mergePDFs() {
 const input = document.getElementById("pdf-files");
 const files = input.files;

 if (files.length <2) {
 alert("Please select at least two PDF files.");
 return;
 }

 const formData = new FormData();
 for (let i =0; i < files.length; i++) {
 formData.append("files", files[i]);
 }
 const fileOrder = Array.from(files).map((file, index) => index);
 formData.append("fileOrder", JSON.stringify(fileOrder));

 try {
 const response = await fetch("/merge", {
 method: "POST",
 body: formData
 });

 if (!response.ok) throw new Error("Merge failed");

 const blob = await response.blob();
 const url = window.URL.createObjectURL(blob);
 const link = document.createElement("a");
 link.href = url;
 link.download = "merged.pdf";
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 } catch (err) {
 alert("Something went wrong: " + err.message);
 }
}