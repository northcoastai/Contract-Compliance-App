import React, { useState } from "react";
import OpenAI from "openai";
import ExcelJS from "exceljs";
import mammoth from "mammoth";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App = () => {
  const [response, setResponse] = useState("");
  const [finalResponse, setFinalResponse] = useState("");
  const [selectedDocxFile, setSelectedDocxFile] = useState(null);
  const [selectedXlsxFile, setSelectedXlsxFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [runningMain, setRunningMain] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [docxContent, setDocxContent] = useState("");
  const [xlsxContent, setXlsxContent] = useState("");

  const handleDocxFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedDocxFile(file);
  };

  const handleXlsxFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedXlsxFile(file);
  };

  const processFiles = async () => {
    if (!selectedDocxFile && !selectedXlsxFile) {
      console.log("Please select at least one file first!");
      return;
    }
    console.log("Processing files...");
    setUserMessage("Processing files...");

    setProcessing(true);

    let docxContent = "";
    let xlsxContent = "";

    if (selectedDocxFile) {
      console.log("Processing docx file...");
      setUserMessage("Processing docx file...");
      docxContent = await parseDocxFile(selectedDocxFile);
      setDocxContent(docxContent);
    }
    if (selectedXlsxFile) {
      console.log("Processing xlsx file...");
      setUserMessage("Processing xlsx file...");
      xlsxContent = await parseXlsxFile(selectedXlsxFile);
      setXlsxContent(xlsxContent);
    }

    setProcessing(false);
    console.log("Files processed successfully!");
    setUserMessage("Files processed successfully!");

    return { docxContent, xlsxContent };
  };

  const parseDocxFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target.result;
        const { value } = await mammoth.extractRawText({ arrayBuffer });
        const formattedValue = value.replace(/\n\s*\n/g, "\n"); // Remove extra empty lines
        resolve(formattedValue);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const parseXlsxFile = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target.result;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        let allContent = "";
        workbook.eachSheet((sheet) => {
          sheet.eachRow((row) => {
            const cellValues = row.values
              .slice(1)
              .map((cell) =>
                cell === undefined || cell === null || cell === ""
                  ? "null"
                  : cell.toString()
              );
            const cellContent = cellValues.join(", ");
            allContent += `${cellContent}\n`;
          });
        });

        resolve(allContent);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const compliancePromptInstructions = `
Task Overview:

Review each item in the 'requirements_processed_file' section. Verify if the conditions are met in the 'contract section'. Ensure this is done iteravely nad independently for each item in the 'requirements_processed_file' section (each item is a different line in the 'requirements_processed_file' section).


Output Requirements:

Provide results for each bullet point from the 'requirements_processed.rtf' file in JSON format. Detail compliance with the contract conditions. Include a short description of how each criterion was met in the contract. Do not provide links in the results.

Details to Include in the Output:

    "Who"
    "What"
    "Where"
    "When"
    "Needs clarification"

Include the section and title of the contract where the criterion was determined. Add an extra bullet point for non-compliance if any issues or vagueness are noted. If a task description violates one or more conditions, specify the reason for the violation.

Compliance Criteria:

    Contract compliance met:
        Yes/No
        Description
        Section and Title

    Contract compliance met with conditions:
        Yes/No
        Description
        Section and Title

    Contract compliance potential issues:
        Yes/No
        Description
        Section and Title

Additional Instructions:

Be descriptive in compliance descriptions as they pertain to the contract. Carefully consider and detail any potential issues for 'Contract compliance potential issues' to alert the user.

Output Format: (note: this is just a template,  you need to return the actual results using this template format)

Return the output as a JSON object structured as follows:

{
"requirements": [
{
"requirement": "[Description of the requirement]",
"details": {
"who": "[Details]",
"what": "[Details]",
"where": "[Details]",
"when": "[Details]",
"needs_clarification": "[Yes/No, and any necessary details]"
},
"contract_compliance_met": {
"yes_no": "[Yes/No]",
"description": "[How the requirement was met or not met in the contract]",
"section_and_title": "[Relevant section and title from the contract]"
},
"contract_compliance_met_with_conditions": {
"yes_no": "[Yes/No]",
"description": "[Conditions under which compliance is met]",
"section_and_title": "[Relevant section and title from the contract]"
},
"contract_compliance_potential_issues": {
"yes_no": "[Yes/No]",
"description": "[Details of potential issues]",
"section_and_title": "[Relevant section and title from the contract]"
}
},
...
]
}
`;

  const processRequirements = `
Instructions: For the first 10 items in 'requirements section', break down the requirements into more specific criteria (e.g., what, where, when, who). only do for fist 10, ignore all after.
	•	Analyze each row separately.
	•	Each row result should contain a who, what, where, when and needs clarification output.
	•	Return the results in point form.
	•	State the criteria (what, where, when, who) for each row item, using 'not specified' if any criteria are missing.
	•	Apply this to each row in the CSV.
	•	I want the results as text outputs in point format, not code.
	•	I want every row of the CSV to be analyzed.
	•	give me results for all 25 rows in the csv
Extra Cases to Consider:
	1	When a Situation Needs Clarification:
	◦	Weekend travel is not a ‘when’ date requirement but a ‘needs clarification’ bullet point.
	◦	Planned and pre-approved is not a ‘when’ but a ‘needs clarification’ bullet point.
	◦	Planned one month in advance is not considered a ‘when’ but a ‘needs clarification’ bullet point.
	◦	If the ‘when’ is related to a ‘where’ (e.g., a season in a city), this is a ‘needs clarification’ bullet point.
	◦	If the what, where, when, or who is vague (e.g., not clearly specified), add as a ‘needs clarification’ bullet point.
	◦	If a where is not clearly defined (e.g., high-risk area), add as a ‘needs clarification’ bullet point.
	◦	Booked for 3 weeks is not a ‘when’ but a ‘needs clarification’ bullet point.
	◦	Do not interpolate for ‘needs clarification’ bullet points; keep the text the same as originally.
	◦	Do not guess the type of “team”; just state the ‘Team’.
	◦	Add a ‘needs clarification’ bullet point when a who, what, where, when is not clearly stated.
	◦	‘High-risk area’ is not a where but a ‘needs clarification’ bullet point.
	◦	Remote Alaska is considered a where = Alaska, but since the location is ‘remote’ and not specified, there would be a ‘needs clarification’ bullet point for the remoteness criterion.
	◦	New markets in Africa is a where = Africa, but since the location is not specified, add a ‘needs clarification’ bullet point to mention the location is not specified, and only labeled as ‘new markets’.
	2	Examples of Who, What, Where, When:
	◦	Engineering team is considered a who, not a what.
	◦	Client workshop is a who = client and what = workshop
	◦	Consider “conferences” and “research trips” in the ‘what’ category.
	◦	Marketing is considered a team, and thus a who.
	◦	Strategy retreat is considered a what.
	◦	Executive meeting is a who = executive team and a what = meeting.
	◦	Development workshop is a what.
	◦	Manufacturing site in Germany would be a where = Germany, but a ‘needs clarification’ bullet point as the site is not specific.
	◦	Annual review would have a when = annually.
	◦	Investor roadshow would have a who = investors and a what = roadshow.
	◦	Site survey is a what.
	◦	Negotiation meeting is a what.
	◦	Business development trip is a what.
	◦	Quarterly executive strategy meeting is a what = ‘executive strategy meeting’ and a when = ‘quarterly’.
	◦	Humanitarian aid project is a what.
	◦	Internal training session is a who = internal team and a what = training session.
`;

  const promptRequirementsProcess =
    processRequirements +
    "    " +
    "This is the requirements section: " +
    JSON.stringify(xlsxContent);

  const openAIKey = import.meta.env.VITE_OPENAI_KEY;

  const openai = new OpenAI({
    apiKey: openAIKey,
    dangerouslyAllowBrowser: true,
  });

  const main = async (docxContent, xlsxContent) => {
    try {
      console.log("Making first API call to process requirements...");
      setUserMessage("Making first API call to process requirements...");

      const promptRequirementsProcess =
        processRequirements +
        "    " +
        "This is the requirements section: " +
        JSON.stringify(xlsxContent);

      console.log(promptRequirementsProcess);

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant designed to output JSON.",
          },
          { role: "user", content: promptRequirementsProcess },
        ],
        model: "gpt-4o",
        response_format: { type: "json_object" },
        max_tokens: 4096,
      });
      const completionResponse = completion.choices[0].message.content;
      setResponse(completionResponse);
      console.log(completionResponse);

      const completionResponse2 =
        completionResponse +
        "   " +
        compliancePromptInstructions +
        "   " +
        JSON.stringify(docxContent);
      console.log(completionResponse2);

      console.log("Making second API call to process contract...");
      setUserMessage("Making second API call to process contract...");
      const secondCompletion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant designed to output JSON.",
          },
          { role: "user", content: completionResponse2 },
        ],
        model: "gpt-4o",
        response_format: { type: "json_object" },
        max_tokens: 4096,
      });
      const finalResponseContent = secondCompletion.choices[0].message.content;
      setFinalResponse(finalResponseContent);
      console.log(finalResponseContent);
    } catch (error) {
      console.error(error);
      setResponse("Error fetching response.");
    }
  };

  const renderJsonContent = (jsonContent) => {
    try {
      const parsedContent = JSON.parse(jsonContent);
      return (
        <div>
          {parsedContent.requirements.map((requirement, index) => (
            <div key={index}>
              <h3>Requirement {index + 1}</h3>
              <p>
                <strong>Description:</strong> {requirement.requirement}
              </p>
              <p>
                <strong>Details:</strong>
              </p>
              <ul>
                <li>
                  <strong>Who:</strong> {requirement.details.who}
                </li>
                <li>
                  <strong>What:</strong> {requirement.details.what}
                </li>
                <li>
                  <strong>Where:</strong> {requirement.details.where}
                </li>
                <li>
                  <strong>When:</strong> {requirement.details.when}
                </li>
                <li>
                  <strong>Needs Clarification:</strong>{" "}
                  {requirement.details.needs_clarification}
                </li>
              </ul>
              <p>
                <strong>Contract Compliance Met:</strong>
              </p>
              <ul>
                <li>
                  <strong>Yes/No:</strong>{" "}
                  {requirement.contract_compliance_met.yes_no}
                </li>
                <li>
                  <strong>Description:</strong>{" "}
                  {requirement.contract_compliance_met.description}
                </li>
                <li>
                  <strong>Section and Title:</strong>{" "}
                  {requirement.contract_compliance_met.section_and_title}
                </li>
              </ul>
              <p>
                <strong>Contract Compliance Met with Conditions:</strong>
              </p>
              <ul>
                <li>
                  <strong>Yes/No:</strong>{" "}
                  {requirement.contract_compliance_met_with_conditions.yes_no}
                </li>
                <li>
                  <strong>Description:</strong>{" "}
                  {requirement.contract_compliance_met_with_conditions
                    .description}
                </li>
                <li>
                  <strong>Section and Title:</strong>{" "}
                  {requirement.contract_compliance_met_with_conditions
                    .section_and_title}
                </li>
              </ul>
              <p>
                <strong>Contract Compliance Potential Issues:</strong>
              </p>
              <ul>
                <li>
                  <strong>Yes/No:</strong>{" "}
                  {requirement.contract_compliance_potential_issues.yes_no}
                </li>
                <li>
                  <strong>Description:</strong>{" "}
                  {requirement.contract_compliance_potential_issues.description}
                </li>
                <li>
                  <strong>Section and Title:</strong>{" "}
                  {requirement.contract_compliance_potential_issues
                    .section_and_title}
                </li>
              </ul>
            </div>
          ))}
        </div>
      );
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return <p>Error parsing JSON response.</p>;
    }
  };

  const processAndRunMain = async () => {
    setRunningMain(true);
    const { docxContent, xlsxContent } = await processFiles();
    await main(docxContent, xlsxContent);
    setRunningMain(false);
  };

  return (
    <div className="App">
      <div className="app-container">
        <div className="app-heading">
          <h1 className="mb-4">OpenAI Chat</h1>
          <p>
            Use this interface to process a contract and requirements using Open
            AI and receive a txt/json summary.{" "}
          </p>
        </div>
        <div className="inputs-container">
          <div className="file-inputs">
            <h3>Upload Files</h3>
            <p>Upload a contract file (.docx format only):</p>

            <div className="input-group mb-2">
              <input
                type="file"
                accept=".docx"
                className="form-control"
                onChange={handleDocxFileChange}
              />
            </div>
            <p>Upload a requirements file (.xlsx format only)</p>

            <div className="input-group mb-2">
              <input
                type="file"
                accept=".xlsx"
                className="form-control"
                onChange={handleXlsxFileChange}
              />
            </div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={processAndRunMain}>
          Process Files and Get Response
        </button>
        <div className="mb-3">
          <p>{response}</p>
          {finalResponse && renderJsonContent(finalResponse)}
        </div>
      </div>
      {runningMain && (
        <div className="modal">
          <div className="modal-content">
            <div className="spinner"></div>
            <p className="mt-3">{userMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
