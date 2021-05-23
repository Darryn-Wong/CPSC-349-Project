import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import L from 'leaflet';

import { useTracker } from 'hooks';
import { commafy, friendlyDate } from 'lib/util';

import Layout from 'components/Layout';
import Container from 'components/Container';
import Map from 'components/Map';

const LOCATION = {
  lat: 60,
  lng: 10,
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;
var globalMap = {};
var globalVaccine = {};


const IndexPage = () => {
  const [countryName, setCountryName] = useState("Select Country");
  const [vaccinations, setVaccinations] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = event => {
    setSearchTerm(event.target.value);
  };

  function liItem(data, data2, searchTerm) {
    const results = !searchTerm
      ? data
      : data.filter(data =>
        data.country.toLowerCase().startsWith(searchTerm.toLocaleLowerCase())
      );
    var curState = 'USA'
    // console.log(data)
    function click() { }
    return (
      <>
        <ul id="myUL">
          {results.map((item, index) => {
            return (
              <li key={index}>
                <a href="#" onClick={() => {
                  globalMap.flyTo([item.countryInfo.lat + 3, item.countryInfo.long], 6)
                  { setVaccinations(vaccineInjection(item.country, data2)) }
                  { setCountryName(item.country) }
                }
                }>{item.country}</a>
              </li>
            )
          })}
        </ul>
      </>
    )
  };
  //obj[Object.keys(obj)[0]];
  function vaccineInjection(country, data2) {
    var a = 0;
    const results = !country ? ''
      : data2.filter(data2 =>
        data2.country.toLowerCase().includes(country.toLocaleLowerCase())
      );
    const result = results[0].timeline;
    const keyw = result[Object.keys(result)[0]]
    return (
      <div id='vacc'>
        <h1>{keyw}</h1>
      </div>
    )
  }

  // const [vaccine, setVaccine] = useState();
  // const [curState, setCurState] = useState();
  function ParentThatFetches(searchTerm) {
    const [data, updateData] = useState();
    const [data2, setData2] = useState();
    useEffect(() => {
      const getData = async () => {
        const resp = await fetch('https://corona.lmao.ninja/v2/countries');
        const json = await resp.json()

        const resp2 = await fetch('https://disease.sh/v3/covid-19/vaccine/coverage/countries?lastdays=1')
        const json2 = await resp2.json()

        updateData(json)

        setData2(json2);
        console.log(data2)
      }
      getData();
    }, []);

    // return data && liItem(data)
    return data && liItem(data, data2, searchTerm)
  }

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
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={handleChange}
        />
        {ParentThatFetches(searchTerm)}
        <div id='vaccine'>
          <h5>Vaccinations by Country</h5>
          <h6>{countryName}</h6>
          <h6>{vaccinations}</h6>
        </div>
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
