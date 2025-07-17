
// Disk Cleanup Modal
function openDiskCleanupModal() {
  if (document.getElementById('disk-cleanup-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'disk-cleanup-modal';
  modal.className = 'modal md-card';
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.zIndex = '16000';
  modal.style.width = '400px';
  modal.style.padding = '20px';
  modal.innerHTML = `
    <div class="window-header" style="cursor:move;">
      <span>Disk Clean-up: Drive selection</span>
      <span class="close-button" onclick="document.getElementById('disk-cleanup-modal').remove()" role="button" tabindex="0" aria-label="Close"
            onkeydown="if(event.key==='Enter'||event.key===' ') this.click()">
        <img src="images/18359926.png" alt="Close Icon" style="width:18px;height:18px;">
      </span>
    </div>
    <div class="modal-content">
      <p>Select the drive you want to clean up:</p>
      <select id="cleanup-drive-select" class="md-input">
        <option value="">-- Select Drive --</option>
        <option value="C">Drive C:</option>
        <option value="G">OneDrive (G:)</option>
      </select>
      <p id="cleanup-error" style="color: red; display: none; margin-top: 8px;"></p>
      <p id="cleanup-complete-msg" style="color: green; display: none; margin-top: 8px;"></p>
      <button class="md-button" id="cleanup-ok">OK</button>
      <button class="md-button" onclick="document.getElementById('disk-cleanup-modal').remove()">Exit</button>
      <div id="disk-cleanup-progress-container" style="width:100%; background:#eee; height:10px; border-radius:6px; overflow:hidden; display:none; margin-top:12px;">
        <div id="disk-cleanup-progress-bar" style="width:0%; height:100%; background:#0078D4;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const header = modal.querySelector('.window-header');
  makeDraggable(header, modal);

  document.getElementById('cleanup-ok').onclick = function () {
    const drive = document.getElementById('cleanup-drive-select').value;
    const errorText = document.getElementById('cleanup-error');
    const completeText = document.getElementById('cleanup-complete-msg');
    const progressBar = document.getElementById('disk-cleanup-progress-bar');
    const container = document.getElementById('disk-cleanup-progress-container');
    errorText.style.display = 'none';
    completeText.style.display = 'none';
    container.style.display = 'none';

    if (!drive) {
      errorText.textContent = 'Please select a drive.';
      errorText.style.display = 'block';
      return;
    }

    if (drive === 'G') {
      errorText.textContent = "Cleanup is not supported for OneDrive. Please select a local drive.";
      errorText.style.display = 'block';
      return;
    }

    container.style.display = 'block';
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      progressBar.style.width = progress + '%';
      if (progress >= 100) {
        clearInterval(interval);
        completeText.textContent = "Disk clean-up complete for Drive C:";
        completeText.style.display = 'block';
        // Record cleanup completion and re-evaluate
        cleanupRunOnce = true;
        checkAllTasksComplete();
      }
    }, 100);
  };
}
/**
 * showModalMessage: displays a fullscreen-friendly modal instead of alert()
 */
function showModalMessage(msg) {
  const existing = document.getElementById('custom-message-modal');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'custom-message-modal';
  const box = document.createElement('div');
  box.className = 'custom-message-box';
  const p = document.createElement('p');
  p.innerHTML = msg;
  const btn = document.createElement('button');
  btn.textContent = 'OK';
  btn.className = 'md-button';
  btn.style.marginTop = '16px';
  btn.onclick = () => overlay.remove();
  box.appendChild(p);
  box.appendChild(btn);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

/***********************************************
 * 1. Utility Functions (Dragging, etc.)
 ***********************************************/
// At the top of your script, ensure the global flag is defined:
window.activeDrag = null;

// Track whether Disk Cleanup has completed at least once
let cleanupRunOnce = false;

function makeDraggable(dragHandle, draggableElement) {
  let dragging = false, offsetX = 0, offsetY = 0;
  let startX = 0, startY = 0;
  
  dragHandle.addEventListener('mousedown', (e) => {
    if (window.activeDrag) return; // Prevent starting drag if another element is active
    if (e.button !== 0) return;
    window.activeDrag = draggableElement;
    startX = e.clientX;
    startY = e.clientY;
    offsetX = e.clientX - draggableElement.offsetLeft;
    offsetY = e.clientY - draggableElement.offsetTop;
    dragging = false;
    e.preventDefault(); 
  });
  
  document.addEventListener('mousemove', (e) => {
    if (window.activeDrag !== draggableElement) return;
    if (e.buttons !== 1) return;
    
    if (!dragging) {
      if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
        dragging = true;
      } else {
        return;
      }
    }
    
    draggableElement.style.left = (e.clientX - offsetX) + 'px';
    draggableElement.style.top = (e.clientY - offsetY) + 'px';
  });
  
  document.addEventListener('mouseup', () => { 
    if (window.activeDrag === draggableElement) {
      window.activeDrag = null;
    }
    dragging = false;
  });
}

/**
 * Make an element draggable within the #desktop container
 */
function dragElementWithinBounds(elmnt) {
  const header = elmnt.querySelector('.email-detail-header');
  if (!header) return;
  header.style.cursor = 'move';
  header.addEventListener('mousedown', startDrag);
  function startDrag(e) {
    e.preventDefault();
    const desktop = document.getElementById('desktop').getBoundingClientRect();
    const origX = elmnt.offsetLeft, origY = elmnt.offsetTop;
    const startX = e.clientX, startY = e.clientY;
    function onMouseMove(e) {
      let newLeft = origX + (e.clientX - startX);
      let newTop  = origY + (e.clientY - startY);
      // clamp within desktop
      newLeft = Math.max(desktop.left, Math.min(newLeft, desktop.left + desktop.width - elmnt.offsetWidth));
      newTop  = Math.max(desktop.top,  Math.min(newTop,  desktop.top  + desktop.height - elmnt.offsetHeight));
      elmnt.style.left = newLeft + 'px';
      elmnt.style.top  = newTop  + 'px';
    }
    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}

function makeDraggableIcon(iconElement, clickHandler) {
  let dragging = false, offsetX = 0, offsetY = 0;
  iconElement.addEventListener('mousedown', (e) => {
    dragging = false;
    offsetX = e.clientX - iconElement.offsetLeft;
    offsetY = e.clientY - iconElement.offsetTop;
    e.preventDefault();
  });
  iconElement.addEventListener('mousemove', (e) => {
    if (e.buttons !== 1) return;
    dragging = true;
    iconElement.style.left = (e.clientX - offsetX) + 'px';
    iconElement.style.top = (e.clientY - offsetY) + 'px';
  });
  iconElement.addEventListener('click', (e) => {
    if (!dragging && clickHandler) clickHandler();
    dragging = false;
  });
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

function centerWindow(elem) {
    elem.style.left = '20px';
    elem.style.top = '20px';
    elem.style.right = 'auto';
}
  
  /***********************************************
   * 2. GLOBAL VARIABLES & CLOCK / START MENU SETUP
   ***********************************************/
  let firstTimeOpen = true;
  let unreadEmails = 5;
  let currentEmailIndex = null;
  let readEmails = Array(5).fill(false);
  
  const startMenu = document.getElementById('start-menu');
  const timeDisplay = document.getElementById('time-display');
  
  function updateClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    timeDisplay.textContent = hh + ":" + mm;
  }
  setInterval(updateClock, 1000);
  updateClock();
  
  function toggleStartMenu() {
    startMenu.style.display =
      (startMenu.style.display === 'none' || startMenu.style.display === '')
        ? 'flex'
        : 'none';
  }
  
  document.addEventListener('click', function(event) {
    const startButton = document.querySelector('.start-button');
    if (startMenu && startButton &&
        !startMenu.contains(event.target) &&
        !startButton.contains(event.target)) {
      startMenu.style.display = 'none';
    }
  });
  
  document.querySelectorAll('.start-menu-item, .app-list-item').forEach(item => {
    item.addEventListener('click', () => {
      startMenu.style.display = 'none';
    });
  });
  
  /***********************************************
   * 3. DRAGGABLE WINDOWS & ICONS
   ***********************************************/
  
  
  const programsWindow = document.getElementById('programs-window');
  const programsHeader = document.getElementById('programs-header');
  if (programsHeader && programsWindow) {
    makeDraggable(programsHeader, programsWindow);
  }
  

    
  
  // Custom App Icon
  const customIcon = document.getElementById('custom-icon');
  if (customIcon) {
    makeDraggableIcon(customIcon, openCustomModal);
  }
// Custom App modal open/close
function openCustomModal() {
  const modal = document.getElementById('custom-modal');
  centerWindow(modal);
  modal.style.display = 'block';
  dragElementWithinBounds(modal);
}
function closeCustomModal() {
  document.getElementById('custom-modal').style.display = 'none';
}

// SSD section: No longer need to append defrag/cleanup links; links are always present in the HTML

// OneDrive section: open folder modal on double-click
const onedriveSection = document.querySelector('.onedrive');
if (onedriveSection) {
  onedriveSection.addEventListener('dblclick', openFolderModal);
}
// Global variable to track if defrag has run once
let defraggedOnce = false;

function showDefragModal() {
  // Prevent creating multiple defrag modals
  if (document.getElementById('defrag-modal')) return;
  const modal = document.createElement('div');
  modal.className = 'modal md-card defrag-modal';
  modal.id = 'defrag-modal';
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.zIndex = '16000';
  modal.style.width = '400px';
  modal.style.padding = '20px';
  modal.innerHTML = `
    <div class="window-header" style="cursor:move;">
      <span>Disk Defragmenter: Drive selection</span>
      <span class="close-button" onclick="document.getElementById('defrag-modal').remove()" role="button" tabindex="0" aria-label="Close"
            onkeydown="if(event.key==='Enter'||event.key===' ') this.click()">
        <img src="images/18359926.png" alt="Close Icon" style="width:18px;height:18px;">
      </span>
    </div>
    <div class="modal-content">
      <p>Select the drive you want to defragment:</p>
      <select id="defrag-drive-select" class="md-input">
        <option value="">-- Select Drive --</option>
        <option value="C">Drive C:</option>
        <option value="G">Drive G: (OneDrive)</option>
      </select>
      <p id="defrag-error" style="color: red; display: none; margin-top: 8px;"></p>
      <p id="defrag-complete-msg" style="color: green; display: none; margin-top: 8px;"></p>
      <button class="md-button" id="defrag-ok">OK</button>
      <button class="md-button" id="defrag-exit">Exit</button>
      <div id="defrag-progress-container" style="width:100%; background:#eee; height:10px; border-radius:6px; overflow:hidden; display:none; margin-top:12px;">
        <div id="defrag-progress-bar" style="width:0%; height:100%; background:#0078D4;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const header = modal.querySelector('.window-header');
  makeDraggable(header, modal);

  document.getElementById('defrag-exit').onclick = () => modal.remove();

  document.getElementById('defrag-ok').onclick = function () {
    const drive = document.getElementById('defrag-drive-select').value;
    const errorText = document.getElementById('defrag-error');
    const completeText = document.getElementById('defrag-complete-msg');
    const progressBar = document.getElementById('defrag-progress-bar');
    const container = document.getElementById('defrag-progress-container');
    errorText.style.display = 'none';
    completeText.style.display = 'none';
    container.style.display = 'none';

    if (!drive) {
      errorText.textContent = 'Please select a drive.';
      errorText.style.display = 'block';
      return;
    }

    if (drive === 'G') {
      errorText.textContent = "Defragmentation is not supported for OneDrive. Please select a local drive.";
      errorText.style.display = 'block';
      return;
    }

    container.style.display = 'block';
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      progressBar.style.width = progress + '%';
      if (progress >= 100) {
        clearInterval(interval);
        const msg = defraggedOnce
          ? "Defragmentation complete for Drive C! Fragmentation improved from 0% to 0%."
          : "Defragmentation complete for Drive C! Fragmentation improved from 62% to 0%.";
        defraggedOnce = true;
        // Re-evaluate all tasks after defrag
        checkAllTasksComplete();
        completeText.textContent = msg;
        completeText.style.display = 'block';
        const defragStatusItem = Array.from(document.querySelectorAll('#custom-modal ul li'))
          .find(li => li.textContent.startsWith('Last defragmented:'));
        if (defragStatusItem) {
          defragStatusItem.textContent = 'Last defragmented: Today';
          defragStatusItem.style.color = 'green';
        }
      }
    }, 200);
  };
}

