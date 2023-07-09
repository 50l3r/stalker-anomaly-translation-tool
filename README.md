# Stalker Anomaly Translation Tool (SATT)

SATT is an automatic translation tool for text files from S.T.A.L.K.E.R. Anomaly mod.

The tool can translate base game files and mod files, for this, this tool make uses of OpenAI API and Directus as BaaS (Backend as a Service) to be able to storage the data from the text files and translate.

It´s possible to translate from other languages 😁

## Content

- [Dependencies](#dependencies)
- [Directus](#directus)
- [Installation](#installation)
- [Use](#use)

## Dependencies

You need the following requirements:

- NodeJS: v16 or later
- Directus: v9 or later. [Read more](https://docs.directus.io/).
- OpenAI API: v1.0.0 or later. [Read more](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key)

## Directus

Directus is used as BasS (Backend as a Service) to storage data from text files and translate later. You need to create a new project and configure the database, you can do this using a cloud service or self-hosted.[Read more](https://docs.directus.io/)

### Collection

You will need a collection called "Translations" with the following fields:

- **id:** integer
- **user_created:** string
- **user_updated:** string
- **date_created:** datetime
- **date_updated:** datetime
- **filename:** string (required)
- **key:** string (required)
- **value_en:** string (required)
- **value_es:** string (required)
- **status:** enum (Aprobado, Pendiente)

## Installation

To install dependencies:

```sh
npm install
```

Create the `.env` file with the following:

```sh
OPENAI_API_KEY="OpenAI Api key"

DIRECTUS_URL="Directus API URL"
DIRECTUS_STATIC_TOKEN="Directus API Token"

MODS_FOLDER="Path to MO2 mod folder"

SOURCE_LANGUAGE_KEY=eng
SOURCE_LANGUAGE=english

TARGET_LANGUAGE_KEY=spa
TARGET_LANGUAGE=spanish

```

**Note: Source language and target language can be changed based on your preferences, but remember, you must create the folders inside `src/data/`.**

## Use

The following example shows how to use the tool when you need to translate from `English` to `Spanish`.

### 1. XML files from mods

```sh
npm run copy:mods
```

Copy the files from MO2 mods folder, defined on `MODS_FOLDER` from `.env` file, to `src/data/eng/mods`

### 2. Translate base files from game

```sh
npm run translate
```

Translate base files from game, XML files must be on `src/data/eng/base`, and then store translated files on Directus database.

### 3. Translate mods files

```sh
npm run translate:mods
```

Translate mods files, XML files must be on `src/data/eng/mods`, and then store translated files on Directus database.

### 3. Generado de ficheros

```sh
npm run build
```

This command merge all translated files stored on database and generate the XML files on `src/data/spa`.


**Credits to:** Luis Sandoval
