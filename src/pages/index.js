import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import L from 'leaflet';

import { useTracker } from 'hooks';
import { commafy, friendlyDate } from 'lib/util';

import Layout from 'components/Layout';
import Container from 'components/Container';
import Map from 'components/Map';

const LOCATION = {
  lat: 0,
  lng: 0,
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;
var globalMap = {};
// console.log(StatsInit());
// function StatsInit() {
//   var apiUrl = 'https://corona.lmao.ninja/v2/countries';
//   fetch(apiUrl).then(response => {
//     return response.json();
//   }).then(data => {
//     // console.log(data)
//     return (<li><a href="#">Adele</a></li>)
//     // return ()
//   }).catch(err => {
//   });
// }

function liItem(data) {
  // console.log(data)
  function click() { }
  return (
    <ul id="myUL">
      <input type="text" id="myInput" onKeyUp={() => {
        // search function goes here
      }} placeholder="Search for names.."></input>
      {data.map((item, index) => {
        return (
          <li key={index}>
            <a href="#" onClick={() => {
              console.log(item.countryInfo.lat)
              globalMap.setView([item.countryInfo.lat + 20, item.countryInfo.long], 3);
              console.log(Map)
            }
            }>{item.country}</a>
          </li>
        )
      })}
    </ul>
  )
}

function ParentThatFetches() {
  const [data, updateData] = useState();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const getData = async () => {
      const resp = await fetch('https://corona.lmao.ninja/v2/countries');
      const json = await resp.json()
      updateData(json);
      setLoading(false);
    }
    getData();
  }, []);

  // return data && liItem(data)
  return data && liItem(data)

  // return (
  //   <div>
  //     { loading ? (<div>Loading...</div>) :
  //       (
  //         <div>
  //           {data.map((datas, index) => {
  //             return (
  //               <div key={index}>
  //                 <h1>{datas}</h1>
  //               </div>
  //             )
  //           })}
  //         </div>

  //       )
  //     }
  //   </div>
  // )
}