// Make My Computer modal draggable
const customModal = document.getElementById('custom-modal');
const customModalHeader = document.getElementById('customModalHeader');
if (customModalHeader && customModal) {
  makeDraggable(customModalHeader, customModal);
}

// Make Application Updates modal draggable
const updateManagerModal = document.getElementById('update-manager-modal');
const updateManagerHeader = document.getElementById('updateManagerHeader');
if (updateManagerHeader && updateManagerModal) {
  makeDraggable(updateManagerHeader, updateManagerModal);
}

// Excel file icon: draggable, rename on double-click, and HTML5 drag start
const excelFileIcon = document.getElementById('excel-file-icon');
const excelFileLabel = document.getElementById('excel-file-label');
if (excelFileIcon) {
  makeDraggableIcon(excelFileIcon, null);
  // Truncate display for long filenames and store the full name
  (function() {
    const fullName = excelFileLabel.textContent.replace(/\.xlsx$/i, '');
    const display = fullName.length > 10
      ? fullName.slice(0, 10) + '...'
      : fullName;
    excelFileLabel.textContent = display + '.xlsx';
    // Store the full filename (without extension)
    excelFileIcon.dataset.fullname = fullName;
  })();
  excelFileIcon.addEventListener('dblclick', () => {
    // Use data-fullname if available, otherwise fallback
    const current = excelFileIcon.dataset.fullname || excelFileLabel.textContent.replace(/\.xlsx$/, '');
    // Create inline rename input
    const input = document.createElement('input');
    input.type = 'text';
    input.value = current;
    Object.assign(input.style, {
      position: 'absolute',
      zIndex: 40000
      // width is dynamically set below
    });
    // Position input over the label
    const rect = excelFileLabel.getBoundingClientRect();
    input.style.left = rect.left + 'px';
    input.style.top = rect.top + 'px';
    document.body.appendChild(input);
    // Adjust input width to fit full name
    input.style.width = (current.length + 1) + 'ch';
    input.focus();
    function finishRename() {
      let name = input.value.trim();
      if (name) {
        // Update data-fullname to the new name
        excelFileIcon.dataset.fullname = name;
        const displayName = name.length > 10
          ? name.slice(0, 10) + '...'
          : name;
        excelFileLabel.textContent = displayName + '.xlsx';
        excelFileIcon.setAttribute('aria-label', name + '.xlsx');
      }
      document.body.removeChild(input);
    }
    input.addEventListener('blur', finishRename);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') finishRename();
    });
  });
  excelFileIcon.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', 'excel-file-icon');
    // Raise this icon above all others while dragging
    excelFileIcon.style.zIndex = '99999';
  });
  excelFileIcon.addEventListener('dragend', () => {
    // Restore original stacking after drop
    excelFileIcon.style.zIndex = '';
  });
}

