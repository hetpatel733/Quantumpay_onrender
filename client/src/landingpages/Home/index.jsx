import React from "react";
import Navbar from "../navbar";
import Footer from "../footer";

// Import CSS for Home component
import "../../styles/landingpage/home.css";
import "../../styles/landingpage/home_hover.css";
import "../../styles/landingpage/home-responsive.css"; // New combined media queries file

const Home = () => {
  const scrollToLayout3 = () => {
    document.querySelector('.layout3').scrollIntoView();
  };

  return (
    <>
      <Navbar />
      {/* Add top margin to prevent content being hidden behind fixed navbar */}
      <main style={{ marginTop: "80px" }}>
        {/* LAYOUT 1 */}
        <div className="layouts layout1">
          <img src="/images/Charlie.webp" className="lay1img" alt="Charlie" />
          <div className="contentl1">
            <h1 className="lay1head">
              <b>CRYPTOCURRENCY PAYMENTS FOR BUSINESS</b>
            </h1>
            <p className="lay1para pclay1title">
              Discover the superpowers of cryptocurrencies by unlocking their
              full potential.
            </p>
            <ul className="listremove">
              <li>
                <p className="lay1para lay1features">
                  <i className="bi bi-check2" />
                  <b> Fast</b> - Get started in minutes with our self-managed
                  product.
                </p>
              </li>
              <li>
                <p className="lay1para lay1features">
                  <i className="bi bi-check2" />
                  <b> Flexible</b> - Accept a growing number of cryptocurrencies
                  and convert to cash or stablecoins.
                </p>
              </li>
              <li>
                <p className="lay1para lay1features">
                  <i className="bi bi-check2" />
                  <b> Global</b> - Open your business up to customers around the
                  world.
                </p>
              </li>
            </ul>
            <div className="btncenter">
              <button
                className="
                  bg-primary text-white px-6 py-3 rounded-lg font-medium
                  shadow-card
                  transition-all duration-300 ease-in-out
                  hover:bg-primary-700 hover:scale-[1.04] hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-primary-100
                  active:scale-[0.98]
                  transform-origin-center
                "
                style={{ transformOrigin: "center" }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
        {/* LAYOUT 2 */}
        <div className="layouts layout2">
          <div className="bgcolorlay2">
            <img src="/images/layout2img.webp" className="lay2img" alt="web-preview" />
            <div className="contentl2">
              <h1 className="lay2head">
                <b>More than just a Crypto Payment Processor</b>
              </h1>
              <ul className="listremove">
                <li>
                  <p className="lay2para">
                    <br />
                    <i className="bi bi-dash" /> Accept crypto payments with 0
                    fees
                  </p>
                </li>
                <li>
                  <p className="lay2para">
                    <i className="bi bi-dash" /> Spend crypto on gift cards
                    &amp; at online stores
                  </p>
                </li>
                <li>
                  <p className="lay2para">
                    <i className="bi bi-dash" /> Buy, sell &amp; swap more than
                    100 cryptocurrencies
                  </p>
                </li>
              </ul>
              <br />
              <div className="btncenter">
                <button
                  className="
                    bg-primary text-white px-6 py-3 rounded-lg font-medium
                    shadow-card
                    transition-all duration-300 ease-in-out
                    hover:bg-primary-700 hover:scale-[1.04] hover:shadow-lg
                    focus:outline-none focus:ring-2 focus:ring-primary-100
                    active:scale-[0.98]
                  "
                >
                  Explore Now
                </button>
              </div>
              <img
                src="/images/lay2arrow.gif"
                alt=""
                className="lay2arrow"
                onClick={scrollToLayout3}
              />
            </div>
          </div>
        </div>
        {/* LAYOUT 3 */}
        <div className="layouts layout3">
          <div className="lay3left">
            <div className="lay3content lay3leftcontent">
              <h2>Business</h2>
              <h3>Serving 100,000+ merchants globally</h3>
              <ul className="lay3ul">
                <li className="lay3li">
                  <p>Real-time Cross-Border payments</p>
                </li>
                <li className="lay3li">
                  <p>Providing 0 proccesing fees over industry</p>
                </li>
                <li className="lay3li">
                  <p>Reduced fraud risk with no chargebacks</p>
                </li>
                <li className="lay3li">
                  <p>Wide range of conversion options</p>
                </li>
              </ul>
              <button
                className="
                  bg-primary text-white px-6 py-3 rounded-lg font-medium
                  shadow-card
                  transition-all duration-300 ease-in-out
                  hover:bg-primary-700 hover:scale-[1.04] hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-primary-100
                  active:scale-[0.98]
                  mt-8
                "
              >
                Accept Crypto Now
              </button>
            </div>
          </div>
          <div className="lay3right">
            <div className="lay3content lay3rightcontent">
              <img src="fonts/portfolio.svg" alt="" />
              <h2>Personal</h2>
              <h3>1,000,000+ Wallet users love these features</h3>
              <ul className="lay3ul">
                <li className="lay3li">
                  <p>Hold 2,310+ cryptocurrencies on one platform</p>
                </li>
                <li className="lay3li">
                  <p>Convert your crypto</p>
                </li>
                <li className="lay3li">
                  <p>Purchase gift cards</p>
                </li>
              </ul>
              <button
                className="
                  bg-primary text-white px-6 py-3 rounded-lg font-medium
                  shadow-card
                  transition-all duration-300 ease-in-out
                  hover:bg-primary-700 hover:scale-[1.04] hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-primary-100
                  active:scale-[0.98]
                  mt-6
                "
                style={{ marginTop: 24 }}
              >
                Set Up Your Free Wallet Now
              </button>
            </div>
          </div>
        </div>
        {/* LAYOUT 4 */}
        <div className="layouts layout4">
          <div className="lay4headparent">
            <h2 className="lay4head">Manage Crypto Like a Pro</h2>
          </div>
          <div className="lay4main">
            <div className="lay4left lay4child">
              <div className="lay4item">
                <div className="lay4img">
                  <img src="/images/wallet.webp" />
                </div>
                <div className="lay4text">
                  <h3 className="lay4title">Multi-Coin Wallet*</h3>
                  <div className="lay4description">
                    One wallet. 2,310+ coins. Countless features on the go.
                  </div>
                </div>
              </div>
              <div className="lay4item">
                <div className="lay4img">
                  <img src="/images/conversion.webp" />
                </div>
                <div className="lay4text">
                  <h3 className="lay4title">Auto Coin Conversion*</h3>
                  <div className="lay4description">
                    Avoid volatility by automatically converting coins.
                  </div>
                </div>
              </div>
              <div className="lay4item">
                <div className="lay4img">
                  <img src="/images/global.webp" />
                </div>
                <div className="lay4text">
                  <h3 className="lay4title">Global Payments</h3>
                  <div className="lay4description">
                    Grow your business globally with borderless, instant and
                    <nobr>low-cost</nobr>
                    crypto transactions.
                  </div>
                </div>
              </div>
            </div>
            <div className="lay4right lay4child">
              <div className="lay4item">
                <div className="lay4img">
                  <img src="/images/vault.webp" />
                </div>
                <div className="lay4text">
                  <h3 className="lay4title">Cryptocurrency Vault*</h3>
                  <div className="lay4description">
                    Safeguard your Crypto in our vault and lock them for as long
                    as you want.
                  </div>
                </div>
              </div>
              <div className="lay4item">
                <div className="lay4img">
                  <img src="/images/sale.webp" />
                </div>
                <div className="lay4text">
                  <h3 className="lay4title">Point of Sale (POS)</h3>
                  <div className="lay4description">
                    Enhance in-person transactions with crypto payments.
                  </div>
                </div>
              </div>
              <div className="lay4item">
                <div className="lay4img">
                  <img src="/images/feature.webp" />
                </div>
                <div className="lay4text">
                  <h3 className="lay4title">Auto Forward*</h3>
                  <div className="lay4description">
                    Automatically send payments to any crypto wallet you want.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* LAYOUT 5 */}
        <div className="layouts layout5">
          <h2>Strong Partnerships</h2>
          <div className="partners">
            <div className="partner">
              <img src="/images/partner1.webp" className="partnerimg" alt="" />
            </div>
            <div className="partner">
              <img
                src="/images/partner2.webp"
                className="partnerimg issuepartner1"
                alt=""
              />
            </div>
            <div className="partner">
              <img
                src="/images/partner3.webp"
                className="partnerimg issuepartner2"
                alt=""
              />
            </div>
            <div className="partner">
              <img src="/images/partner4.webp" className="partnerimg" alt="" />
            </div>
            <div className="partner">
              <img src="/images/partner5.webp" className="partnerimg" alt="" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Home;
