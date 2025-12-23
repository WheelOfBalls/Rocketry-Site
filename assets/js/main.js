
for (const a of document.querySelectorAll('a[href^="#"]')){
  a.addEventListener('click', e => {
    const id=a.getAttribute('href').slice(1);
    const el=document.getElementById(id);
    if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
  })
}
const io = new IntersectionObserver((entries)=>{entries.forEach(en=>{ if(en.isIntersecting) en.target.classList.add('is-in'); })}, {threshold:.2});
document.querySelectorAll('.reveal').forEach(el=> io.observe(el));

const memberOverviewIds = ['members-hero','members-mission-info','members-announcements-section','members-calendar-section','members-contact-section'];
const subteamDetailSection = document.getElementById('members-subteam-detail');
const subteamDetailTitle = document.getElementById('subteam-detail-title');
const subteamDetailContent = document.getElementById('subteam-detail-content');
const subteamDetailDrive = document.getElementById('subteam-detail-drive');
const subteamDetailImage = document.getElementById('subteam-detail-image');
const missionHighlightSection = document.getElementById('mission-highlight');
const missionSummaryEl = document.getElementById('members-mission-summary');

const subteamMeta = {
  airframe: { title: 'Airframe & Structure', file: 'subteams/airframe.txt', drive: 'https://drive.google.com/drive/folders/1zbsAUug3qgkl2ZO4NNdr3jSOXOj2PUOx?usp=sharing', image: 'assets/Ascension%20Structure.png' },
  propulsion: { title: 'Propulsion', file: 'subteams/propulsion.txt', drive: 'https://drive.google.com/drive/folders/1mVWVRmwIK9wUXQAkmsFCMyw_RuaJeSSD?usp=sharing', image: 'assets/Ascension%20Propulsion.png' },
  recovery: { title: 'Recovery', file: 'subteams/recovery.txt', drive: 'https://drive.google.com/drive/folders/1qNLYnXMIF5mPo5r_mWvnrqy5Bd_J5_s_?usp=sharing', image: 'assets/Ascension%20Recovery.png' },
  payload: { title: 'Payload', file: 'subteams/payload.txt', drive: 'https://drive.google.com/drive/folders/1_4oAQ3Cpfb2av9ywwG58SUxS1xPAfx5l?usp=sharing', image: 'assets/Ascension%20Payload.png' },
  avionics: { title: 'Avionics & Electronics', file: 'subteams/avionics.txt', drive: 'https://drive.google.com/drive/folders/1aFLbDr6QvdL4zBIiKESB8ivaBqPUNW3D?usp=sharing', image: 'assets/Ascension%20Avionics.png' }
};

function toggleMembersOverview(show){
  memberOverviewIds.forEach(id=>{
    const el = document.getElementById(id);
    if (el) el.style.display = show ? '' : 'none';
  });
}

// Show/hide main and members portal sections
function showMainPage() {
  document.getElementById('main-hero').style.display = '';
  document.getElementById('project').style.display = '';
  document.getElementById('skills').style.display = '';
  document.getElementById('announcements-calendar').style.display = '';
  document.getElementById('contact').style.display = '';
  if (missionHighlightSection) missionHighlightSection.style.display = '';
  toggleMembersOverview(false);
  if (subteamDetailSection) subteamDetailSection.style.display = 'none';
  document.getElementById('members-btn').style.display = '';
  document.getElementById('back-btn').style.display = 'none';
  hideTopbar();
}
function showMembersPortal() {
  document.getElementById('main-hero').style.display = 'none';
  document.getElementById('project').style.display = 'none';
  document.getElementById('skills').style.display = 'none';
  document.getElementById('announcements-calendar').style.display = 'none';
  document.getElementById('contact').style.display = 'none';
  if (missionHighlightSection) missionHighlightSection.style.display = 'none';
  toggleMembersOverview(true);
  if (subteamDetailSection) subteamDetailSection.style.display = 'none';
  document.getElementById('members-btn').style.display = 'none';
  document.getElementById('back-btn').style.display = '';
  showTopbar('members');
}

// Password gating for members portal (custom modal, works in Google Sites embeds)
let membersAuthenticated = false;
// Using window.MEMBERS_PASSWORD if defined (from config), otherwise fallback
const PASS = window.MEMBERS_PASSWORD || 'BlastOFF';
const modal = document.getElementById('password-modal');
const input = document.getElementById('password-input');
const submit = document.getElementById('password-submit');
const errorMsg = document.getElementById('password-error');

function openPasswordModal() {
  modal.style.display = 'flex';
  input.value = '';
  errorMsg.style.display = 'none';
  setTimeout(() => { input.focus(); }, 100);
}
function closePasswordModal() {
  modal.style.display = 'none';
}

document.getElementById('members-btn').addEventListener('click', () => {
  if (membersAuthenticated) {
    showMembersPortal();
    return;
  }
  openPasswordModal();
});

submit.addEventListener('click', () => {
  if (input.value === PASS) {
    membersAuthenticated = true;
    closePasswordModal();
    showMembersPortal();
  } else {
    errorMsg.style.display = 'block';
    input.value = '';
    input.focus();
  }
});
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') submit.click();
});
modal.addEventListener('click', e => {
  if (e.target === modal) closePasswordModal();
});
document.getElementById('back-btn').addEventListener('click', () => {
  showMainPage();
});


// Helper: convert URLs in text to clickable links
function linkify(text) {
  // Simpler regex: match any http(s) URL
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
}