// Make supplier-folder-icon draggable
const folderIcon = document.getElementById('supplier-folder-icon');
if (folderIcon) {
  makeDraggableIcon(folderIcon, openFolderModal);
}

if (folderIcon) {
  // Allow dropping the Excel file onto the folder icon
  folderIcon.addEventListener('dragover', e => {
    e.preventDefault();
  });
  folderIcon.addEventListener('drop', e => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id === 'excel-file-icon') {
      const fileIcon = document.getElementById(id);
      if (fileIcon) {
        // Remove from desktop
        fileIcon.remove();
        // Open the folder modal
        openFolderModal();
        // Place file inside the drop zone at default position
        const dropZone = document.getElementById('folder-drop-zone');
        fileIcon.style.position = 'absolute';
        fileIcon.style.left = '10px';
        fileIcon.style.top = '10px';
        dropZone.appendChild(fileIcon);
        // Keep it draggable within the folder
        makeDraggableIcon(fileIcon, null);
      }
    }
  });
}

// Folder modal open/close
function openFolderModal() {
  const m = document.getElementById('folder-modal');
  centerWindow(m);
  m.style.display = 'block';
  dragElementWithinBounds(m);
}
function closeFolderModal() {
  document.getElementById('folder-modal').style.display = 'none';
}

