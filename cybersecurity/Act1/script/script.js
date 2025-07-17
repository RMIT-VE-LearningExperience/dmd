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
 * Utility: Reset phishing modal state
 ***********************************************/
function resetPhishingModal() {
  const modal = document.getElementById('phishing-checklist-modal');
  const form = modal ? modal.querySelector('#phishing-checklist-form') : null;
  if (!modal || !form) return false;

  modal.style.display = 'none';
  form.reset(); // reset all fields
  form.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.body.appendChild(modal); // re-append to force z-index stacking
  return true;
}
/***********************************************
 * 1. Utility Functions (Dragging, etc.)
 ***********************************************/
// At the top of your script, ensure the global flag is defined:
window.activeDrag = null;

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
  iconElement.addEventListener('mouseup', () => {
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
  const emailWindow = document.getElementById('email-window');
  const emailHeader = document.getElementById('email-header');
  makeDraggable(emailHeader, emailWindow);
  
  const defragWindow = document.getElementById('defrag-window');
  const defragHeader = document.getElementById('defrag-header');
  makeDraggable(defragHeader, defragWindow);
  
  const diskCleanupWindow = document.getElementById('disk-cleanup-window');
  const diskCleanupHeader = document.getElementById('disk-cleanup-header');
  makeDraggable(diskCleanupHeader, diskCleanupWindow);
  
  const binWindow = document.getElementById('bin-window');
  const binHeader = document.getElementById('bin-header');
  makeDraggable(binHeader, binWindow);
  
  const programsWindow = document.getElementById('programs-window');
  const programsHeader = document.getElementById('programs-header');
  makeDraggable(programsHeader, programsWindow);
  
  const emailIcon = document.getElementById('email-icon');
  makeDraggableIcon(emailIcon, handleEmailIconClick);
  
  const diskIcon = document.getElementById('disk-icon');
  makeDraggableIcon(diskIcon, openDiskCleanup);
  
   /**const binIcon = document.getElementById('bin-icon');
  makeDraggableIcon(binIcon, openBinWindow);
  
  const computerIcon = document.getElementById('computer-icon');
  makeDraggableIcon(computerIcon, openDefragWindow);
  **/
  
  /***********************************************
   * 4. Fullscreen Login Flow: Steps 1, 2 & 3 (Login Process)
   ***********************************************/
  // Helper function to hide all login modals
  function hideAllLoginModals() {
    document.getElementById('password-reset').style.display = 'none';
    document.getElementById('twofa-modal').style.display = 'none';
    document.getElementById('password-fields').style.display = 'none';
  }
  
  // Step 1: On page load, if the desktop is locked, show the Password Reset modal.
  window.onload = function() {
        if (firstTimeOpen) {
         hideAllLoginModals();
         document.getElementById('password-reset').style.display = 'flex';
        }
        // ↳ Enable Enter key to submit 2FA and password
        const twofaInput = document.getElementById('twofa-code');
        if (twofaInput) {
          twofaInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') validate2FA();
          });
        }
        const confirmPasswordInput = document.getElementById('confirm-password');
        if (confirmPasswordInput) {
          confirmPasswordInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') submitNewPassword();
          });
        }
      };
  
  // Step 2: Transition to Two-Factor Authentication modal.
  function goTo2FA() {
    hideAllLoginModals();
    document.getElementById('twofa-modal').style.display = 'flex';
  }
  
  // Step 2: Validate the 2FA code. If correct, show the Password Entry modal.
  function validate2FA() {
    const code = document.getElementById('twofa-code').value;
    if (code === "987134") {
      hideAllLoginModals();
      closeSmsModal(); // Hide the SMS modal when verification is successful
      document.getElementById('password-fields').style.display = 'flex';
    } else {
      showModalMessage("Incorrect code. Please try again.");
    }
  }
  
  // Step 3: Validate password entry. On success, unlock the desktop.
  function submitNewPassword() {
    const pw = document.getElementById('new-password').value;
    const cpw = document.getElementById('confirm-password').value;
    const reqBox = document.getElementById('password-reqs');
    const reqList = document.getElementById('req-list');
    reqList.innerHTML = '';
    reqBox.style.display = 'none';
  
    const issues = [];
    if (pw.length < 12) issues.push('At least 12 characters');
    if (!/[A-Z]/.test(pw)) issues.push('At least 1 uppercase letter');
    if (!/[a-z]/.test(pw)) issues.push('At least 1 lowercase letter');
    if (!/\d/.test(pw)) issues.push('At least 1 digit');
    if (!/[@$!%*?&#^]/.test(pw)) issues.push('At least 1 special character (@$!%*?&#^)');
    if (pw !== cpw) issues.push('Passwords must match');
  
    if (issues.length > 0) {
      reqBox.style.display = 'block';
      issues.forEach(txt => {
        const li = document.createElement('li');
        li.textContent = txt;
        reqList.appendChild(li);
      });
      return;
    }
  
    firstTimeOpen = false;
    hideAllLoginModals();
  }
  
  function openSmsModal() {
    document.getElementById('sms-modal').style.display = 'block';
  }
  
  function closeSmsModal() {
    const smsModal = document.getElementById('sms-modal');
    smsModal.style.display = 'none';
    // If minimized, reset the styles
    smsModal.classList.remove('minimized');
    smsModal.style.top = '';
    smsModal.style.left = '';
    smsModal.style.width = '420px';
    smsModal.style.bottom = '0%';
    smsModal.style.right = '1%';
  }
  
  function minimizeSmsModal() {
    const smsModal = document.getElementById('sms-modal');
    if (smsModal.classList.contains('minimized')) {
        // Restore to original state
        smsModal.classList.remove('minimized');
        smsModal.style.top = '';
        smsModal.style.left = '';
        smsModal.style.width = '320px';
        smsModal.style.bottom = '0%';
        smsModal.style.right = '1%';
    } else {
        // Minimize the modal to bottom-right corner
        smsModal.classList.add('minimized');
        smsModal.style.top = 'auto';
        smsModal.style.bottom = '10px';
        smsModal.style.left = 'auto';
        smsModal.style.right = '10px';
        smsModal.style.width = '120px';
    }
  }
  
  /***********************************************
   * 5. EMAIL WINDOW FUNCTIONS
   ***********************************************/
  let emailMeta = [
    { 
      fromName: "IT Support", 
      fromEmail: "it-support@topshelff.com.au", 
      to: "You <you@topshelf.com>", 
      time: "09:14 AM",
      date: "February 27, 2025",
      headerTitle: "IT Department Update"
    },
    { 
      fromName: "Sarah Johnson", 
      fromEmail: "sarah.johnson@topshelf.com.au", 
      to: "You <you@topshelf.com>", 
      time: "08:30 AM",
      date: "February 27, 2025"
    },
    { 
      fromName: "Accounts Department", 
      fromEmail: "accounts@invoicepro.net", 
      to: "You <you@topshelf.com>", 
      time: "10:22 AM",
      date: "February 27, 2025",
      headerTitle: "Supplier Invoice Processing"
    },
    { 
      fromName: "Operations Director", 
      fromEmail: "operations.director@topshelf.com.au", 
      to: "You <you@topshelf.com>", 
      time: "11:05 AM",
      date: "February 27, 2025"
    },
    { 
      fromName: "Human Resources", 
      fromEmail: "human.resources@topshelf.com.au", 
      to: "You <you@topshelf.com>", 
      time: "10:45 AM",
      date: "February 27, 2025"
    }
  ];
  
  let emailTitles = [
    "Urgent Security Update Required",
    "<strong>Reminder:</strong> Warehouse Operations Meeting Today",
    "<strong>URGENT:</strong> Supplier Invoice Requires Immediate Payment",
    "Warehouse Efficiency Update - Confidential",
    "2025 Benefits Update - Action Required"
  ];
  
  let emails = [
    `Dear Warehouse Team Member, <br><br>
 
Our IT security team has detected unusual activity on you're workstation. To prevent un-authorized access, you must verify you're credentials immediatley and update you're security subscription. 
<br><br>
Please click the following link too: 
<br>
<ul><li>Comfirm your identity with you're login detials </li>
<br>
<li>Update you're personal informations (home adress, date of birth, and tax file number) </li>
<br>
<li>Process the required $49.99 security lisence renewal fee 

<a href="#" onclick="handlePhishingClick(event)">VERIFY CREDENTIALS AND PROCESS PAYMENT</a></li></ul>
<br>
This verification and payment expires in 24 hour's. Failure to complete this process will result in acount lockout and inability to access the warehouse management system. We can only accept credit card payments through our secure portall. 
<br><br>
Thank you for you're cooperation, <br>
 IT Suport Team <br>
 TopShelff `,
    `Hi team,<br><br>
  
  Just a quick reminder that we have our weekly operations meeting today at 2:00 PM in the Conference Room. We'll be discussing the quarterly KPIs and the upcoming peak season preparation.
  <br>
  Please bring your department updates and any questions about the new cross-docking procedures.
  <br><br>
  Best regards,<br>
  Sarah Johnson<br>
  Warehouse Operations Manager<br>
  TopShelf`,
    `Dear Inventory Manager, <br><br>
 
 This is a final notice that supplier invoice #INV-29875 for $7,842.99 is overdue and requires immediate payment to avoid delivery stoppage. 
 <br>
 To view and pay your invoice, download the attached file: 
  <a href="#" onclick="handlePhishingClick(event)">[Invoice_29875.exe] </a>
 <br>
 Alternatively, you can access your invoice online at: <a href="#" onclick="handlePhishingClick(event)">http://invoicepro-secure.payment.cn/TopShelf/INV29875/</a> 
 <br>
 Please process this payment within 24 hours to ensure continued stock delivery. 
 <br><br>
 Regards, <br>
  Sarah Johnson <br>Accounts Department <br>TopShelf Supplies Ltd `,
    `Dear Valued Team Member,<br><br>
  
  I'm reaching out personally regarding some important changes coming to our warehouse management processes. Before the company-wide announcement, I wanted to share this information with our operations team.
  <br>
  Please review the attached document and keep this information confidential until our official announcement next week.
  <br>
  Do not hesitate to contact me directly if you have any questions or concerns.
  <br><br>
  Best regards,<br>
  James Wilson<br>
  Operations Director, TopShelf`,
    `Dear TopShelf Employee,<br><br>
  
  Our annual benefits enrolment period begins next week. Please review the attached benefits guide before the enrolment deadline of March 15, 2025.
  <br>
  What you need to do:<br>
  1. Review the 2025 Benefits Guide attached<br>
  2. Complete your selections using the HR portal<br>
  3. Submit your choices by the deadline<br>
  <br>
  If you have any questions, please contact the HR department.<br>
  <br>
  Regards,<br>
  Human Resources Team<br>
  TopShelf`
  ];
let reportedPhishingCount = 0;
let phishingReported = {};
  
  const emailListDiv = document.getElementById('email-list');
  const emailContent = document.getElementById('email-content');
  const emailDetailsDiv = document.getElementById('email-details');
  const emailBody = document.getElementById('email-body');
  const reportFeedback = document.getElementById('report-feedback');
  const resizer = document.getElementById('resizer');
  
  let resizingEmail = false, sw = 0, sh = 0, smx = 0, smy = 0;
  resizer.addEventListener('mousedown', (e) => {
    resizingEmail = true;
    sw = emailWindow.offsetWidth;
    sh = emailWindow.offsetHeight;
    smx = e.clientX;
    smy = e.clientY;
    e.preventDefault();
  });
  document.addEventListener('mousemove', (e) => {
    if (resizingEmail) {
      const dx = e.clientX - smx;
      const dy = e.clientY - smy;
      emailWindow.style.width = Math.max(200, sw + dx) + 'px';
      emailWindow.style.height = Math.max(200, sh + dy) + 'px';
    }
  });
  document.addEventListener('mouseup', () => { resizingEmail = false; });
  
  function openEmailApp() {
    renderEmailList();
    centerWindow(emailWindow, emailWindow.offsetWidth, emailWindow.offsetHeight);
    emailWindow.style.display = 'block';
  }
  function closeEmailApp() {
    emailWindow.style.display = 'none';
  }
  
  function renderEmailList() {
    emailListDiv.innerHTML = '';
    for (let i = 0; i < emailMeta.length; i++) {
      const cleanTitle = emailTitles[i].replace(/<strong>/g, '').replace(/<\/strong>/g, '');
      const item = document.createElement('div');
      item.classList.add('email-list-item');
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', cleanTitle);
      item.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openEmail(i);
        }
      });
      
      // Mark as unread/read
      if (!readEmails[i]) {
        item.classList.add('unread');
      } else {
        item.classList.add('read');
      }

      // Add "Reported" label if this email has been reported
      let reportedLabel = phishingReported[i] ? '<span style="color:red; font-weight: bold;">Reported</span> ' : '';
      // Build the combined "fromName and subject" string with a line break after the sender and without bold formatting in the title
      const subjectSpan = document.createElement('span');
      subjectSpan.innerHTML = reportedLabel + emailMeta[i].fromName + ":<br>" + cleanTitle;

      // Time
      const timeSpan = document.createElement('span');
      timeSpan.className = 'email-time';
      timeSpan.textContent = emailMeta[i].time;

      // Append to the list item
      item.appendChild(subjectSpan);
      item.appendChild(timeSpan);

      // Click opens that specific email
      item.onclick = () => openEmail(i);

      emailListDiv.appendChild(item);
    }
  }
  
