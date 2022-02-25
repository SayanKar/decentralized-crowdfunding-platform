import { useEffect, useState } from "react";
import CategoryComponent from "./CategoryComponent";
import ScrollShowbarComponent from "./ScrollShowbarComponent";
import { Link } from "react-router-dom";
import dummyPic from "../assets/pg1.jpg";

export default function HomeComponent(props) {
  const PRECISION = 10 ** 18;
  const [stats, setStats] = useState({
    projects: 0,
    fundings: 0,
    contributors: 0,
  });
  const [featuredRcmd, setFeaturedRcmd] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const getAllProjects = async () => {
    try {
      let res = await props.contract.getAllProjectsDetail().then((res) => {
        let tmp = [];
        let amount = 0,
          contrib = 0;
        for (const index in res) {
          let {
            amountRaised,
            cid,
            creatorName,
            fundingGoal,
            projectDescription,
            projectName,
            totalContributors,
          } = { ...res[index] };
          tmp.push({
            amountRaised,
            cid,
            creatorName,
            fundingGoal,
            projectDescription,
            projectName,
            totalContributors,
            index,
          });
          amount += Number(amountRaised / PRECISION);
          contrib += Number(totalContributors);
        }
        setStats({
          projects: tmp.length,
          fundings: amount,
          contributors: contrib,
        });
        return tmp;
      });
      res.sort((a, b) => {
        return b.totalContributors * 1 - a.totalContributors * 1;
      });
      setFeaturedRcmd(res.slice(0, 4));
      setRecentUploads(res.slice(4, 24));
    } catch (err) {
      alert(err);
      console.log(err);
    }
  };

  const renderRecommendations = (val) => {
    return val.map((project, index) => {
      return (
        <div className="recommendationCard" key={index}>
          <Link to="/project" state={{ index: project.index }}>
            <div
              className="rcmdCardImg"
              style={{
                backgroundImage: project.cid
                  ? `url(${"https://" + project.cid})`
                  : dummyPic,
              }}
            ></div>
          </Link>
          <div className="rcmdCardDetails">
            <div className="rcmdCardHeading">
              <Link to="/project" state={{ index: project.index }}>
                {project.projectName}
              </Link>
            </div>
            <div className="rcmdCardFundedPercentage">
              {((project.amountRaised / project.fundingGoal) * 100).toFixed(2) +
                "% Funded"}
            </div>
            <div className="rcmdCardAuthor">{"By " + project.creatorName}</div>
          </div>
        </div>
      );
    });
  };

  useEffect(() => {
    getAllProjects();
  }, []);

  return (
    <>
      <CategoryComponent isHome={true} />
      {/* siteStats */}
      <div className="siteStats">
        <div className="tagLine">
          Creative work shows us what’s possible.
          <br></br>
          Help fund it here.
        </div>
        <div className="smallHeading">TILL THIS DAY</div>
        <div className="stats">
          <div className="statItem">
            <div className="statItemValue">{stats.projects}</div>
            <div className="statItemTag">projects </div>
          </div>
          <div className="statItem">
            <div className="statItemValue">{stats.fundings + " AVAX"}</div>
            <div className="statItemTag">towards creative work</div>
          </div>
          <div className="statItem">
            <div className="statItemValue">{stats.contributors}</div>
            <div className="statItemTag">backings</div>
          </div>
        </div>
      </div>

      {featuredRcmd.length !== 0 ? (
        <div className="suggestions">
          <div className="suggLeftContainer">
            <div className="featuredCard">
              <div className="featuredHeading">FEATURED PROJECT</div>
              <Link to="/project" state={{ index: featuredRcmd[0].index }}>
                <div
                  className="featuredCardProjectImg"
                  style={{
                    backgroundImage: featuredRcmd[0].cid
                      ? `url(${"https://" + featuredRcmd[0].cid})`
                      : dummyPic,
                  }}
                ></div>
              </Link>
              <div className="featuredProjectHeading">
                <Link to="/project" state={{ index: featuredRcmd[0].index }}>
                  {featuredRcmd[0].projectName}
                </Link>
              </div>
              <div className="featuredProjectDescription">
                {featuredRcmd[0].projectDescription}
              </div>
              <div className="featuredProjectAuthor">
                {"By " + featuredRcmd[0].creatorName}
              </div>
            </div>
          </div>
          <div className="suggRightContainer">
            <div className="recommendationList">
              <div className="recommendationHeading">RECOMMENDED FOR YOU</div>
              {renderRecommendations(featuredRcmd.slice(1, 4))}
            </div>
          </div>
        </div>
      ) : (
        <div className="noProjects">No projects found</div>
      )}
      <ScrollShowbarComponent
        recentUploads={recentUploads}
        heading={"RECENT UPLOADS"}
        emptyMessage={"No recent uploads"}
      />
    </>
  );
}