// Make folder modal draggable
const folderModal = document.getElementById('folder-modal');
const folderModalHeader = document.getElementById('folderModalHeader');
if (folderModalHeader && folderModal) {
  makeDraggable(folderModalHeader, folderModal);
}

// Folder drop zone: handle drag & drop
const dropZone = document.getElementById('folder-drop-zone');
if (dropZone) {
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '#f0f8ff';
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = '';
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '';
    const id = e.dataTransfer.getData('text/plain');
    if (id === 'excel-file-icon') {
      const fileIcon = document.getElementById(id);
      if (fileIcon) {
        dropZone.appendChild(fileIcon);
        // Position absolutely at drop point
        const dropRect = dropZone.getBoundingClientRect();
        fileIcon.style.position = 'absolute';
        fileIcon.style.left = (e.clientX - dropRect.left - 20) + 'px';
        fileIcon.style.top = (e.clientY - dropRect.top - 20) + 'px';
        // Allow dragging within the folder
        makeDraggableIcon(fileIcon, null);
      }
    }
  });
}

// Also allow drop anywhere on the folder modal
const folderModalElement = document.getElementById('folder-modal');
if (folderModalElement) {
  // Show a duplicate in the folder when dragging the Excel file near it
  folderModalElement.addEventListener('dragenter', e => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id === 'excel-file-icon') {
      const dropZone = document.getElementById('folder-drop-zone');
      if (!document.getElementById('excel-file-icon-clone')) {
        const original = document.getElementById(id);
        const clone = original.cloneNode(true);
        clone.id = 'excel-file-icon-clone';
        // Position clone at a default spot inside the folder
        clone.style.position = 'absolute';
        clone.style.left = '10px';
        clone.style.top = '10px';
        dropZone.appendChild(clone);
      }
    }
  });

  // Remove the clone if the drag leaves the folder modal
  folderModalElement.addEventListener('dragleave', e => {
    const clone = document.getElementById('excel-file-icon-clone');
    if (clone) clone.remove();
    dropZone.style.backgroundColor = '';
  });

  folderModalElement.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.style.backgroundColor = '#f0f8ff';
  });
  folderModalElement.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = '';
  });
  folderModalElement.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.style.backgroundColor = '';
    const id = e.dataTransfer.getData('text/plain');
    // Remove the clone if present
    const clone = document.getElementById('excel-file-icon-clone');
    if (clone) clone.remove();
    const fileIcon = document.getElementById(id);
    if (fileIcon && id === 'excel-file-icon') {
      dropZone.appendChild(fileIcon);
      // Position the file inside the folder at drop point
      const dropRect = dropZone.getBoundingClientRect();
      fileIcon.style.position = 'absolute';
      fileIcon.style.left = (e.clientX - dropRect.left - 20) + 'px';
      fileIcon.style.top = (e.clientY - dropRect.top - 20) + 'px';
      // Keep it draggable inside the folder
      makeDraggableIcon(fileIcon, null);
    }
  });
}



  
  /***********************************************
   * 7. PROGRAMS WINDOW FUNCTIONS
   ***********************************************/
  let allApplications = [
    { name: "Microsoft Office 365 (update KB5036892)", needsUpdate: true, needsUninstall: false },
    { name: "Chrome Browser (v.108 → v.122)", needsUpdate: true, needsUninstall: false },
    { name: "Firefox Browser (v.95 → v.124)", needsUpdate: true, needsUninstall: false },
    { name: "Java Runtime 8", needsUpdate: true, needsUninstall: false },
    { name: "Toll eParcel Manager (v.2.2 → v.2.4)", needsUpdate: true, needsUninstall: false },
    { name: "AusLogistics Connect (v.4.3)", needsUpdate: true, needsUninstall: false },
    { name: "Adobe Reader DC (v.20.0)", needsUpdate: false, needsUninstall: false },
    { name: "Legacy Stock Control System (v1.8)", needsUpdate: false, needsUninstall: true },
    { name: "WMS Tracker Pro", needsUpdate: false, needsUninstall: true },
    { name: "BarcodeScan Pro", needsUpdate: false, needsUninstall: true },
    { name: "CCleaner", needsUpdate: false, needsUninstall: true },
    { name: "QuickTime Player", needsUpdate: false, needsUninstall: true },
    { name: "Python 3.8", needsUpdate: false, needsUninstall: true }
  ];
  
  function renderAllApplications() {
    const list = document.getElementById('apps-list');
    list.innerHTML = '';
    
    allApplications.forEach((app, idx) => {
      const container = document.createElement('div');
      container.classList.add('program-item');
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.padding = '4px 0';
      container.style.gap = '8px';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `app-check-${idx}`;
      checkbox.dataset.index = idx;
      
      const label = document.createElement('label');
      label.setAttribute('for', `app-check-${idx}`);
      label.textContent = app.name;
      
      const statusSpan = document.createElement('span');
      statusSpan.style.fontSize = '0.85em';
      if (app.needsUpdate) {
        statusSpan.textContent = " [Needs Update]";
        statusSpan.style.color = "blue";
      }
      if (app.needsUninstall) {
        statusSpan.textContent += (app.needsUpdate ? " / Can Uninstall" : " [Can Uninstall]");
        statusSpan.style.color = "red";
      }
      
      container.appendChild(checkbox);
      container.appendChild(label);
      if (app.needsUpdate || app.needsUninstall) {
        container.appendChild(statusSpan);
      }
      list.appendChild(container);
    });
    updateProgramsCount();
  }
  
  function simulateProgressBar(onComplete) {
      const progressContainer = document.getElementById('apps-progress-container');
      const progressBar = document.getElementById('apps-progress-bar');
      progressContainer.style.display = 'block';
      progressBar.style.width = '0%';
      
      let progress = 0;
      const totalTime = 2000;
      const steps = 20;
      const stepTime = totalTime / steps;
      const inc = 100 / steps;
      
      const interval = setInterval(() => {
        progress += inc;
        progressBar.style.width = progress + '%';
        if (progress >= 100) {
          clearInterval(interval);
          progressContainer.style.display = 'none';
          if (onComplete) onComplete();
        }
      }, stepTime);
  }
  
  function updateSelected() {
    const checkboxes = document.querySelectorAll('#apps-list input[type="checkbox"]:checked');
    const appsToUpdate = [];
    checkboxes.forEach(cb => {
      const idx = parseInt(cb.dataset.index, 10);
      if (allApplications[idx].needsUpdate) {
        appsToUpdate.push(idx);
      }
    });
    
    if (appsToUpdate.length === 0) {
      showModalMessage("No updatable applications selected.");
      return;
    }
    
    simulateProgressBar("Updating selected apps...", () => {
      appsToUpdate.forEach(idx => {
        allApplications[idx].needsUpdate = false;
      });
      renderAllApplications();
      checkIfAllUpdated();
    });
  }
  
  function uninstallSelected() {
    const checkboxes = document.querySelectorAll('#apps-list input[type="checkbox"]:checked');
    const appsToUninstall = [];
    checkboxes.forEach(cb => {
      const idx = parseInt(cb.dataset.index, 10);
      if (allApplications[idx].needsUninstall) {
        appsToUninstall.push(idx);
      }
    });
    
    if (appsToUninstall.length === 0) {
      showModalMessage("No uninstallable applications selected.");
      return;
    }
    
    simulateProgressBar("Uninstalling selected apps...", () => {
      appsToUninstall.sort((a, b) => b - a).forEach(idx => {
        allApplications.splice(idx, 1);
      });
      renderAllApplications();
    });
  }
  
  function checkIfAllUpdated() {
    const stillNeedsUpdate = allApplications.some(app => app.needsUpdate);
    if (!stillNeedsUpdate) {
      document.getElementById('all-updated-feedback').style.display = 'block';
    }
  }
  
  function updateProgramsCount() {
    const count = allApplications.filter(app => app.needsUpdate).length;
    const countEl = document.getElementById("programs-update-count");
    if (countEl) {
      countEl.textContent = count;
      countEl.style.display = count > 0 ? "inline-block" : "none";
    }
  }
  
  function openProgramsWindow() {
    centerWindow(programsWindow, 500, 400);
    renderAllApplications();
    programsWindow.style.display = 'block';
  }
  
  function closeProgramsWindow() {
    programsWindow.style.display = 'none';
  }
  
  updateProgramsCount();
  
  /***********************************************
   * 11. Two-Column Start Menu: Right-Side Apps
   ***********************************************/
  let installedApps = [
    "Microsoft Office 365",
    "Adobe Reader DC",
    "Chrome Browser",
    "Firefox Browser",
    "WMS Tracker Pro",
    "BarcodeScan Pro",
    "CCleaner",
    "Java Runtime 8",
    "Python 3.8",
    "QuickTime Player",
    "AusLogistics Connect",
    "Toll eParcel Manager",
    "Legacy Stock Control System"
  ];
  
  function renderAllAppsList() {
    const appIcons = {
      "Microsoft Office 365": "images/888867.png",
      "Adobe Reader DC": "images/5968377.png",
    "Chrome Browser": "images/888846.png",
    "Firefox Browser": "images/5968827.png",
    "WMS Tracker Pro": "images/wms.png",
    "BarcodeScan Pro": "images/barcode.png",
    "CCleaner": "images/ccleaner.png",
    "Java Runtime 8": "images/226777.png",
    "Python 3.8": "images/3098090.png",
    "QuickTime Player": "images/732239.png",
    "AusLogistics Connect": "images/auslogics-connect.png",
    "Toll eParcel Manager": "images/toll.jpeg",
    "Legacy Stock Control System": "images/stock.png"
    };
    const defaultIcon = "images/5968377.png";
    
    const allAppsList = document.getElementById('all-apps-list');
    allAppsList.innerHTML = '';
    installedApps.forEach(appName => {
      const item = document.createElement('div');
      item.classList.add('app-list-item');
      
      // Create an image element for the app icon
      const img = document.createElement('img');
      img.src = appIcons[appName] || defaultIcon;
      img.alt = appName + ' icon';
      img.style.width = '40px';
      img.style.height = '40px';
      img.style.display = 'block';
      img.style.margin = '0 auto 5px';
      
      // Create a label for the app name
      const label = document.createElement('span');
      label.textContent = appName;
      
      item.appendChild(img);
      item.appendChild(label);
      // item.onclick = () => openApplicationWindow(appName);
      allAppsList.appendChild(item);
    });
  }
  renderAllAppsList();
  
  let windowOffset = 0;
  function openApplicationWindow(appName) {
    startMenu.style.display = 'none';
    const newWindow = document.createElement('div');
    newWindow.classList.add('md-card', 'generic-app-window');
  
    windowOffset += 20;
    if (windowOffset > 100) windowOffset = 0;
  
    newWindow.style.left = `${300 + windowOffset}px`;
    newWindow.style.top = `${150 + windowOffset}px`;
  
    const header = document.createElement('div');
    header.classList.add('window-header');
    header.innerHTML = `
      <span>${appName}</span>
      <span class="close-button" role="button" tabindex="0" aria-label="Close Window" onkeydown="if(event.key==='Enter'||event.key===' ') this.click()">X</span>
    `;
    newWindow.appendChild(header);
    makeDraggable(header, newWindow);
  
    const closeBtn = header.querySelector('.close-button');
    closeBtn.onclick = () => document.body.removeChild(newWindow);
  
    const content = document.createElement('div');
    content.style.padding = '10px';
    content.innerHTML = `<p>(This is a placeholder window for <b>${appName}</b>.)</p>`;
    newWindow.appendChild(content);
  
    document.body.appendChild(newWindow);
  }
  
  /***********************************************
   * 12. Unlock Desktop on Page Load via Fullscreen Login Flow
   ***********************************************/
  // (The login flow is handled via the modals above and the firstTimeOpen variable.)

  function handlePhishingClick(e) {
    e.preventDefault();
    showModalMessage("⚠️ Warning: This was a simulated phishing link.\n\nYour credentials and financial data could have been compromised. Please report this to IT immediately.");
  }
 