function openEmail(index) {
  // Prevent opening multiple modals for the same email; bring existing modal to front if present
  const existingModal = document.querySelector(`.email-detail-modal:not(#phishing-checklist-modal)[data-email-index="${index}"]`);
  if (existingModal) {
    currentEmailIndex = index;
    existingModal.style.zIndex = 16000; // Bring to front
    return;
  }
  var meta = emailMeta[index];

  // Create a new modal element for the email detail.
  var modal = document.createElement('div');
  modal.className = 'modal email-detail-modal';
  modal.setAttribute('data-email-index', index);
  modal.style.display = 'block';
  // Set positioning and dimensions for the modal.
  modal.style.position = 'fixed';
  modal.style.top = '100px';
  modal.style.right = '100px';
  modal.style.width = '500px';
  modal.style.maxHeight = '80vh';
  modal.style.overflowY = 'auto';
  modal.style.zIndex = '15000';

  // Build the inner HTML of the modal (header + content)
  modal.innerHTML = `
  <div class="email-detail-header" id="email-detail-header">
    <span>${ meta.headerTitle ? meta.headerTitle : meta.fromName }</span>
   <span class="close-button" role="button" tabindex="0" aria-label="Close Email Detail" onkeydown="if(event.key==='Enter'||event.key===' ') this.click()"><img src="images/18359926.png" alt="Close Icon" style="width: 18px; height: 18px;"></span>
    </div>
  <div class="email-detail-body" id="email-detail-body">
    
    <div><strong>${meta.fromName}  &lt;${meta.fromEmail}&gt;</strong><br>${emailTitles[index]}</div>
    <div class="emailcontentmeta">${meta.date}, ${meta.time}</div>
   
    <div style="margin-top: 10px;" class="email-body-content">
       <div class="email-controls"  style="margin-top: 10px;">
        <button class="emailcontent md-button" onclick="replyEmail()">Reply</button>
        <button class="emailcontent md-button" onclick="reportEmail(${index})">Report Phishing</button>
    </div>
        ${emails[index]}
    </div>
    <div class="email-controls">
        <button class="emailcontent md-button" onclick="replyEmail()">Reply</button>
        <button class="emailcontent md-button" onclick="reportEmail(${index})">Report Phishing</button>
    </div>
    <div class="reply-field">
        <textarea class="md-input" placeholder="Write a reply..." onclick="handleReplyClick()"></textarea>
    </div>
  </div>
`;

  // Append the modal to the body so it appears over the desktop
  document.body.appendChild(modal);
  // Move the assignment of currentEmailIndex after modal is created and appended to DOM
  currentEmailIndex = index;
  modal.querySelector('.close-button').onclick = () => modal.remove();

  // Make the modal draggable using the existing dragElement() utility.
  dragElement(modal);

  // Mark this email as read (update the unread count accordingly).
  if (!readEmails[index]) {
    readEmails[index] = true;
    unreadEmails = Math.max(0, unreadEmails - 1);
    document.getElementById('unread-count').textContent = unreadEmails;
    if (unreadEmails === 0) {
      document.getElementById('unread-count').style.display = 'none';
    }
  }

  renderEmailList();
}
  
  function replyEmail() {
    if (currentEmailIndex === 0 || currentEmailIndex === 2) {
      showModalMessage("🚨 IT Security Simulation<br><br>This was a phishing test conducted by the IT Department to assess employee awareness.<br><br>Unfortunately, clicking 'Reply' indicates a failure to recognize the threat. Please review the cybersecurity training modules provided and remain vigilant.");
    } else {
      showModalMessage("Reply sent.");
    }
  }
  
