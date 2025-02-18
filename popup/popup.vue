<template>
  <div class="popup">
    <h1>FocusFlow</h1>
    <div>
      <input
          v-model="newSite"
          placeholder="Введіть URL site (наприклад, example.com)"
      />
      <button @click="addSite">Додати</button>

      <h2>Block Sites:</h2>
      <ul>
        <li v-for="(site, index) in blockedSites" :key="index">
          {{ site }}
          <button @click="removeSite(index)">Delete</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const newSite = ref('');
const blockedSites = ref([]);

// download list block sites to open popup
onMounted(async () => {
  await loadBlockedSites();
});

// download list with сховища
const loadBlockedSites = async () => {
  try {
    const data = await chrome.storage.local.get('blockedSites');
    if (data.blockedSites && Array.isArray(data.blockedSites)) {
      blockedSites.value = data.blockedSites;
      console.log('Завантажені сайти:', blockedSites.value);
    } else {
      console.log('no save sites ');
    }
  } catch (error) {
    console.error('error save sites:', error);
  }
};

// Added site to list and сховища
const addSite = async () => {
  if (newSite.value) {
    const site = newSite.value.trim();
    const fullUrl = site.startsWith('http://') || site.startsWith('https://') ? site : `https://${site}`;

    // Додати сайт до списку
    blockedSites.value.push(fullUrl);

    // Зберегти оновлений список у сховищі
    try {
      await chrome.storage.local.set({ blockedSites: blockedSites.value });
      console.log('Сайт додано та збережено:', fullUrl);
    } catch (error) {
      console.error('error при save site:', error);
    }

    // Оновити правила блокування
    await updateBlockingRules(blockedSites.value);

    // Очистити поле введення
    newSite.value = '';
  }
};

// Видалити сайт зі списку та сховища
const removeSite = async (index) => {
  // Видалити сайт зі списку
  const removedSite = blockedSites.value.splice(index, 1)[0];

  // Оновити сховище
  try {
    await chrome.storage.local.set({ blockedSites: blockedSites.value });
    console.log('site deleted and update storage:', removedSite);
  } catch (error) {
    console.error(' Eror in delete site:', error);
  }

  // update rules block
  await updateBlockingRules(blockedSites.value);
};

// Update rules block
const updateBlockingRules = async (sites) => {
  try {
    // delete all поточні rules
    const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
    const currentRuleIds = currentRules.map(rule => rule.id);
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: currentRuleIds,
    });

    // add new rules
    const rules = sites.map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: { type: 'block' },
      condition: {
        urlFilter: `||${new URL(site).hostname}^`, // block all піддомени
        resourceTypes: ['main_frame'], // block basic сторінки
      },
    }));

    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: rules,
    });

    console.log('Правила блокування оновлено.');
  } catch (error) {
    console.error('Помилка при оновленні правил блокування:', error);
  }
};
</script>

<style>
.popup {
  width: 300px;
  padding: 20px;
  font-family: Arial, sans-serif;
}

button {
  margin-left: 10px;
}
</style>