function handleReplyClick() {
  if (currentEmailIndex === 0 || currentEmailIndex === 2) {
    showModalMessage("⚠️ Warning: This was a simulated phishing link.\n\nYour credentials and financial data could have been compromised. Please report this to IT immediately.");
  }
}
function showSuccessModal() {
  // Close all existing modals
  document.querySelectorAll('.modal').forEach(function(m) {
    m.style.display = 'none';
  });
  var successModal = document.createElement('div');
  successModal.className = 'modal success-modal';
  successModal.style.display = 'block';
  successModal.style.position = 'fixed';
  successModal.style.top = '50%';
  successModal.style.left = '50%';
  successModal.style.transform = 'translate(-50%, -50%)';
  successModal.style.width = '400px';
  successModal.style.background = 'rgba(243, 243, 243, 0.7)';
  successModal.style.backdropFilter = 'blur(20px)';
  successModal.style.borderRadius = '8px';
  successModal.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.2)';
  successModal.style.zIndex = '16000';
  successModal.style.padding = '20px';
  successModal.innerHTML = `
  
  <img src="images/congratulations.gif" alt="Congratulations" style="width: 300px; height: 180px; display: block; margin: 0 auto;" />
  <h2>Success!</h2>
    <ul>
      <li>&#10004; Reclassify and save document to secure location</li>
      <li>&#10004; Ran Disk Clean-up & Disk Defragmentation</li>
      <li>&#10004; Uninstalled outdated or unauthorised programs</li>
  <li>&#10004; Updated essential applications</li>
    </ul>
    <div class="successform">
      <div class="successformfield" ><strong>Student name:</strong> <input type="text" style="margin-left: 10px; width: 60%; padding: 4px;"></div>
      <div class="successformfield" ><strong>Student email:</strong> <input type="email" style="margin-left: 10px; width: 60%; padding: 4px;"></div>
      <div class="successformfielddate" ><strong>Date:</strong> <input type="text" value="${new Date().toLocaleDateString()}" readonly style="margin-left: 10px; width: 60%; padding: 4px;"></div>
    </div>
       <button id="download-cert" class="emailcontent md-button">Download Certificate</button>
       <button id="close-success" class="emailcontent md-button">Close</button>
  `;
  document.body.appendChild(successModal);
  // SCORM completion
  if (window.API && window.API.LMSSetValue) {
    window.API.LMSSetValue('cmi.core.lesson_status', 'completed');
    window.API.LMSCommit('');
  }
  // xAPI completion
  if (typeof ADL !== 'undefined' && ADL.XAPIWrapper) {
    const stmt = {
      actor: { mbox: 'mailto:' + successModal.querySelector('input[type="email"]').value },
      verb: { id: 'http://adlnet.gov/expapi/verbs/completed', display: { 'en-US': 'completed' } },
      object: { id: window.location.href, definition: { name: { 'en-US': 'Cyber Security Skill Sets' } } }
    };
    ADL.XAPIWrapper.sendStatement(stmt);
  }
  // Certificate download
  successModal.querySelector('#download-cert').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const name = successModal.querySelector('input[type="text"]').value;
    const email = successModal.querySelector('input[type="email"]').value;
    const date = successModal.querySelector('input[readonly]').value;
    doc.setFontSize(22);
    doc.text('Assessment Task 2B', 20, 30);

    doc.text('Implement critical security measures', 20, 40);
    doc.setFontSize(16);
    doc.text(`This certifies that ${name}`, 20, 60);
    doc.text(`(${email})`, 20, 70);
    doc.text('has successfully performed the following tasks', 20, 80);
    doc.text('in accordance with organisational requirements:', 20, 90);
    doc.text('• Saved document to secure location', 20, 110);
    doc.text('• Ran Disk Clean-up & Disk Defragmentation', 20, 120);
    doc.text('• Uninstalled outdated or unauthorised programs', 20, 130);
    doc.text('• Updated essential applications.', 20, 140);
    doc.text(`Date: ${date}`, 20, 170);
    doc.save(`Certificate_${name.replace(/\\s+/g, '_')}.pdf`);
  });
  // Close handler
  successModal.querySelector('#close-success').onclick = () => successModal.remove();
}

