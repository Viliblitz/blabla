function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

const column = 'urlbutton';
let app = undefined;
let data = {
  status: 'waiting',
  result: null,
  input: {
    description: null,
    button: null,
    url: null,  // Remplacez 'actions' par 'url'
  }
}

function handleError(err) {
  console.error('ERROR', err);
  data.status = String(err).replace(/^Error: /, '');
}

function applyActions() {
  try {
    if (data.input.url) {
      window.open(data.input.url, '_blank');  // Ouvrir l'URL dans un nouvel onglet
    } else {
      throw new Error('URL is missing.');
    }
  } catch (e) {
    handleError(e);
  }
}

function onRecord(row, mappings) {
  try {
    data.status = '';
    data.result = null;
    // Si aucun mapping, utiliser l'enregistrement original.
    row = grist.mapColumnNames(row) || row;
    if (!row.hasOwnProperty(column)) {
      throw new Error(`Need a visible column named "${column}". You can map a custom column in the Creator Panel.`);
    }
    const keys = ['button', 'description', 'url'];  // Utilisez 'url' au lieu de 'actions'
    if (!row[column] || keys.some(k => !row[column][k])) {
      const allKeys = keys.map(k => JSON.stringify(k)).join(", ");
      const missing = keys.filter(k => !row[column]?.[k]).map(k => JSON.stringify(k)).join(", ");
      const gristName = mappings?.[column] || column;
      throw new Error(`"${gristName}" cells should contain an object with keys ${allKeys}. ` +
        `Missing keys: ${missing}`);
    }
    data.input = row[column];
  } catch (err) {
    handleError(err);
  }
}

ready(function() {
  // Mettre à jour le widget à chaque changement de données du document.
  grist.ready({ columns: [{ name: column, title: "urlbutton" }] });
  grist.onRecord(onRecord);

  Vue.config.errorHandler = handleError;
  app = new Vue({
    el: '#app',
    data: data,
    methods: { applyActions }
  });
});
