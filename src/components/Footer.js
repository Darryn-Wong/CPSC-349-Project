import React from 'react';

import Container from 'components/Container';

const Footer = () => {
  return (
    <footer>
      <Container>
        <div>
          <h1>About Us</h1>
          <p>Authors: Michael Moon, Ryan Patrick, and Darryn Wong<br /><br />
          Hi, we're Team ChickAnd Sandwich, this is an academic project for<br />
          CSUF CPSC349-01 taught by Professor William McCarthy<br />
            <a href='https://github.com/Darryn-Wong/CPSC-349-Project'>Github Repository</a><br />
          </p>

          <hr />
          <h1>Data Sources</h1>
          <p>
            Data taken from the following sources <br />
            <a href='https://corona.lmao.ninja/v2/countries'>Map Information</a><br />
            <a href='https://disease.sh/v3/covid-19/vaccine/coverage/countries?lastdays=1'>Vaccine Information</a><br />
            Website Based off of this Github repository <br />
            <a href='https://github.com/colbyfayock/my-coronavirus-map'>Colby Fayock's COVID Map</a><br />
          </p>
          <br></br>
          <hr />
          <p>&copy; {new Date().getFullYear()}, My Gatsby Site</p>
        </div>
      </Container>
    </footer>
  );
  // return (<></>)
};

export default Footer;