// ▷ Data model
const appsData = [
  { name:"Chrome Browser (v.108)",       status:"Outdated" },
  { name:"Firefox Browser (v.95)",       status:"Outdated" },
  { name:"WMS Tracker Pro (v.2.5)",      status:"Not used since warehouse migrated to WMS Cloud" },
  { name:"BarcodeScan Pro (v.3.53)",     status:"Obsolete" },
  { name:"CCleaner (v.5.65)",            status:"Unauthorised" },
  { name:"Java Runtime 8 (Update 221)",  status:"Outdated" },
  { name:"Python 3.8",                   status:"Used for inventory report generation" },
  { name:"QuickTime Player (v.7.5)",     status:"Obsolete" },
  { name:"AusLogistics Connect (v.4.3)", status:"Outdated" },
  { name:"Toll eParcel Manager (v.2.4)", status:"Outdated" },
  { name:"Legacy Stock Control System",  status:"Superseded" },
];

// Show or hide the Apps link based on pending updates
function updateAppsLink() {
  const link = document.getElementById('apps-update-link');
  if (!link) return;
  const hasUpdates = appsData.some(app => app.status === 'Outdated');
  link.style.display = hasUpdates ? 'block' : 'none';
}
// initialize link visibility
updateAppsLink();

// ▷ 1. On load, notification is already sliding up via CSS. Wire its click…
document.getElementById('update-notification-modal')
  .addEventListener('click', () => {
    document.getElementById('update-notification-modal').style.display = 'none';
    openUpdateManager();
  });