function reportEmail(index = currentEmailIndex) {
  if (index === null) return;

  if (phishingReported[index]) {
    showModalMessage("You’ve already reported this email.");
    return;
  }

  // For emails 1, 2, and 3 (index 0, 1, 2), ensure phishing modal is available and reset between uses
  if ([0, 1, 2].includes(index)) {
    if (resetPhishingModal()) {
      setTimeout(() => showPhishingChecklistModal(index), 50); // slight delay to allow DOM to catch up
    } else {
      const waitForModal = setInterval(() => {
        if (resetPhishingModal()) {
          clearInterval(waitForModal);
          showPhishingChecklistModal(index);
        }
      }, 100);
    }
    return;
  }

  // Otherwise, normal reporting flow
  showReportFeedback("Email reported. Thank you.");
}

function showPhishingChecklistModal(index, retries = 5) {
  const modal = document.getElementById('phishing-checklist-modal');
  const form = modal ? modal.querySelector('#phishing-checklist-form') : null;

  if (!form) {
    if (retries > 0) {
      setTimeout(() => showPhishingChecklistModal(index, retries - 1), 100);
    } else {
      console.error("Phishing checklist form not found!");
    }
    return;
  }

  // Add email index as a data attribute for traceability
  modal.setAttribute('data-email-index', index);

  // Reset checkboxes on open
  form.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
  modal.style.display = 'block';
  // allow dragging within the desktop
  dragElementWithinBounds(modal);
}

