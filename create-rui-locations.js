const fs = require('fs');
const path = require('path');

const iris = {
  body: 'http://purl.obolibrary.org/obo/UBERON_0013702',
  heart: 'http://purl.obolibrary.org/obo/UBERON_0000955' //brain
};

const defaults = JSON.parse(fs.readFileSync('defaults.json'));
const rui_locations = [];

for (const ruiFile of fs.readdirSync(defaults.ruiLocationsDir)) {
  if (ruiFile.endsWith('.json')) {
    const label = path.basename(ruiFile).replace('.json', '');
    const link = defaults.linkBase //+ label;     removed add label to link
    const rui_location = JSON.parse(fs.readFileSync(path.join(defaults.ruiLocationsDir, ruiFile)));
    const target = rui_location.placement.target.split('#')[1];
    const annotations = rui_location.ccf_annotations || [];

    if (target.indexOf('VHFAllenBrain') === 0 || target.indexOf('VHMAllenBrain') === 0) { //changed VHMHeart and VHFHeart to look for Allen Brain
      if (!annotations.includes(iris.heart)) {
        annotations.unshift(iris.heart);
      }
    }
    if (!annotations.includes(iris.body)) {
      annotations.unshift(iris.body);
    }
    
    let sex = 'Male';
    if (target.indexOf('VHF') === 0) {
      sex = 'Female'
    }
    rui_locations.push({
      '@context': 'https://hubmapconsortium.github.io/hubmap-ontology/ccf-entity-context.jsonld',
      '@id': rui_location['@id'] + '_Donor',
      '@type': 'Donor',
      sex,
      label,
      description: label,
      link,
      consortium_name: defaults.consortium_name,
      provider_name: defaults.provider_name,
      provider_uuid: defaults.provider_uuid,
      samples: [
        {
          '@id': rui_location['@id'] + '_TissueBlock',
          '@type': 'Sample',
          sample_type: 'Tissue Block',
          label,
          description: label,
          link,
          section_count: 1,
          section_size: 0.11,
          section_units: 'millimeter',
          rui_location,
          datasets: [{
            '@id': rui_location['@id'] + '_Dataset',
            '@type': 'Dataset',
            label,
            descripition: label,
            link,
            technology: 'OTHER',
            thumbnail: defaults.thumbnail
          }]
        }
      ]
    });
  }
}

fs.writeFileSync('rui_locations.jsonld', JSON.stringify(rui_locations, null, 2));