const IndexPage = () => {

  const [countryList, setCountryList] = useState();
  // counter based on num of total items.
  let [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchCountries = async () => {
      var apiUrl = 'https://corona.lmao.ninja/v2/countries';
      fetch(apiUrl).then(response => {
        // const resp = fetch(apiUrl);
        // const json = resp.json();
        // setCountryList(json);
        // console.log(countryList);
      }).catch(err => {
      });
    }

    //fetchCountries();
  }, []);

  const { data: stats = {} } = useTracker({
    api: 'all',
  });

  const { data: countries = [] } = useTracker({
    api: 'countries',
  });
  const hasCountries = Array.isArray(countries) && countries.length > 0;

  const dashboardStats = [
    {
      primary: {
        label: 'Total Cases',
        value: stats ? commafy(stats?.cases) : '-',
      },
      secondary: {
        label: 'Per 1 Million',
        value: stats ? commafy(stats?.casesPerOneMillion) : '-',
      },
    },
    {
      primary: {
        label: 'Total Deaths',
        value: stats ? commafy(stats?.deaths) : '-',
      },
      secondary: {
        label: 'Per 1 Million',
        value: stats ? commafy(stats?.deathsPerOneMillion) : '-',
      },
    },
    {
      primary: {
        label: 'Total Tests',
        value: stats ? commafy(stats?.tests) : '-',
      },
      secondary: {
        label: 'Per 1 Million',
        value: stats ? commafy(stats?.testsPerOneMillion) : '-',
      },
    },
    {
      primary: {
        label: 'Active Cases',
        value: stats ? commafy(stats?.active) : '-',
      },
    },
    {
      primary: {
        label: 'Critical Cases',
        value: stats ? commafy(stats?.critical) : '-',
      },
    },
    {
      primary: {
        label: 'Recovered Cases',
        value: stats ? commafy(stats?.recovered) : '-',
      },
    },
  ];

  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  var geoJson = {};
  var countryStats = [];
  async function mapEffect({ leafletElement: map } = {}) {
    if (!hasCountries || !map) return;
    map.eachLayer((layer) => {
      if (layer?.options?.name === 'OpenStreetMap') return;
      map.removeLayer(layer);
    });
    if (map !== undefined) {
      globalMap = map
    }
    console.log(map, globalMap)
    geoJson = {
      type: 'FeatureCollection',
      features: countries.map((country = {}) => {
        const { countryInfo = {} } = country;
        const { lat, long: lng } = countryInfo;
        return {
          type: 'Feature',
          properties: {
            ...country,
          },
          geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        };
      }),
    };
    // for (var i = 0; i < geoJson['features'].length; i++) {
    //   countryStats[i] = geoJson['features'][i]['properties']
    // }
    // console.log(countryStats)

    const geoJsonLayers = new L.GeoJSON(geoJson, {
      pointToLayer: (feature = {}, latlng) => {
        const { properties = {} } = feature;
        let updatedFormatted;
        let casesString;

        const { country, updated, cases, deaths, recovered } = properties;

        casesString = `${cases}`;

        if (cases > 1000000) {
          casesString = `${casesString.slice(0, -6)}M+`;
        } else if (cases > 1000) {
          casesString = `${casesString.slice(0, -3)}K+`;
        }
        if (updated) {
          updatedFormatted = new Date(updated).toLocaleString();
        }

        const html = `
          <span class="icon-marker">
            <span class="icon-marker-tooltip">
              <h2>${country}</h2>
              <ul>
                <li><strong>Confirmed:</strong> ${cases}</li>
                <li><strong>Deaths:</strong> ${deaths}</li>
                <li><strong>Recovered:</strong> ${recovered}</li>
                <li><strong>Last Update:</strong> ${updatedFormatted}</li>
              </ul>
            </span>
            ${casesString}
          </span>
        `;

        return L.marker(latlng, {
          icon: L.divIcon({
            className: 'icon',
            html,
          }),
          riseOnHover: true,
        });
      },
    });

    geoJsonLayers.addTo(map);
    return map
  }

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'OpenStreetMap',
    zoom: DEFAULT_ZOOM,
    mapEffect,
  };

  // function filterFunction() {
  //   input = document.getElementById("myInput");
  //   filter = input.value.toUpperCase();
  //   div = document.getElementById("myDropdown");
  //   a = div.getElementsByTagName("a");
  //   for (i = 0; i < a.length; i++) {
  //     txtValue = a[i].textContent || a[i].innerText;
  //     if (txtValue.toUpperCase().indexOf(filter) > -1) {
  //       a[i].style.display = "";
  //     } else {
  //       a[i].style.display = "none";
  //     }
  //   }
  // }

  return (
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>
      <div id='left-container'>
        {/* <input type="text" id="myInput" onKeyUp="filterFunction()" placeholder="Search for names.."></input> */}
        {/* {countryStats.map((data) => {
          console.log(data.country);
          return (
            <li><a href="#">${data.country}</a></li>
          );
        })} */}
        {ParentThatFetches()}
      </div>
      <div className="tracker">
        <Map {...mapSettings} />
        <div className="tracker-stats">
          <ul>
            {dashboardStats.map(({ primary = {}, secondary = {} }, i) => {
              return (
                <li key={`Stat-${i}`} className="tracker-stat">
                  { primary.value && (
                    <p className="tracker-stat-primary">
                      { primary.value}
                      <strong>{primary.label}</strong>
                    </p>
                  )}
                  { secondary.value && (
                    <p className="tracker-stat-secondary">
                      { secondary.value}
                      <strong>{secondary.label}</strong>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="tracker-last-updated">
          <p>Last Updated: {stats ? friendlyDate(stats?.updated) : '-'}</p>
        </div>
      </div>
    </Layout>
  );
};

export default IndexPage;
