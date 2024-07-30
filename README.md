
# App Logic


1) User uses upload button to select and upload contract docx file

<br>

2) User uses upload button to select and upload requirements xlsx file

<br>

3) User presses 'Process files and get response' button

<br>

4) The app prepares the 2 data source inputs to be ready for sending to openai API calls.

<br>

5) The app makes the first openAI gpt-4o model api call sending the raw requirements data. This api content contains 1) a hand crafted prompt designed to extract the relevant data from raw requirements data,  removing noise and 'teaching' it what to look for. This step ensures the resulting api call returns relevent data.

```const promptRequirementsProcess = processRequirements + '	' + "This is the requirements section: " + JSON.stringify(xlsxContent);```
<br>

6) The results from the first openai api call is combined with the prepped contract docx data and this is sent to a second openAI API call. 

```const completionResponse2 = completionResponse + '   ' + compliancePromptInstructions + '   ' + JSON.stringify(docxContent);```



This second call forces the llm to consider the newly ‘cleaned’ requirements in addition to the raw contract text,  looping through each requirement to fill the following information in a custom template I developed.
```
‘{
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
}’
```

<br>
The resulting api returns a json object that contains nested json for each requirement
<br>
<br>
7) The resulting raw json is rendered in the app,  and a ‘nice’ formatted version for the json is also rendered (may need to wait for the app to complete to see.

<br>

## Note:
I limited the results to the first 10 requirement items to save processing time,  but this could be easily undone and batched to speed up response time.
 
  
<br>

## Setup Instructions:

<br>

### 1. Clone Repository:
Choose a directory to clone the repository and use the following command:

```git clone https://github.com/northcoastai/Contract-Compliance-App.git```

Open the respository in your code editor of choice, this tutorial uses Visual Code Studio.

<br>

### 2. Dependencies:
To get the application working you must first run the following command to add node.js dependencies:

```cd Contract-Compliance-App```
<br>
```npm install mammoth openai exceljs bootstrap vite```

<br>

### 3. Environment Variables:

To power the app,  you need to create a env file and add your openai api key. Instrucions below)

<br>

### Create Env File - Linux 
```echo -e "# Add your openAi API key after the '=' sign without any quotes\nVITE_OPENAI_KEY=" > .env```

### Create Env File - Powershell
```Add-Content -Path .env -Value "# Add your openAi API key after the '=' sign without any quotes`nVITE_OPENAI_KEY="```
<br>

### Add OpenAi Key to .env file:
Open the .env file you just creted and copy/paste your openai API key after the equals sign (no quotes)
![image](https://github.com/user-attachments/assets/fafbb43a-4d2b-4f95-8958-1bf8d55086b8)

<br>

### 4. Run app

```npm run dev```


### 5. Open app in browser:
copy local link from terminal to browser
<br>
### Windows:
To open the application in the browser hold ctrl+click the link
### Mac:
To open the application in the browser hold command+click the link (Mac)


