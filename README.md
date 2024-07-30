# Contract Requirements App
Application for processing contracts and requirements using AI and returning tailored and formated output.

## Setup Instructions:

## 1. Clone Repository/Open Code Editor:
Choose a directory to clone the repository and use the following command:

```git clone https://github.com/northcoastai/Contract-Requirements-App-GenAI.git```

Open the respository in your code editor of choice, this tutorial uses Visual Code Studio.

## 2. Dependencies:
To get the application working you must first run the following command to add node.js dependencies:

```npm install mammoth openai exceljs bootstrap vite```

## 3. Environment Variables:

Prior to running the program, you will need to set up your environment variables using a .env file.
### Create Env File:
To create the template .env file, run one of the two following commands in terminal while in your root directory:
#### Linux
```echo -e "# Add your openAi API key after the '=' sign without any quotes\nVITE_OPENAI_KEY=" > .env```

#### Powershell
```Add-Content -Path .env -Value "# Add your openAi API key after the '=' sign without any quotes`nVITE_OPENAI_KEY="```

### Add OpenAi Key to .env file:
Open the .env file and copy/paste your API key after the equals sign:
![image](https://github.com/user-attachments/assets/fafbb43a-4d2b-4f95-8958-1bf8d55086b8)

## 4. Run/Build
To run or build vite/react app use the following commmands (build is only required for deployment):

```npm run dev```
```npm run build```

*** WARNING !!!

You may get a warning "failed to load vite config", this error should not affect running the application:

![image](https://github.com/user-attachments/assets/84604368-a527-4733-9481-7744c9041945)

## 5. Opening the Dev Environment:
### Windows:
To open the application in the browser hold ctrl+click the link
### Mac:
To open the application in the browser hold command+click the link (Mac)
![image](https://github.com/user-attachments/assets/bbab5138-337b-42f9-bacd-d62536d9f36e)

