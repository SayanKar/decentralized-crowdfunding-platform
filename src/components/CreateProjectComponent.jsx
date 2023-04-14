import { useState } from "react";
import { create } from "ipfs-http-client";
import { Web3Storage } from 'web3.storage';

function CreateProjectComponent(props) {
  const [formInput, setFormInput] = useState({
    category: "",
    projectName: "",
    description: "",
    creatorName: "",
    image: "",
    link: "",
    goal: 0.00001,
    duration: 1,
    refundPolicy: "",
  });

  const [inputImage, setInputImage] = useState(null);

  // set the form input state if input changes
  function handleChange(e) {
    let name = e.target.name;
    let value = e.target.value;
    formInput[name] = value;
    setFormInput(formInput);
  }

  // read the input image file provided and set its corresponding state
  async function handleImageChange(e) {
    // read the file content on change
    setInputImage(document.querySelector('input[type="file"]'));
    console.log(document.querySelector('input[type="file"]'));
  }

  // return category code
  function getCategoryCode() {
    let categoryCode = {
      "design and tech": 0,
      film: 1,
      arts: 2,
      games: 3,
    };
    return categoryCode[formInput["category"]];
  }

  // return refund policy code
  function getRefundPolicyCode() {
    let refundCode = {
      refundable: 0,
      "non-refundable": 1,
    };
    return refundCode[formInput["refundPolicy"]];
  }

  // submit the form input data to smart contract
  async function submitProjectData(e) {
    // handle the submit action of the form
    const client = new Web3Storage({ token: process.env.WEB3_STORAGE_API_TOKEN });
    e.preventDefault();
    if (inputImage) {
      try {
        console.log("InputImages", inputImage.files);
        const cid = await client.put(inputImage.files, {
          name: "Project Image",
          maxRetries: 3,
        });
        console.log(cid);
        formInput["image"] = `ipfs.io/ipfs/${cid}/${inputImage.files[0].name}`;
      } catch (error) {
        alert("Uploading file error: " + error);
        console.log(error);
        // return since if selected image doesn't get uploaded to ipfs
        return;
      }
    }

    // check for double submit (since the formInput['category']) is changed to integer on first submit
    // if not checked, second submit gives undefined value since getCategoryCode() doesn't have any mapping for integer code.
    if (!Number.isInteger(formInput["category"])) {
      formInput["category"] = getCategoryCode();
    }
    // same reason as above
    if (!Number.isInteger(formInput["refundPolicy"])) {
      formInput["refundPolicy"] = getRefundPolicyCode();
    }

    formInput["duration"] = parseFloat(formInput["duration"]);
    formInput["goal"] = parseFloat(formInput["goal"]);

    console.log(formInput);

    // upload form data to contract
    let txn;
    try {
      txn = await props.contract.createNewProject(
        formInput["projectName"],
        formInput["description"],
        formInput["creatorName"],
        formInput["link"],
        formInput["image"],
        formInput["goal"],
        formInput["duration"],
        formInput["category"],
        formInput["refundPolicy"]
      );

      await txn.wait(txn);
      alert("Project creation complete!!");
      document.getElementsByName("projectForm")[0].reset();
      return false;
    } catch (error) {
      alert("Error on calling function: " + error);
      console.log(error);
    }
  }

  return (
    // onSubmit function to do further operation with form data --> not defined yet
    <div className="create-form">
      <form method="post" onSubmit={submitProjectData} name="projectForm">
        <h1>Create Project</h1>
        <label>Category</label>
        <select name="category" required onChange={handleChange}>
          <option value="" selected disabled hidden>
            Select category
          </option>
          <option value="design and tech">Design and Tech</option>
          <option value="film">Film</option>
          <option value="arts">Arts</option>
          <option value="games">Games</option>
        </select>
        <label>Project Name</label>
        <input
          name="projectName"
          placeholder="Enter the project name"
          required
          onChange={handleChange}
        />
        <label>Project Description</label>
        <textarea
          name="description"
          placeholder="Enter project description"
          cols="50"
          rows="5"
          required
          onChange={handleChange}
        />
        <label>Creator Name</label>
        <input
          name="creatorName"
          placeholder="Enter Creator Name"
          required
          onChange={handleChange}
        />
        <label>Upload Project Image</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
        />
        <p className="caution">*Image of resolution 1920x1080 is preffered for better display</p>
        <label>Project Link</label>
        <input
          type="url"
          name="link"
          placeholder="Enter link to the project"
          onChange={handleChange}
        />
        <label>Funding Goal (AVAX)</label>
        <input
          type="number"
          step="1"
          name="goal"
          placeholder="Enter the funding goal"
          min="1"
          required
          onChange={handleChange}
        />
        <label>Duration (Minutes)</label>
        <input
          type="number"
          name="duration"
          placeholder="Enter the duration for the funding"
          min="1"
          required
          onChange={handleChange}
        />
        <label>Refund policy</label>
        <select name="refundPolicy" required onChange={handleChange}>
          <option value="" selected disabled hidden>
            Select Refund type
          </option>
          <option value="refundable">Refundable</option>
          <option value="non-refundable">Non-Refundable</option>
        </select>
        <input type="submit" className="submitButton" value="Submit" />
      </form>
    </div>
  );
}

export default CreateProjectComponent;