// ▷ 2. Populate & show the manager
function openUpdateManager() {
  renderUpdateList();
  const mgr = document.getElementById('update-manager-modal');
  centerWindow(mgr);
  mgr.style.display = 'block';
  dragElementWithinBounds(mgr);  // make draggable
}

// ▷ 3. Close handler
function closeUpdateManager() {
  document.getElementById('update-manager-modal').style.display = 'none';
}

// ▷ 4. Render list with checkboxes
function renderUpdateList() {
  const ul = document.getElementById('apps-update-list');
  ul.innerHTML = '';
  appsData.forEach((app, i) => {
    const li = document.createElement('li');
    li.dataset.index = i;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `app-${i}`;
    const label = document.createElement('label');
    label.setAttribute('for', `app-${i}`);
    label.textContent = app.name;
    // Determine status badge and class
    let statusText = '';
    let statusClass = '';
    if (app.status === 'Outdated') {
      statusText = 'Update available';
      statusClass = 'update';
    } else if (['Used for inventory report generation', 'Current', 'Latest'].includes(app.status)) {
      statusText = 'Latest';
      statusClass = 'latest';
    } else {
      statusText = 'Action Required';
      statusClass = 'action';
    }
    li.appendChild(checkbox);
    li.appendChild(label);
    // Only append a badge if text exists
    if (statusText) {
      const statusSpan = document.createElement('span');
      statusSpan.className = `status ${statusClass}`;
      statusSpan.textContent = statusText;
      li.appendChild(statusSpan);
    }
    ul.appendChild(li);
  });
}