// Load public announcements for main page
fetch('announcments.txt')
  .then(r => r.ok ? r.text() : Promise.reject(new Error('Announcements not found')))
  .then(text => {
    const list = document.getElementById('announcements-list');
    const publicLines = text
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .filter(l => !(l.startsWith('`') && l.endsWith('`')));
    list.innerHTML = publicLines.length
      ? publicLines.map(line => `<li>${linkify(line)}</li>`).join('')
      : '<li>No announcements</li>';
  })
  .catch(() => {
    const list = document.getElementById('announcements-list');
    if (list) list.innerHTML = '<li>No announcements right now</li>';
  });

// Load both public and member-only announcements for members portal
fetch('announcments.txt')
  .then(r => r.ok ? r.text() : Promise.reject(new Error('Announcements not found')))
  .then(text => {
    const list = document.getElementById('members-announcements');
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const normalized = lines.map(l => {
      // If wrapped with backticks, treat as members-only and strip the backticks
      if (l.startsWith('`') && l.endsWith('`')) return l.slice(1, -1);
      return l;
    });
    list.innerHTML = normalized.length ? normalized.map(l => `<li>${linkify(l)}</li>`).join('') : '<li>No announcements right now</li>';
  })
  .catch(() => {
    const list = document.getElementById('members-announcements');
    if (list) list.innerHTML = '<li>No announcements</li>';
  });

// Load mission description from external text file
fetch('mission.txt')
  .then(r => r.ok ? r.text() : Promise.reject(new Error('Mission text not found')))
  .then(text => {
    const target = document.getElementById('mission-description');
    const safe = escapeHTML(text.trim()).replace(/\n\n+/g,'</p><p>').replace(/\n/g,'<br>');
    if (target) target.innerHTML = '<p>' + linkify(safe) + '</p>';
    if (missionSummaryEl) missionSummaryEl.innerHTML = '<p>' + linkify(safe) + '</p>';
  })
  .catch(() => {
    const target = document.getElementById('mission-description');
    if (target) target.textContent = 'Mission details coming soon.';
    if (missionSummaryEl) missionSummaryEl.innerHTML = '<p>Summary of mission and goals.</p>';
  });

function showSubteamDetail(id){
  if (!subteamDetailSection || !subteamDetailContent || !subteamDetailTitle) return;
  const meta = subteamMeta[id];
  if (!meta) return;
  document.getElementById('main-hero').style.display = 'none';
  document.getElementById('project').style.display = 'none';
  document.getElementById('skills').style.display = 'none';
  document.getElementById('announcements-calendar').style.display = 'none';
  document.getElementById('contact').style.display = 'none';
  toggleMembersOverview(false);
  subteamDetailSection.style.display = '';
  subteamDetailTitle.textContent = meta.title;
  if (subteamDetailDrive){
    if (meta.drive){
      subteamDetailDrive.href = meta.drive;
      subteamDetailDrive.textContent = `${meta.title || 'Subteam'} Folder`;
      subteamDetailDrive.style.display = '';
    } else {
      subteamDetailDrive.style.display = 'none';
    }
  }
  if (subteamDetailImage){
    if (meta.image){
      subteamDetailImage.src = meta.image;
      subteamDetailImage.alt = meta.title + ' visual';
      subteamDetailImage.style.display = 'block';
    } else {
      subteamDetailImage.style.display = 'none';
    }
  }
  subteamDetailContent.innerHTML = '<p>Loading details...</p>';
  loadSubteamDetails(meta.file);
  showTopbar(id);
}

function loadSubteamDetails(path){
  if (!path || !subteamDetailContent) return;
  fetch(path).then(r=> r.ok ? r.text() : Promise.reject(new Error('not found')))
    .then(text => {
      const safe = escapeHTML(text).replace(/\n\n+/g,'</p><p>').replace(/\n/g,'<br>');
      subteamDetailContent.innerHTML = '<p>' + linkify(safe) + '</p>';
    }).catch(()=>{
      subteamDetailContent.innerHTML = '<p>No details yet.</p>';
    });
}

/* Topbar helpers */
const topbar = document.getElementById('members-topbar');
let activeTopbarTarget = 'members';
function showTopbar(active){
  if (!topbar) return;
  activeTopbarTarget = active;
  topbar.style.display = 'flex';
  document.body.classList.add('has-topbar');
  topbar.querySelectorAll('.topbar-item').forEach(b=> b.classList.toggle('active', b.dataset.target===active));
}
function hideTopbar(){
  if (!topbar) return;
  topbar.style.display = 'none';
  document.body.classList.remove('has-topbar');
}

// topbar button handlers
document.querySelectorAll('#members-topbar .topbar-item').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const t = btn.dataset.target;
    if (t === 'members'){
      showMembersPortal();
    } else {
      showSubteamDetail(t);
    }
  });
});

// Robust visibility check: if any members-area section is visible, ensure topbar is shown.
function isAnyMembersSectionVisible(){
  const ids = memberOverviewIds.concat(['members-subteam-detail']);
  for (const id of ids){
    const el = document.getElementById(id);
    if (!el) continue;
    const style = window.getComputedStyle(el);
    if (style && style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null) return true;
  }
  return false;
}

function updateTopbarVisibility(){
  try{
    if (isAnyMembersSectionVisible()){
      showTopbar(activeTopbarTarget);
    } else {
      hideTopbar();
    }
  }catch(e){
    // ignore
  }
}

// periodic fallback in case something prevents immediate show/hide (works in embeds)
setInterval(updateTopbarVisibility, 600);

// helper to escape HTML for safety
function escapeHTML(s){
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