function submitPhishingIndicators() {
  const checkboxes = document.querySelectorAll('#phishing-checklist-form input[type="checkbox"]:checked');
  const selected = Array.from(checkboxes).map(cb => cb.value);
  const modal = document.getElementById('phishing-checklist-modal');
  modal.style.display = 'none';

  // Use the data-email-index attribute to determine which email is being reported
  const idxAttr = modal.getAttribute('data-email-index');
  const index = idxAttr !== null ? parseInt(idxAttr, 10) : currentEmailIndex;

  let correct = [];
  if (index === 0) {
    correct = ['1', '2', '3'];
  } else if (index === 2) {
    correct = ['1', '2', '4'];
  }
  selected.sort();
  correct.sort();
  if (selected.length === correct.length && selected.every(val => correct.includes(val))) {
      // Only escalate if correct, and only for email 1 or 3
      if (!phishingReported[index]) {
        phishingReported[index] = true;
        reportedPhishingCount++;
      }
      renderEmailList();
      if (reportedPhishingCount === 2) {
        showSuccessModal && showSuccessModal();
      }
      showModalMessage("✅ Your email has been escalated to the IT Department.");
      showReportFeedback("Phishing email reported. Security team has been notified!");

      // Remove only individual email detail modals, not the shared phishing checklist
      document.querySelectorAll('.email-detail-modal:not(#phishing-checklist-modal)').forEach(modal => modal.remove());
    } else {
      showModalMessage("❌ Some indicators are missing or incorrect. Please review the email carefully.");
    }
}
  
  function showReportFeedback(message) {
    reportFeedback.textContent = message;
    reportFeedback.style.display = 'block';
    setTimeout(() => {
      reportFeedback.style.display = 'none';
    }, 3000);
  }
  
  function deleteEmail() {
    if (currentEmailIndex === null) return;
    emailMeta.splice(currentEmailIndex, 1);
    emailTitles.splice(currentEmailIndex, 1);
    emails.splice(currentEmailIndex, 1);
    readEmails.splice(currentEmailIndex, 1);
    emailContent.style.display = 'none';
    currentEmailIndex = null;
    renderEmailList();
  }
  
  /***********************************************
   * 6. DISK CLEANUP FUNCTIONS
   ***********************************************/
  function openDiskCleanup() {
    centerWindow(diskCleanupWindow, 420, 320);
    diskCleanupWindow.style.display = 'block';
    diskCleanupWindow.style.zIndex = 9999;
  }
  function closeDiskCleanup() {
    diskCleanupWindow.style.display = 'none';
  }
  
  const cleanupProgressContainer = document.getElementById('cleanup-progress-container');
  const cleanupProgressBar = document.getElementById('cleanup-progress-bar');
  const cleanupFeedback = document.getElementById('cleanup-feedback');
  
  function performCleanup() {
    const spaceDisplay = document.getElementById('space-display');
    spaceDisplay.style.display = 'none';
    cleanupProgressContainer.style.display = 'block';
    cleanupProgressBar.style.width = '0%';
    cleanupFeedback.style.display = 'none';
    
    let progress = 0;
    const totalTime = 3000, steps = 30;
    const stepTime = totalTime / steps;
    const inc = 100 / steps;
  
    const interval = setInterval(() => {
      progress += inc;
      cleanupProgressBar.style.width = progress + '%';
      if (progress >= 100) {
        clearInterval(interval);
        let ticked = 0;
        if (document.getElementById('temp-files').checked) ticked++;
        if (document.getElementById('recycle-bin').checked) ticked++;
        if (document.getElementById('thumbnails').checked) ticked++;
        if (document.getElementById('old-logs').checked) ticked++;
        const availableSpace = 120 - (6 * ticked);
        cleanupFeedback.textContent = "Space available: " + availableSpace + "GB";
        cleanupFeedback.style.display = 'block';
        setTimeout(() => {
          cleanupProgressContainer.style.display = 'none';
        }, 1000);
      }
    }, stepTime);
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
   * 8. BIN WINDOW FUNCTIONS
   ***********************************************/
  let binFiles = ["Old Report.docx", "Temp Backup.zip", "UnwantedPhoto.png"];
  let selectedBinIndex = null;
  
  function openBinWindow() {
    centerWindow(binWindow, 420, 320);
    renderBinFiles();
    binWindow.style.display = 'block';
  }
  function closeBinWindow() {
    binWindow.style.display = 'none';
  }
  function renderBinFiles() {
    const list = document.getElementById('bin-list');
    list.innerHTML = '';
    binFiles.forEach((filename, idx) => {
      const item = document.createElement('div');
      item.classList.add('bin-item');
      item.textContent = filename;
      item.onclick = () => {
        selectedBinIndex = idx;
        highlightBinItem(idx);
      };
      list.appendChild(item);
    });
  }
  function highlightBinItem(idx) {
    const items = document.getElementById('bin-list').querySelectorAll('.bin-item');
    items.forEach((el, i) => {
      el.style.background = (i === idx) ? "#E2DDFF" : "transparent";
    });
  }
  function emptyBin() {
    if (binFiles.length === 0) return;
  
    const progressContainer = document.getElementById('bin-progress-container');
    const progressBar = document.getElementById('bin-progress-bar');
    const feedback = document.getElementById('bin-feedback');
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    feedback.style.display = 'none';
  
    let progress = 0;
    const totalTime = 3000, steps = 30;
    const stepTime = totalTime / steps;
    const inc = 100 / steps;
  
    const interval = setInterval(() => {
      progress += inc;
      progressBar.style.width = `${progress}%`;
      if (progress >= 100) {
        progress = 100;
        progressBar.style.width = '100%';
        clearInterval(interval);
        binFiles = [];
        selectedBinIndex = null;
        renderBinFiles();
        feedback.style.display = 'block';
        progressContainer.style.display = 'none';
      }
    }, stepTime);
  }
  
  /***********************************************
   * 9. DEFRAGMENTATION FUNCTIONS
   ***********************************************/
  let selectedDrive = null;
  let driveFragmentation = {
    C: { before: 62, after: 0 },
    D: { before: 47, after: 0 }
  };
  
  function openDefragWindow() {
    centerWindow(defragWindow, 320, 320);
    defragWindow.style.display = 'block';
  }
  function closeDefragWindow() {
    defragWindow.style.display = 'none';
  }
  function selectDrive(drive) {
    selectedDrive = drive;
    document.querySelectorAll(".drive-item").forEach(item => {
      item.classList.remove("selected-drive");
    });
    const driveElement = document.getElementById("drive-" + drive);
    if (driveElement) {
      driveElement.classList.add("selected-drive");
    }
    document.getElementById('defrag-controls').style.display = 'block';
    document.getElementById("drive-letter").textContent = drive;
  }
  function defragmentDrive() {
    if (!selectedDrive) return;
    const progressContainer = document.getElementById('defrag-progress-container');
    const progressBar = document.getElementById('defrag-progress-bar');
    const feedback = document.getElementById('defrag-feedback');
    const defragButton = document.querySelector("#defrag-controls button");
  
    const originalFragmentation = driveFragmentation[selectedDrive].before;
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    defragButton.style.display = 'none';
    feedback.style.display = 'none';
  
    let progress = 0;
    const totalTime = 3000, steps = 30;
    const stepTime = totalTime / steps;
    const inc = 100 / steps;
  
    const interval = setInterval(() => {
      progress += inc;
      if (progress > 100) progress = 100;
      progressBar.style.width = progress + '%';
      if (progress >= 100) {
        clearInterval(interval);
        driveFragmentation[selectedDrive].before = 0;
        driveFragmentation[selectedDrive].after = 0;
        feedback.textContent = `Defragmentation complete for Drive ${selectedDrive}! Fragmentation improved from ${originalFragmentation}% to 0%.`;
        feedback.style.display = 'block';
        defragButton.style.display = 'inline-block';
      }
    }, stepTime);
  }
  
  /***********************************************
   * 10. EMAIL ICON CLICK HANDLER
   ***********************************************/
  function handleEmailIconClick() {
    startMenu.style.display = 'none';
    if (firstTimeOpen) {
      document.getElementById('password-reset').style.display = 'flex';
    } else {
      openEmailApp();
    }
  }
  
  /***********************************************
   * 11. Two-Column Start Menu: Right-Side Apps
   ***********************************************/
  const installedApps = [
    "Email",
    "Notepad",
    "Calculator",
    "Paint",
    "Snipping Tool",
    "Chrome",
    "Slack",
    "Spotify",
    "WordPad"
  ];
  
  function renderAllAppsList() {
    const appIcons = {
      "Email": "images/5968377.png",
      "Notepad": "images/2722996.png",
      "Calculator": "images/2099072.png",
      "Paint": "images/2748558.png",
      "Snipping Tool": "images/2944450.png",
      "Chrome": "images/888846.png",
      "Slack": "images/2111615.png",
      "Spotify": "images/2111624.png",
      "WordPad": "images/2991148.png"
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
      item.onclick = () => openApplicationWindow(appName);
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
      <li>&#10004; Password updated to meet complexity requirements</li>
      <li>&#10004; Multi-factor authentication applied</li>
      <li>&#10004; Two phishing emails identified and reported</li>
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
    doc.text('Assessment Task 1B', 20, 30);

    doc.text('Implement critical security measures', 20, 40);
    doc.setFontSize(16);
    doc.text(`This certifies that ${name}`, 20, 60);
    doc.text(`(${email})`, 20, 70);
    doc.text('has successfully performed the following tasks', 20, 80);
    doc.text('in accordance with organisational requirements:', 20, 90);
    doc.text('• Password updated to meet complexity requirements', 20, 110);
    doc.text('• Multi-factor authentication applied', 20, 120);
    doc.text('• Two phishing emails identified and reported.', 20, 130);
    doc.text(`Date: ${date}`, 20, 150);
    doc.save(`Certificate_${name.replace(/\\s+/g, '_')}.pdf`);
  });
  // Close handler
  successModal.querySelector('#close-success').onclick = () => successModal.remove();
}
// Toggle password visibility on hold
document.querySelectorAll('.password-toggle').forEach(toggle => {
  const targetId = toggle.getAttribute('data-target');
  const input = document.getElementById(targetId);
  toggle.addEventListener('mousedown', () => {
    input.type = 'text';
  });
  toggle.addEventListener('mouseup', () => {
    input.type = 'password';
  });
  toggle.addEventListener('mouseleave', () => {
    input.type = 'password';
  });
});