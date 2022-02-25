import ScrollShowbarComponent from "./ScrollShowbarComponent";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function ProfileComponent(props) {
  const location = useLocation();
  const { address } = location.state;
  const { name } = location.state;
  const [ongoingProjects, setOngoingProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [userFundedProjects, setUserFundedProjects] = useState([]);

  // fetch the projects created by the address passed as parameter
  async function getProjectList() {
    let res;
    try {
      // fetch the project information from the contract for the address
      let indexList = await props.contract.getCreatorProjects(address);
      res = await props.contract.getProjectsDetail(indexList).then((res) => {
        let tmp = [];
        for (const index in res) {
          let {
            cid,
            creatorName,
            projectDescription,
            projectName,
            creationTime,
            duration,
          } = { ...res[index] };
          tmp.push({
            cid,
            creatorName,
            projectDescription,
            projectName,
            creationTime,
            duration,
            index: Number(indexList[index]),
          });
        }
        return tmp;
      });
    } catch (error) {
      console.log(error);
      alert("Error Fetching data: " + error);
    }

    let currProjects = [];
    let finishedProjects = [];

    // separating the list of projects on the basis of competion status
    for (const index in res) {
      const currentTime = new Date().getTime() / 1000;
      const remainingTime =
        Number(res[index].creationTime) +
        Number(res[index].duration) -
        currentTime;
      if (remainingTime < 0) {
        finishedProjects.push(res[index]);
      } else {
        currProjects.push(res[index]);
      }
    }
    setOngoingProjects(currProjects);
    setCompletedProjects(finishedProjects);
  }

  // fetch the list of projects, the user has funded
  async function getUserFundingList() {
    let res;
    try {
      let fundingList = await props.contract
        .getUserFundings(props.userAddress)
        .then((fundingList) => {
          let tmp = [];
          for (const index in fundingList) {
            tmp.push(fundingList[index].projectIndex);
          }
          return tmp;
        });

      res = await props.contract.getProjectsDetail(fundingList).then((res) => {
        let tmp = [];
        for (const index in res) {
          let { cid, creatorName, projectDescription, projectName } = {
            ...res[index],
          };
          tmp.push({
            cid,
            creatorName,
            projectDescription,
            projectName,
            index: Number(fundingList[index]),
          });
        }
        return tmp;
      });
    } catch (error) {
      console.log(error);
      alert("Error fetching user funding list: " + error);
    }

    setUserFundedProjects(res);
  }

  useEffect(() => {
    getProjectList();
  }, []);

  useEffect(() => {
    if (props.userAddress === address) {
      // only executing if visit own profile
      getUserFundingList();
    }
  }, []);

  return (
    <div className="profileContainer">
      <div className="profileHeadingContainer">
        <h1>{name}</h1>
      </div>
      <div className="profileAddressContainer">
        <h2>{address}</h2>
      </div>
      {ongoingProjects.length ? (
        <div className="projectsContainer">
          <div className="projectList">
            <ScrollShowbarComponent
              recentUploads={ongoingProjects}
              heading={"ONGOING PROJECTS"}
              emptyMessage={"No ongoing projects"}
            />
          </div>
        </div>
      ) : (
        ""
      )}
      {completedProjects.length ? (
        <div className="projectsContainer">
          <div className="projectList">
            <ScrollShowbarComponent
              recentUploads={completedProjects}
              heading={"COMPLETED PROJECTS"}
              emptyMessage={"No completed projects"}
            />
          </div>
        </div>
      ) : (
        ""
      )}
      {address === props.userAddress && userFundedProjects.length ? (
        <div className="projectsContainer">
          <div className="projectList">
            <ScrollShowbarComponent
              recentUploads={userFundedProjects}
              heading={"PROJECTS FUNDED"}
              emptyMessage={"No projects funded yet"}
            />
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default ProfileComponent;
