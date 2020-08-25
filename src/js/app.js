import Choices from 'choices.js';
import cyrillicToTranslit from 'cyrillic-to-translit-js';

const element = document.querySelector('.js-select-address-input');

const singleFetch = new Choices(element, {
  searchPlaceholderValue: 'Пошук населеного пункту',
  itemSelectText: '',
  noResultsText: 'Не знайдено жодного населеного пункту',
  noChoicesText: 'Не знайдено жодного населеного пункту',
  loadingText: 'Завантаження населених пунктів...'
})
  .setChoices(function() {
    return fetch(
      'koatuu.json'
    )
      .then(function(response) {
        return response.json();
      })
      .then(function(jsonResponse) {
        const settlements = [];
        const regions = [];

        jsonResponse.forEach(el => {
          let sName = '';
          if (el['Категорія'] === 'М') {
            sName = 'М.';
          }
          if (el['Категорія'] === 'Т') {
            sName = 'СМТ.';
          }
          if (el['Категорія'] === 'С' || el['Категорія'] === 'Щ') {
            sName = 'С.';
          }


          if (!el['Другий рівень'] &&
              el['Назва об\'єкта українською мовою'].includes('/') ) {
            regions.push({
              name: el['Назва об\'єкта українською мовою'].substr(0, el['Назва об\'єкта українською мовою'].indexOf('/')),
              el,
              items: []
            });
          }

          if (el['Другий рівень'] && el['Категорія'] && !el['Третій рівень']) {

            regions.forEach(region => {
              if (region.el['Перший рівень'] === el['Перший рівень']) {
                region.items.push({
                  name: `${sName}${el['Назва об\'єкта українською мовою']}`,
                  el,
                });
              }
            });
          }

          if (el['Другий рівень'] &&
              el['Другий рівень'].toString().substr(-7) !== '0000000' &&
              el['Назва об\'єкта українською мовою'].includes('РАЙОН') &&
              !el['Третій рівень'] &&
              !el['Категорія']) {

            regions.forEach(region => {
              if (region.el['Перший рівень'] === el['Перший рівень']) {
                region.items.push({
                  name: el['Назва об\'єкта українською мовою'].substr(0, el['Назва об\'єкта українською мовою'].indexOf('/')),
                  el,
                  items: []
                });
              }
            });
          }

          if (el['Категорія']) {
            regions.forEach(region => {
              if (region.el['Перший рівень'] === el['Перший рівень']) {
                region.items.forEach(district => {
                  if (!district.items) return;
                  if (district.el['Другий рівень'] === el['Другий рівень']) {
                    district.items.push({
                      name: `${sName}${el['Назва об\'єкта українською мовою']}`,
                      el
                    });
                  }
                })
              }
            });
          }
        });

        console.log(regions);


        regions.forEach(r => {
          r.items.forEach(d => {
            if (!d.items) {
              settlements.push(`${d.name}, ${r.name}`);
              return;
            }
            d.items.forEach(s => {
              settlements.push(`${s.name}, ${d.name}, ${r.name}`);
            });
          });
        });


        console.log(settlements);

        return settlements.map(item => {
          return { label: item, value: item };
        });
      });
  });
