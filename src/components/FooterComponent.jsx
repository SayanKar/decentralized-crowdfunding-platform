import { FaGithub, FaInstagram, FaTwitter } from "react-icons/fa";

export default function FooterComponent(props) {
  return (
    <div className="footer">
      <div className="footerContainer">
        <div className="trademarkSection">DeFindstarter © 2022</div>
        <div className="externalLinks">
          <div className="linkWrapper">
            <div className="icon">
              <a
                href="https://twitter.com/crypto_gaijin"
                className="twitter-icon"
                target="_blank"
                rel="noreferrer"
              >
                <FaTwitter />
              </a>
            </div>
            <div className="icon">
              <a
                href="https://github.com/hyp3r5pace"
                className="github-icon"
                target="_blank"
                rel="noreferrer"
              >
                <FaGithub />
              </a>
            </div>
            <div className="icon">
              <div className="insta-icon-bg">
                <a
                  href="https://www.instagram.com/sayan.kar2000/"
                  className="insta-icon"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaInstagram />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