// ▷ 5. Update action: mark “Outdated” as updated (set to Latest)
function applyUpdates() {
  const container = document.getElementById('apps-update-progress-container');
  const bar = document.getElementById('apps-update-progress-bar');
  container.style.display = 'block';
  bar.style.width = '0%';
  bar.style.transition = 'width 1s linear';
  // Kick off the transition
  setTimeout(() => { bar.style.width = '100%'; }, 0);
  setTimeout(() => {
    // Convert selected Outdated apps to Latest
    for (let i = 0; i < appsData.length; i++) {
      const chk = document.getElementById(`app-${i}`);
      if (chk && chk.checked && appsData[i].status === 'Outdated') {
        appsData[i].status = 'Latest';
      }
    }
    renderUpdateList();
    updateAppsLink();
    checkAllTasksComplete();
    container.style.display = 'none';
    const msgDiv = document.getElementById('apps-update-message');
    msgDiv.textContent = 'Apps have been updated with the latest version';
    msgDiv.style.display = 'block';
  }, 1000);
}

// ▷ 6. Remove obsolete/unauthorised/superseded
function removeObsolete() {
  const container = document.getElementById('apps-update-progress-container');
  const bar = document.getElementById('apps-update-progress-bar');
  container.style.display = 'block';
  bar.style.width = '0%';
  bar.style.transition = 'width 1s linear';
  // Kick off the transition
  setTimeout(() => { bar.style.width = '100%'; }, 0);
  setTimeout(() => {
    for (let i = appsData.length - 1; i >= 0; i--) {
      const chk = document.getElementById(`app-${i}`);
      if (chk && chk.checked) {
        const st = appsData[i].status.toLowerCase();
        if (['obsolete','superseded','unauthorised','not used since warehouse migrated to wms cloud']
            .some(keyword => st.includes(keyword.toLowerCase()))) {
          const removedName = appsData[i].name;
          appsData.splice(i, 1);
          installedApps = installedApps.filter(name => !removedName.startsWith(name));
        }
      }
    }
    renderUpdateList();
    renderAllAppsList();
    checkAllTasksComplete();
    container.style.display = 'none';
    const msgDiv = document.getElementById('apps-update-message');
    msgDiv.textContent = 'Apps have been successfully uninstalled';
    msgDiv.style.display = 'block';
  }, 1000);
}
function checkAllTasksComplete() {
  const targetName = 'CONFIDENTIAL_Supplier_Quotes_Complete.xlsx';
  // Check if the file has been renamed either on desktop or in the folder
  const isRenamed = Boolean(document.querySelector(`[data-fullname="${targetName}"]`));
  const fileMoved = !!document.getElementById('folder-content').querySelector('.icon-text');
  // Required uninstalls
  const uninstallApps = [
    'WMS Tracker Pro',
    'BarcodeScan Pro',
    'CCleaner',
    'QuickTime Player',
    'Legacy Stock Control System'
  ];
  const uninstallComplete = uninstallApps.every(name =>
    !appsData.some(app => app.name.startsWith(name))
  );
  // Required updates
  const updateApps = [
    'Chrome Browser',
    'Firefox Browser',
    'Java Runtime 8',
    'Toll eParcel Manager',
    'AusLogistics Connect'
  ];
  const updateComplete = updateApps.every(name =>
    appsData.some(app => app.name.startsWith(name) && app.status === 'Latest')
  );
  if (
    isRenamed &&
    fileMoved &&
    cleanupRunOnce &&
    defraggedOnce &&
    uninstallComplete &&
    updateComplete
  ) {
    showSuccessModal();
  }
}

